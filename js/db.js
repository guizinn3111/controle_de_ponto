/*
  REGISTROS DE PONTO — agora vêm do servidor (banco de dados),
  não mais do localStorage. O array REGISTROS continua existindo
  em memória durante a sessão, exatamente como antes — só a forma
  de carregar/gravar mudou.
 */

let REGISTROS = [];

// Carrega todos os registros do servidor pra memória
async function carregarRegistros() {
  REGISTROS = await apiRequest('registros.php');
  updateHeaderStats();
  return REGISTROS;
}

// Atualiza contador no header
function updateHeaderStats() {
  const el = document.getElementById('headerStats');
  if (el) el.textContent = `${REGISTROS.length} registros · ${COLABORADORES.length} colaborador(es)`;
}
