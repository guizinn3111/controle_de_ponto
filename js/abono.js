/* 
  ABONO.JS — Abono de faltas e atrasos
  Somente admin · Motivo obrigatório
  Não altera nenhuma outra função do sistema
 */

var ABONOS = [];

/* Carrega do servidor */
async function carregarAbonos() {
  ABONOS = await apiRequest('abonos.php');
  return ABONOS;
}

/* Verifica se uma data já tem abono */
function getAbono(colabId, data) {
  return ABONOS.find(function(a) {
    return a.colabId === colabId && a.data === data;
  }) || null;
}

/* Abre o modal de abono */
function abrirModalAbono(colabId, data, tipo) {

  /* Só admin pode abonar */
  if (typeof PERFIL_ATUAL === 'undefined' || PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode registrar abonos.');
    return;
  }

  /* Preenche os campos ocultos do modal */
  document.getElementById('abonoColabId').value = colabId;
  document.getElementById('abonoData').value    = data;
  document.getElementById('abonoTipo').value     = tipo;
  document.getElementById('abonoMotivo').value   = '';

  /* Título dinâmico */
  var tipoLabel = tipo === 'falta' ? 'Falta' : 'Atraso';
  document.getElementById('abonoTitulo').textContent =
    'Abonar ' + tipoLabel + ' — ' + data;

  /* Exibe o modal */
  document.getElementById('abonoModal').style.display = 'flex';
  document.getElementById('abonoMotivo').focus();
}

/* ── Salva o abono ───────────────────────── */
async function salvarAbono() {
  var colabId = parseInt(document.getElementById('abonoColabId').value, 10);
  var data    = document.getElementById('abonoData').value;
  var tipo    = document.getElementById('abonoTipo').value;
  var motivo  = document.getElementById('abonoMotivo').value.trim();

  if (!motivo) {
    alert('Informe o motivo do abono.');
    document.getElementById('abonoMotivo').focus();
    return;
  }

  try {
    var resp = await apiRequest('abonos.php', {
      method: 'POST',
      body: JSON.stringify({ colabId, data, tipo, motivo })
    });

    /* Remove abono anterior do mesmo dia se existir (na memória local) */
    ABONOS = ABONOS.filter(function(a) {
      return !(a.colabId === colabId && a.data === data);
    });

    /* Adiciona o novo abono */
    ABONOS.push({
      id:        resp.id,
      colabId:   colabId,
      data:      data,
      tipo:      tipo,
      motivo:    motivo,
      criadoEm: new Date().toISOString()
    });

    fecharModalAbono();

    /* Atualiza o relatório na tela */
    if (typeof renderRelatorio === 'function') renderRelatorio();

  } catch (e) {
    alert('Erro ao salvar o abono: ' + e.message);
  }
}

/* ── Remove um abono ─────────────────────── */
async function removerAbono(colabId, data) {
  if (!confirm('Remover o abono deste dia?')) return;

  try {
    await apiRequest('abonos.php?colabId=' + encodeURIComponent(colabId) + '&data=' + encodeURIComponent(data), {
      method: 'DELETE'
    });

    ABONOS = ABONOS.filter(function(a) {
      return !(a.colabId === colabId && a.data === data);
    });

    if (typeof renderRelatorio === 'function') renderRelatorio();

  } catch (e) {
    alert('Erro ao remover o abono: ' + e.message);
  }
}

/* ── Fecha o modal ───────────────────────── */
function fecharModalAbono() {
  document.getElementById('abonoModal').style.display = 'none';
}

/* Fecha ao clicar fora */
window.addEventListener('click', function(e) {
  var modal = document.getElementById('abonoModal');
  if (modal && e.target === modal) fecharModalAbono();
});
