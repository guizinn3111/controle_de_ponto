/* 
  INICIALIZAÇÃO GERAL DO SISTEMA
 */

/* Inicia tudo após o login — agora carrega os dados do servidor primeiro */
async function init() {
  const main = document.querySelector('main');

  try {
    COLABORADORES = await apiRequest('colaboradores.php');
    await Promise.all([
      carregarRegistros(),
      carregarAbonos(),
      carregarHorasExtras()
    ]);
  } catch (e) {
    alert('Erro ao carregar dados do servidor: ' + e.message + '\n\nRecarregue a página para tentar novamente.');
    return;
  }

  populateSelects();
  renderColaboradores();
  renderRelatorio();
  updateHeaderStats();
}

/* Preenche todos os <select> */
function populateSelects() {
  _populateMeses();
  _populateColabs();
}

function _populateMeses() {
  const selMes = document.getElementById('selMes');
  const meses  = getMesesDisponiveis();
  selMes.innerHTML = '';

  if (meses.length === 0) {
    /* Mês atual como padrão quando ainda não há registros */
    const now = new Date();
    const ym  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const opt = document.createElement('option');
    opt.value       = ym;
    opt.textContent = formatMesLabel(ym);
    selMes.appendChild(opt);
  } else {
    meses.forEach(m => {
      const opt = document.createElement('option');
      opt.value       = m;
      opt.textContent = formatMesLabel(m);
      selMes.appendChild(opt);
    });
  }
}

function _populateColabs() {
  const sorted = [...COLABORADORES].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  /* Aplica em todos os selects de colaborador */
  ['selColab', 'selHistColab'].forEach(id => {
    const sel        = document.getElementById(id);
    const primeiraOp = sel.options[0];   // preserva "Todos" / "Selecione"
    sel.innerHTML    = '';
    if (primeiraOp) sel.appendChild(primeiraOp);

    sorted.forEach(c => {
      const opt = document.createElement('option');
      opt.value       = c.id;
      opt.textContent = c.nome;
      sel.appendChild(opt);
    });
  });
}

/* Troca de abas  */
function showTab(tab) {
  /* Esconde todas as abas */
  document.querySelectorAll('.tab-content')
    .forEach(t => t.classList.remove('active'));

  /* Desmarca todos os tabs */
  document.querySelectorAll('.nav-tab')
    .forEach(t => t.classList.remove('active'));

  /* Ativa a aba escolhida */
  const content = document.getElementById('tab-' + tab);
  if (content) content.classList.add('active');

  /* Mapeia tab → índice do nav-tab */
  const tabIndex = {
    relatorio:     0,
    historico:     1,
    colaboradores: 2,
    importar:      3
  };
  const tabs = document.querySelectorAll('.nav-tab');
  if (tabs[tabIndex[tab]]) tabs[tabIndex[tab]].classList.add('active');

  /* Re-renderiza a aba se necessário */
  if (tab === 'historico')    renderHistorico();
  if (tab === 'colaboradores') renderColaboradores();
}
