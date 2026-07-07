/*
  ABA: COLABORADORES
*/

function renderColaboradores() {
  const grid   = document.getElementById('colabGrid');
  const sorted = [...COLABORADORES].sort((a, b) =>
    a.nome.localeCompare(b.nome)
  );

  grid.innerHTML = sorted.map(c => {
    const totalRegs = REGISTROS.filter(r => r.colabId === c.id).length;
    const tags      = c.apelidos
      .map(ap => `<span class="jornada-tag">${ap}</span>`)
      .join('');

    /* badge de rescisão */
    const rescisaoBadge = c.rescisao
      ? `<span class="badge-rescisao">Rescindido em ${c.rescisao.data}</span>`
      : '<span class="badge-ativo">Ativo</span>';

    /* badge de férias */
    const feriasBadge = c.ferias
      ? `<span class="badge-ferias">🏖️ Férias: ${c.ferias.inicio} até ${c.ferias.fim}</span>`
      : '';

    /* botão rescisão só aparece para admin */
    const btnRescisao = `
      <button class="btn-rescisao admin-only"
              onclick="abrirModalRescisao(${c.id})">
        ${c.rescisao ? '✎ Editar Rescisão' : '+ Registrar Rescisão'}
      </button>`;

    /* botão férias só aparece para admin */
    const btnFerias = `
      <button class="btn-ferias admin-only"
              onclick="abrirModalFerias(${c.id})">
        ${c.ferias ? '✎ Editar Férias' : '🏖️ Registrar Férias'}
      </button>`;

    return `
      <div class="colab-card ${c.rescisao ? 'colab-rescindido' : ''}">

        <!-- Cabeçalho do card -->
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px">
          <div class="colab-avatar"
               style="width:34px; height:34px; font-size:13px">
            ${c.nome.charAt(0)}
          </div>
          <div style="flex:1">
            <h4>${c.nome}</h4>
            <span style="font-size:11px; color:var(--gray-500)">
              ${totalRegs} registro(s) no sistema
            </span>
          </div>
          ${rescisaoBadge}
        </div>

        <!-- Jornada -->
        <div class="jornada"><strong>Jornada oficial:</strong></div>
        <div class="jornada" style="margin-bottom:10px">${getJornadaStr(c)}</div>

        <!-- Apelidos reconhecidos -->
        <div class="jornada"><strong>Reconhecido como:</strong></div>
        <div class="jornada-row">${tags}</div>

        <!-- Férias -->
        ${feriasBadge ? `<div style="margin-top:10px">${feriasBadge}</div>` : ''}

        <!-- Ações admin -->
        <div style="margin-top:14px; display:flex; gap:8px; flex-wrap:wrap">
          ${btnRescisao}
          ${btnFerias}
        </div>

      </div>`;
  }).join('');
}

/* ── MODAL DE RESCISÃO ─────────────────────── */

function abrirModalRescisao(colabId) {
  if (PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode registrar rescisões.');
    return;
  }

  const colab = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  document.getElementById('rescisaoColabId').value = colabId;
  document.getElementById('rescisaoTitulo').textContent =
    'Rescisão — ' + colab.nome;

  const dataInput = document.getElementById('rescisaoData');
  if (colab.rescisao && colab.rescisao.data) {
    const partes = colab.rescisao.data.split('/');
    dataInput.value = `${partes[2]}-${partes[1]}-${partes[0]}`;
  } else {
    dataInput.value = '';
  }

  document.getElementById('rescisaoModal').style.display = 'flex';
  dataInput.focus();
}

function salvarRescisao() {
  const colabId = parseInt(document.getElementById('rescisaoColabId').value, 10);
  const dataRaw = document.getElementById('rescisaoData').value;

  if (!dataRaw) {
    alert('Selecione a data da rescisão.');
    return;
  }

  const partes  = dataRaw.split('-');
  const dataFmt = `${partes[2]}/${partes[1]}/${partes[0]}`;
  const colab   = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  colab.rescisao = { ativo: false, data: dataFmt };

  saveRescisoes();
  fecharModalRescisao();
  renderColaboradores();
}

function removerRescisao() {
  const colabId = parseInt(document.getElementById('rescisaoColabId').value, 10);
  if (!confirm('Remover a rescisão deste colaborador?')) return;

  const colab = COLABORADORES.find(c => c.id === colabId);
  if (colab) colab.rescisao = null;

  saveRescisoes();
  fecharModalRescisao();
  renderColaboradores();
}

function fecharModalRescisao() {
  document.getElementById('rescisaoModal').style.display = 'none';
}

function saveRescisoes() {
  const map = {};
  COLABORADORES.forEach(c => {
    if (c.rescisao) map[c.id] = c.rescisao;
  });
  localStorage.setItem('rescisoes_nv', JSON.stringify(map));
}

function loadRescisoes() {
  try {
    const map = JSON.parse(localStorage.getItem('rescisoes_nv') || '{}');
    COLABORADORES.forEach(c => {
      if (map[c.id]) c.rescisao = map[c.id];
    });
  } catch(e) {}
}

/* ── MODAL DE FÉRIAS ─────────────────────── */

function abrirModalFerias(colabId) {
  if (PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode registrar férias.');
    return;
  }

  const colab = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  document.getElementById('feriasColabId').value   = colabId;
  document.getElementById('feriasTitulo').textContent = 'Férias — ' + colab.nome;

  const inputInicio = document.getElementById('feriasInicio');
  const inputFim    = document.getElementById('feriasFim');

  if (colab.ferias) {
    const pi = colab.ferias.inicio.split('/');
    const pf = colab.ferias.fim.split('/');
    inputInicio.value = `${pi[2]}-${pi[1]}-${pi[0]}`;
    inputFim.value    = `${pf[2]}-${pf[1]}-${pf[0]}`;
  } else {
    inputInicio.value = '';
    inputFim.value    = '';
  }

  document.getElementById('feriasModal').style.display = 'flex';
  inputInicio.focus();
}

function salvarFerias() {
  const colabId  = parseInt(document.getElementById('feriasColabId').value, 10);
  const rawInicio = document.getElementById('feriasInicio').value;
  const rawFim    = document.getElementById('feriasFim').value;

  if (!rawInicio || !rawFim) {
    alert('Preencha as datas de início e fim das férias.');
    return;
  }

  const fmtData = raw => {
    const p = raw.split('-');
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  const colab = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  colab.ferias = { inicio: fmtData(rawInicio), fim: fmtData(rawFim) };

  saveFerias();
  fecharModalFerias();
  renderColaboradores();
}

function removerFerias() {
  const colabId = parseInt(document.getElementById('feriasColabId').value, 10);
  if (!confirm('Remover as férias deste colaborador?')) return;

  const colab = COLABORADORES.find(c => c.id === colabId);
  if (colab) colab.ferias = null;

  saveFerias();
  fecharModalFerias();
  renderColaboradores();
}

function fecharModalFerias() {
  document.getElementById('feriasModal').style.display = 'none';
}

function saveFerias() {
  const map = {};
  COLABORADORES.forEach(c => {
    if (c.ferias) map[c.id] = c.ferias;
  });
  localStorage.setItem('ferias_nv', JSON.stringify(map));
}

function loadFerias() {
  try {
    const map = JSON.parse(localStorage.getItem('ferias_nv') || '{}');
    COLABORADORES.forEach(c => {
      if (map[c.id]) c.ferias = map[c.id];
    });
  } catch(e) {}
}

/* Fecha modais ao clicar fora */
window.addEventListener('click', function(e) {
  const mr = document.getElementById('rescisaoModal');
  if (mr && e.target === mr) fecharModalRescisao();

  const mf = document.getElementById('feriasModal');
  if (mf && e.target === mf) fecharModalFerias();
});

/* Inicializa */
loadRescisoes();
loadFerias();