/* 
  ABONO.JS — Abono de faltas e atrasos
  Somente admin · Motivo obrigatório
  Não altera nenhuma outra função do sistema
 */

/* Estrutura salva no localStorage
   ABONOS = [
     {
       id:        "uuid",
       colabId:   1,
       data:      "DD/MM/YYYY",
       tipo:      "falta" | "atraso",
       motivo:    "Atestado médico",
       criadoEm: "2026-06-29T10:00:00"
     }, ...
   ]
*/

var ABONOS = [];

/* Carrega / salva */
function loadAbonos() {
  try {
    ABONOS = JSON.parse(localStorage.getItem('abonos_nv') || '[]');
  } catch(e) { ABONOS = []; }
}

function saveAbonos() {
  localStorage.setItem('abonos_nv', JSON.stringify(ABONOS));
}

/ Verifica se uma data já tem abono */
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
function salvarAbono() {
  var colabId = parseInt(document.getElementById('abonoColabId').value, 10);
  var data    = document.getElementById('abonoData').value;
  var tipo    = document.getElementById('abonoTipo').value;
  var motivo  = document.getElementById('abonoMotivo').value.trim();

  if (!motivo) {
    alert('Informe o motivo do abono.');
    document.getElementById('abonoMotivo').focus();
    return;
  }

  /* Remove abono anterior do mesmo dia se existir */
  ABONOS = ABONOS.filter(function(a) {
    return !(a.colabId === colabId && a.data === data);
  });

  /* Adiciona o novo abono */
  ABONOS.push({
    id:        Date.now().toString(),
    colabId:   colabId,
    data:      data,
    tipo:      tipo,
    motivo:    motivo,
    criadoEm: new Date().toISOString()
  });

  saveAbonos();
  fecharModalAbono();

  /* Atualiza o relatório na tela */
  if (typeof renderRelatorio === 'function') renderRelatorio();
}

/* ── Remove um abono ─────────────────────── */
function removerAbono(colabId, data) {
  if (!confirm('Remover o abono deste dia?')) return;
  ABONOS = ABONOS.filter(function(a) {
    return !(a.colabId === colabId && a.data === data);
  });
  saveAbonos();
  if (typeof renderRelatorio === 'function') renderRelatorio();
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

/* Inicializa ao carregar */
loadAbonos();