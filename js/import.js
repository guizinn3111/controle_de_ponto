/*
  Trava simples contra clique duplo / processamento concorrente
 */
var _processandoBatidas = false;

async function processarBatidas() {

  if (_processandoBatidas) return; // ignora cliques repetidos enquanto processa
  _processandoBatidas = true;

  var btn = document.getElementById('btnProcessar');
  var textoOriginalBtn = null;
  if (btn) {
    textoOriginalBtn = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Processando...';
  }

  try {
    await _processarBatidasInterno();
  } finally {
    _processandoBatidas = false;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = textoOriginalBtn;
    }
  }
}

async function _processarBatidasInterno() {

  var el = document.getElementById('rawInput');
  if (!el) return;

  var raw = el.value.trim();
  if (raw.length === 0) {
    alert('Cole as batidas brutas antes de processar.');
    return;
  }

  /* divide em linhas e remove vazias */
  var linhasBrutas = raw.split('\n');
  var linhas       = [];
  var i            = 0;

  for (i = 0; i < linhasBrutas.length; i++) {
    var lt = linhasBrutas[i].trim();
    if (lt.length > 0) linhas.push(lt);
  }

  /* Passo 1: extrai todos os registros brutos */
  /* Cada linha tem: ID  X  COD  NOME  X  X  DATA  HORA  */
  var registrosBrutos = [];

  for (i = 0; i < linhas.length; i++) {
    var rec = parseLinhaPonto(linhas[i]);
    if (rec) registrosBrutos.push(rec);
  }

  if (registrosBrutos.length === 0) {
    mostrarResultado(0, 0, 0, []);
    alert('Nenhuma linha reconhecida como batida válida. Confira o formato do texto colado.');
    return;
  }

  /* Passo 2: agrupa por colaborador + data */
  /* Chave: colabId + data */
  var grupos = {};

  for (i = 0; i < registrosBrutos.length; i++) {
    var rb    = registrosBrutos[i];
    var colab = encontrarColaborador(rb.nome);
    if (!colab) continue;

    var chave = colab.id + '|' + rb.data;
    if (!grupos[chave]) {
      grupos[chave] = {
        colabId: colab.id,
        data:    rb.data,
        horarios: []
      };
    }
    grupos[chave].horarios.push(rb.hora);
  }

  /* Passo 3: coleta nomes não reconhecidos (sem duplicar na lista) */
  var naoReconhecidos = [];

  for (i = 0; i < registrosBrutos.length; i++) {
    var rb2   = registrosBrutos[i];
    var achou = encontrarColaborador(rb2.nome);
    if (!achou) {
      var jaListado = false;
      var n         = 0;
      for (n = 0; n < naoReconhecidos.length; n++) {
        if (naoReconhecidos[n] === rb2.nome) {
          jaListado = true;
          break;
        }
      }
      if (!jaListado) naoReconhecidos.push(rb2.nome);
    }
  }

  /* Passo 4: dedupe local dentro do próprio lote colado */
  var chaves = Object.keys(grupos);
  for (i = 0; i < chaves.length; i++) {
    grupos[chaves[i]].horarios = dedupeHorarios(grupos[chaves[i]].horarios);
  }

  /* Passo 5: envia pro servidor, que faz o MERGE dia a dia
     (evita "sumiço" de horários quando o mesmo dia é reimportado
     com batidas novas) */
  var gruposArray = chaves.map(function(k) { return grupos[k]; });

  try {
    var resultado = await apiRequest('registros.php', {
      method: 'POST',
      body: JSON.stringify({ grupos: gruposArray })
    });

    await carregarRegistros();
    populateSelects();
    renderRelatorio();
    mostrarResultado(
      resultado.adicionados,
      resultado.atualizados,
      resultado.semMudanca,
      naoReconhecidos,
      true
    );

  } catch (e) {
    mostrarResultado(0, 0, 0, naoReconhecidos, false);
    alert('Erro ao salvar no servidor: ' + e.message);
  }
}

/*
  Remove horários duplicados de um array e retorna ordenado
 */
function dedupeHorarios(lista) {
  var vistos = {};
  var resultado = [];
  var i = 0;
  for (i = 0; i < lista.length; i++) {
    if (!vistos[lista[i]]) {
      vistos[lista[i]] = true;
      resultado.push(lista[i]);
    }
  }
  resultado.sort();
  return resultado;
}

/*
  PARSE DE UMA LINHA DO RELOGIO
  Formato: 29590 12 8 SERGIO 0 1 2026/06/26 06:46:59
  Retorna: { nome, data, hora } ou null
 */
function parseLinhaPonto(linha) {

  if (!linha || linha.length === 0) return null;

  /* divide por espacos multiplos ou tab */
  var partes = linha.split(/\s+/);

  /* precisa ter pelo menos 8 partes */
  if (partes.length < 8) return null;

  /* verifica se a primeira parte e um numero (ID do registro) */
  if (isNaN(parseInt(partes[0], 10))) return null;

  /* ── Encontra a data no formato AAAA/MM/DD ── */
  var dataIdx  = -1;
  var horaIdx  = -1;
  var i        = 0;

  for (i = 0; i < partes.length; i++) {
    if (ehDataAAAMMDD(partes[i])) {
      dataIdx = i;
      horaIdx = i + 1;
      break;
    }
  }

  if (dataIdx === -1 || horaIdx >= partes.length) return null;

  /*  Extrai data e converte para DD/MM/AAAA  */
  var dataRaw  = partes[dataIdx];
  var horaRaw  = partes[horaIdx];
  var dataNorm = converterData(dataRaw);

  if (!dataNorm) return null;
  if (!ehHorario(horaRaw)) return null;

  /* Extrai o nome (tudo entre a parte 3 e a data) */
  /* partes[0]=ID partes[1]=X partes[2]=COD partes[3..dataIdx-1]=NOME */
  var partesNome = [];
  for (i = 3; i < dataIdx; i++) {
    /* ignora partes que sao apenas numeros (0 ou 1) */
    if (!isNaN(parseInt(partes[i], 10)) && partes[i].length <= 2) continue;
    partesNome.push(partes[i]);
  }

  if (partesNome.length === 0) return null;

  var nome = partesNome.join(' ').trim();
  if (nome.length === 0) return null;

  /* hora no formato HH:MM (sem segundos para simplificar) */
  var hora = horaRaw.substring(0, 5);

  return {
    nome: nome,
    data: dataNorm,
    hora: hora
  };
}

/* 
  VERIFICA SE STRING E DATA AAAA/MM/DD
 */
function ehDataAAAMMDD(str) {
  if (!str || str.length !== 10) return false;
  if (str.charAt(4) !== '/') return false;
  if (str.charAt(7) !== '/') return false;
  var a = parseInt(str.substring(0, 4), 10);
  var m = parseInt(str.substring(5, 7), 10);
  var d = parseInt(str.substring(8, 10), 10);
  if (isNaN(a) || isNaN(m) || isNaN(d)) return false;
  if (a < 2000 || a > 2100) return false;
  if (m < 1 || m > 12)      return false;
  if (d < 1 || d > 31)      return false;
  return true;
}

/*
  CONVERTE AAAA/MM/DD PARA DD/MM/AAAA
 */
function converterData(dataRaw) {
  if (!ehDataAAAMMDD(dataRaw)) return null;
  var a = dataRaw.substring(0, 4);
  var m = dataRaw.substring(5, 7);
  var d = dataRaw.substring(8, 10);
  return d + '/' + m + '/' + a;
}

/*
   VERIFICA SE TOKEN E HORARIO HH:MM ou HH:MM:SS
*/
function ehHorario(token) {
  if (!token)           return false;
  if (token.length < 5) return false;
  if (token.charAt(2) !== ':') return false;
  var h = parseInt(token.substring(0, 2), 10);
  var m = parseInt(token.substring(3, 5), 10);
  if (isNaN(h) || isNaN(m)) return false;
  if (h < 0 || h > 23)      return false;
  if (m < 0 || m > 59)      return false;
  return true;
}

/* 
   BUSCA COLABORADOR POR NOME OU APELIDO
 */
function encontrarColaborador(texto) {
  if (!texto) return null;
  var t = texto.toUpperCase().trim();
  if (t.length < 3) return null;

  var i = 0;
  var j = 0;

  /* camada 1: nome completo exato */
  for (i = 0; i < COLABORADORES.length; i++) {
    if (COLABORADORES[i].nome.toUpperCase() === t) {
      return COLABORADORES[i];
    }
  }

  /* camada 2: apelido exato */
  for (i = 0; i < COLABORADORES.length; i++) {
    for (j = 0; j < COLABORADORES[i].apelidos.length; j++) {
      if (COLABORADORES[i].apelidos[j].toUpperCase() === t) {
        return COLABORADORES[i];
      }
    }
  }

  /* camada 3: nome contem o texto (min 5 chars) */
  if (t.length >= 5) {
    for (i = 0; i < COLABORADORES.length; i++) {
      if (COLABORADORES[i].nome.toUpperCase().indexOf(t) !== -1) {
        return COLABORADORES[i];
      }
    }
  }

  /* camada 4: apelido contem texto ou vice-versa (min 4 chars) */
  if (t.length >= 4) {
    for (i = 0; i < COLABORADORES.length; i++) {
      for (j = 0; j < COLABORADORES[i].apelidos.length; j++) {
        var ap = COLABORADORES[i].apelidos[j].toUpperCase();
        if (ap.indexOf(t) !== -1) return COLABORADORES[i];
        if (t.indexOf(ap) !== -1) return COLABORADORES[i];
      }
    }
  }

  return null;
}

/* 
  EXIBE RESULTADO DA IMPORTACAO
 */
function mostrarResultado(adicionados, atualizados, semMudanca, naoReconhec, salvouOk) {
  var res = document.getElementById('importResult');
  if (!res) return;

  res.classList.add('show');

  var html = '';
  var i    = 0;

  if (salvouOk === false) {
    html += '<p style="color:#dc2626;font-weight:700;margin-bottom:8px">';
    html += '&#10060; ERRO AO SALVAR! Os dados processados abaixo podem se perder se você recarregar a página. ';
    html += 'Veja o alerta que apareceu na tela.';
    html += '</p>';
  }

  if (adicionados > 0) {
    html += '<p style="color:#10b981;font-weight:700;margin-bottom:8px">';
    html += '&#10003; ' + adicionados + ' dia(s) novo(s) importado(s) com sucesso.';
    html += '</p>';
  }

  if (atualizados > 0) {
    html += '<p style="color:#3b82f6;font-weight:700;margin-bottom:8px">';
    html += '&#8635; ' + atualizados + ' dia(s) já existente(s) foram atualizados com novos horários.';
    html += '</p>';
  }

  if (semMudanca > 0) {
    html += '<p style="color:#f59e0b;margin-bottom:8px">';
    html += '&#9888; ' + semMudanca + ' dia(s) ignorado(s) - batidas idênticas já existiam.';
    html += '</p>';
  }

  if (adicionados === 0 && atualizados === 0 && semMudanca === 0) {
    html += '<p style="color:#64748b;margin-bottom:8px">';
    html += 'Nenhum registro processado.';
    html += '</p>';
  }

  if (naoReconhec.length > 0) {
    html += '<div style="margin-top:12px;padding:12px;background:#fff7ed;';
    html += 'border:1px solid #fed7aa;border-radius:8px">';
    html += '<p style="color:#92400e;font-weight:700;margin-bottom:8px">';
    html += '&#9888; Nomes nao reconhecidos no cadastro:</p>';
    for (i = 0; i < naoReconhec.length; i++) {
      html += '<span class="warn-badge">' + naoReconhec[i] + '</span> ';
    }
    html += '<p style="margin-top:10px;font-size:12px;color:#92400e">';
    html += 'Cadastre o apelido na edição do colaborador.';
    html += '</p>';
    html += '</div>';
  }

  res.innerHTML = html;
}

/*
  LIMPA O CAMPO DE IMPORTACAO
 */
function clearImport() {
  var el  = document.getElementById('rawInput');
  var res = document.getElementById('importResult');
  if (el)  el.value = '';
  if (res) {
    res.classList.remove('show');
    res.innerHTML = '';
  }
}
