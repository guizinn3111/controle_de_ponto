/*
  Lançamento de horas extras
  Somente admin · Campo livre · Aparece na folha
*/

var HORAS_EXTRAS = [];

/* Carrega do servidor */
async function carregarHorasExtras() {
  HORAS_EXTRAS = await apiRequest('horas_extras.php');
  return HORAS_EXTRAS;
}

/* Retorna horas extras de um colaborador num dia */
function getHorasExtras(colabId, data) {
  var resultado = [];
  for (var i = 0; i < HORAS_EXTRAS.length; i++) {
    if (HORAS_EXTRAS[i].colabId === colabId && HORAS_EXTRAS[i].data === data) {
      resultado.push(HORAS_EXTRAS[i]);
    }
  }
  return resultado;
}

/*  Abre modal */
function abrirModalHorasExtras(colabId, data) {
  if (typeof PERFIL_ATUAL === 'undefined' || PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode lançar horas extras.');
    return;
  }

  document.getElementById('heColabId').value          = colabId;
  document.getElementById('heData').value             = data;
  document.getElementById('heQuantidade').value       = '';
  document.getElementById('heMotivo').value           = '';
  document.getElementById('heTitulo').textContent     = 'Horas Extras — ' + data;

  renderListaHE(colabId, data);

  document.getElementById('heModal').style.display = 'flex';
  document.getElementById('heQuantidade').focus();
}

/*Renderiza lista de extras já lançadas */
function renderListaHE(colabId, data) {
  var lista = getHorasExtras(colabId, data);
  var el    = document.getElementById('heListaExistente');
  if (!el) return;

  if (!lista.length) {
    el.innerHTML = '';
    return;
  }

  var html = '<div class="he-lista-titulo">Extras já lançadas neste dia:</div>';
  for (var i = 0; i < lista.length; i++) {
    var item = lista[i];
    html +=
      '<div class="he-lista-item">' +
        '<span><strong>' + item.quantidade + '</strong> — ' + item.motivo + '</span>' +
        '<button class="btn-rm-he" onclick="removerHE(\'' + item.id + '\',' + colabId + ',\'' + data + '\')">✕</button>' +
      '</div>';
  }
  el.innerHTML = html;
}

/* Parser de quantidade SEM regex  */
/*
   Formatos aceitos:
   2h30  →  2 horas e 30 minutos
   1h    →  1 hora
   0h45  →  45 minutos
   2:30  →  2 horas e 30 minutos
   1,5   →  90 minutos
   1.5   →  90 minutos
   90    →  90 minutos
*/
function parseHE(str) {
  if (!str) return null;

  str = str.trim().toLowerCase();

  /* troca vírgula por ponto para decimais */
  var strNorm = '';
  for (var k = 0; k < str.length; k++) {
    strNorm += (str[k] === ',') ? '.' : str[k];
  }

  /* formato Xh ou XhYY */
  var idxH = strNorm.indexOf('h');
  if (idxH !== -1) {
    var hStr = strNorm.substring(0, idxH);
    var mStr = strNorm.substring(idxH + 1);
    var hVal = parseInt(hStr, 10);
    var mVal = (mStr.length > 0) ? parseInt(mStr, 10) : 0;
    if (!isNaN(hVal) && !isNaN(mVal) && mVal >= 0 && mVal < 60) {
      return hVal * 60 + mVal;
    }
    return null;
  }

  /* formato X:YY */
  var idxC = strNorm.indexOf(':');
  if (idxC !== -1) {
    var h2Str = strNorm.substring(0, idxC);
    var m2Str = strNorm.substring(idxC + 1);
    var h2Val = parseInt(h2Str, 10);
    var m2Val = parseInt(m2Str, 10);
    if (!isNaN(h2Val) && !isNaN(m2Val) && m2Val >= 0 && m2Val < 60) {
      return h2Val * 60 + m2Val;
    }
    return null;
  }

  /* formato decimal X.Y */
  var idxP = strNorm.indexOf('.');
  if (idxP !== -1) {
    var fVal = parseFloat(strNorm);
    if (!isNaN(fVal) && fVal > 0) {
      return Math.round(fVal * 60);
    }
    return null;
  }

  /* apenas número inteiro → minutos */
  var nVal = parseInt(strNorm, 10);
  if (!isNaN(nVal) && nVal > 0) return nVal;

  return null;
}

/*  Salva horas extras  */
async function salvarHorasExtras() {
  var colabId    = parseInt(document.getElementById('heColabId').value, 10);
  var data       = document.getElementById('heData').value;
  var quantidade = document.getElementById('heQuantidade').value.trim();
  var motivo     = document.getElementById('heMotivo').value.trim();

  if (!quantidade) {
    alert('Informe a quantidade de horas extras.');
    document.getElementById('heQuantidade').focus();
    return;
  }
  if (!motivo) {
    alert('Informe o motivo das horas extras.');
    document.getElementById('heMotivo').focus();
    return;
  }

  var mins = parseHE(quantidade);
  if (mins === null || mins <= 0) {
    alert('Formato inválido.\nUse: 2h30, 1h, 0h45, 2:30, 1,5 ou 90');
    document.getElementById('heQuantidade').focus();
    return;
  }

  try {
    var resp = await apiRequest('horas_extras.php', {
      method: 'POST',
      body: JSON.stringify({ colabId, data, quantidade, minutos: mins, motivo })
    });

    HORAS_EXTRAS.push({
      id:         resp.id,
      colabId:    colabId,
      data:       data,
      quantidade: quantidade,
      minutos:    mins,
      motivo:     motivo,
      criadoEm:  new Date().toISOString()
    });

    renderListaHE(colabId, data);

    document.getElementById('heQuantidade').value = '';
    document.getElementById('heMotivo').value     = '';
    document.getElementById('heQuantidade').focus();

    if (typeof renderRelatorio === 'function') renderRelatorio();

  } catch (e) {
    alert('Erro ao salvar horas extras: ' + e.message);
  }
}

/* Remove uma hora extra */
async function removerHE(id, colabId, data) {
  if (!confirm('Remover este lançamento de hora extra?')) return;

  try {
    await apiRequest('horas_extras.php?id=' + encodeURIComponent(id), { method: 'DELETE' });

    var novaLista = [];
    for (var i = 0; i < HORAS_EXTRAS.length; i++) {
      if (HORAS_EXTRAS[i].id !== id) novaLista.push(HORAS_EXTRAS[i]);
    }
    HORAS_EXTRAS = novaLista;

    renderListaHE(colabId, data);

    if (typeof renderRelatorio === 'function') renderRelatorio();

  } catch (e) {
    alert('Erro ao remover horas extras: ' + e.message);
  }
}

/* Total de HE de um colaborador num dia  */
function totalHEminutos(colabId, data) {
  var lista = getHorasExtras(colabId, data);
  var total = 0;
  for (var i = 0; i < lista.length; i++) {
    total += lista[i].minutos;
  }
  return total;
}

/* Fecha modal */
function fecharModalHE() {
  document.getElementById('heModal').style.display = 'none';
}

/* Fecha ao clicar fora do modal */
window.addEventListener('click', function(e) {
  var modal = document.getElementById('heModal');
  if (modal && e.target === modal) fecharModalHE();
});
