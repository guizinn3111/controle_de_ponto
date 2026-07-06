
function processarBatidas() {

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

  /* Passo 2: agrupa por colaborador + data */
  /* Chave: nomeReconhecido + data */
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

  /* Passo 3: salva no banco */
  var adicionados    = 0;
  var duplicatas     = 0;
  var naoReconhecidos = [];

  /* coleta nomes nao reconhecidos */
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

  var chaves = Object.keys(grupos);
  var k      = 0;

  for (k = 0; k < chaves.length; k++) {
    var g = grupos[chaves[k]];

    /* ordena os horarios do dia */
    g.horarios.sort();

    /* verifica duplicata */
    var dup = false;
    var j   = 0;
    for (j = 0; j < REGISTROS.length; j++) {
      if (REGISTROS[j].colabId === g.colabId &&
          REGISTROS[j].data   === g.data) {
        dup = true;
        break;
      }
    }

    if (dup) {
      duplicatas++;
      continue;
    }

    REGISTROS.push({
      id:      gerarId(),
      colabId: g.colabId,
      data:    g.data,
      batidas: g.horarios
    });

    adicionados++;
  }

  saveRegistros();
  populateSelects();
  renderRelatorio();
  mostrarResultado(adicionados, duplicatas, naoReconhecidos);
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
function mostrarResultado(adicionados, duplicatas, naoReconhec) {
  var res = document.getElementById('importResult');
  if (!res) return;

  res.classList.add('show');

  var html = '';
  var i    = 0;

  if (adicionados > 0) {
    html += '<p style="color:#10b981;font-weight:700;margin-bottom:8px">';
    html += '&#10003; ' + adicionados + ' dia(s) importado(s) com sucesso.';
    html += '</p>';
  } else {
    html += '<p style="color:#64748b;margin-bottom:8px">';
    html += 'Nenhum registro novo foi adicionado.';
    html += '</p>';
  }

  if (duplicatas > 0) {
    html += '<p style="color:#f59e0b;margin-bottom:8px">';
    html += '&#9888; ' + duplicatas + ' dia(s) ignorado(s) - ja existiam.';
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
    html += 'Adicione o apelido em js/data.js no campo apelidos.';
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

/*
  GERA ID UNICO
 */
function gerarId() {
  var ts  = Date.now().toString();
  var rnd = Math.floor(Math.random() * 999999).toString();
  return ts + '-' + rnd;
}