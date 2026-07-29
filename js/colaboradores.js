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

    const rescisaoBadge = c.rescisao
      ? `<span class="badge-rescisao">Rescindido em ${c.rescisao.data}</span>`
      : '<span class="badge-ativo">Ativo</span>';

    const feriasBadge = c.ferias
      ? `<span class="badge-ferias">🏖️ Férias: ${c.ferias.inicio} até ${c.ferias.fim}</span>`
      : '';

    const btnRescisao = `
      <button class="btn-rescisao admin-only"
              onclick="abrirModalRescisao(${c.id})">
        ${c.rescisao ? '✎ Editar Rescisão' : '+ Registrar Rescisão'}
      </button>`;

    const btnFerias = `
      <button class="btn-ferias admin-only"
              onclick="abrirModalFerias(${c.id})">
        ${c.ferias ? '✎ Editar Férias' : '🏖️ Registrar Férias'}
      </button>`;

    const btnJornada = `
      <button class="btn-jornada admin-only"
              onclick="abrirModalJornada(${c.id})">
        ⏱ Editar Jornada
      </button>`;

    const btnCargo = `
      <button class="btn-cargo admin-only"
              onclick="abrirModalCargo(${c.id})">
        ✎ Editar Cargo
      </button>`;

    return `
      <div class="colab-card ${c.rescisao ? 'colab-rescindido' : ''}">

        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px">
          <div class="colab-avatar" style="width:34px; height:34px; font-size:13px">
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

        <div class="jornada"><strong>Cargo:</strong></div>
        <div class="jornada" style="margin-bottom:10px">${c.cargo || '—'}</div>

        <div class="jornada"><strong>Jornada oficial:</strong></div>
        <div class="jornada" style="margin-bottom:10px">${getJornadaStr(c)}</div>

        <div class="jornada"><strong>Reconhecido como:</strong></div>
        <div class="jornada-row">${tags}</div>

        ${feriasBadge ? `<div style="margin-top:10px">${feriasBadge}</div>` : ''}

        <div style="margin-top:14px; display:flex; gap:8px; flex-wrap:wrap">
          ${btnRescisao}
          ${btnFerias}
          ${btnJornada}
          ${btnCargo}
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

  document.getElementById('rescisaoColabId').value       = colabId;
  document.getElementById('rescisaoTitulo').textContent  = 'Rescisão — ' + colab.nome;

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

async function salvarRescisao() {
  const colabId = parseInt(document.getElementById('rescisaoColabId').value, 10);
  const dataRaw = document.getElementById('rescisaoData').value;
  if (!dataRaw) { alert('Selecione a data da rescisão.'); return; }

  const partes  = dataRaw.split('-');
  const dataFmt = `${partes[2]}/${partes[1]}/${partes[0]}`;
  const colab   = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  try {
    await apiRequest('colaborador_rescisao.php', {
      method: 'POST',
      body: JSON.stringify({ colabId, data: dataFmt })
    });

    colab.rescisao = { ativo: false, data: dataFmt };
    fecharModalRescisao();
    renderColaboradores();

  } catch (e) {
    alert('Erro ao salvar rescisão: ' + e.message);
  }
}

async function removerRescisao() {
  const colabId = parseInt(document.getElementById('rescisaoColabId').value, 10);
  if (!confirm('Remover a rescisão deste colaborador?')) return;

  try {
    await apiRequest('colaborador_rescisao.php?colabId=' + colabId, { method: 'DELETE' });

    const colab = COLABORADORES.find(c => c.id === colabId);
    if (colab) colab.rescisao = null;
    fecharModalRescisao();
    renderColaboradores();

  } catch (e) {
    alert('Erro ao remover rescisão: ' + e.message);
  }
}

function fecharModalRescisao() {
  document.getElementById('rescisaoModal').style.display = 'none';
}

/* ── MODAL DE FÉRIAS ─────────────────────── */

function abrirModalFerias(colabId) {
  if (PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode registrar férias.');
    return;
  }
  const colab = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  document.getElementById('feriasColabId').value      = colabId;
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

async function salvarFerias() {
  const colabId   = parseInt(document.getElementById('feriasColabId').value, 10);
  const rawInicio = document.getElementById('feriasInicio').value;
  const rawFim    = document.getElementById('feriasFim').value;
  if (!rawInicio || !rawFim) { alert('Preencha as datas de início e fim das férias.'); return; }

  const fmtData = raw => { const p = raw.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; };
  const colab   = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  const inicio = fmtData(rawInicio);
  const fim    = fmtData(rawFim);

  try {
    await apiRequest('colaborador_ferias.php', {
      method: 'POST',
      body: JSON.stringify({ colabId, inicio, fim })
    });

    colab.ferias = { inicio, fim };
    fecharModalFerias();
    renderColaboradores();

  } catch (e) {
    alert('Erro ao salvar férias: ' + e.message);
  }
}

async function removerFerias() {
  const colabId = parseInt(document.getElementById('feriasColabId').value, 10);
  if (!confirm('Remover as férias deste colaborador?')) return;

  try {
    await apiRequest('colaborador_ferias.php?colabId=' + colabId, { method: 'DELETE' });

    const colab = COLABORADORES.find(c => c.id === colabId);
    if (colab) colab.ferias = null;
    fecharModalFerias();
    renderColaboradores();

  } catch (e) {
    alert('Erro ao remover férias: ' + e.message);
  }
}

function fecharModalFerias() {
  document.getElementById('feriasModal').style.display = 'none';
}

/* ── MODAL DE JORNADA ─────────────────────── */

function abrirModalJornada(colabId) {
  if (PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode editar a jornada.');
    return;
  }

  const colab = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  document.getElementById('jornadaColabId').value      = colabId;
  document.getElementById('jornadaTitulo').textContent = 'Jornada — ' + colab.nome;

  const j = colab.jornada[0];

  document.getElementById('jornadaEntrada').value    = j.entrada    || '';
  document.getElementById('jornadaSaidaAlm').value   = j.saidaAlmoco|| '';
  document.getElementById('jornadaVoltaAlm').value   = j.voltaAlmoco|| '';
  document.getElementById('jornadaSaida').value      = j.saida      || '';

  /* se for semanal, exibe a segunda linha (sex) */
  const temSex = colab.tipo === 'semanal' && colab.jornada[1];
  const blocoSex = document.getElementById('jornadaBlocoSex');
  blocoSex.style.display = temSex ? 'block' : 'none';

  if (temSex) {
    const s = colab.jornada[1];
    document.getElementById('jornadaSexEntrada').value   = s.entrada    || '';
    document.getElementById('jornadaSexSaidaAlm').value  = s.saidaAlmoco|| '';
    document.getElementById('jornadaSexVoltaAlm').value  = s.voltaAlmoco|| '';
    document.getElementById('jornadaSexSaida').value     = s.saida      || '';
  }

  document.getElementById('jornadaModal').style.display = 'flex';
  document.getElementById('jornadaEntrada').focus();
}

async function salvarJornada() {
  const colabId  = parseInt(document.getElementById('jornadaColabId').value, 10);
  const colab    = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  const entrada  = document.getElementById('jornadaEntrada').value.trim();
  const saidaAlm = document.getElementById('jornadaSaidaAlm').value.trim();
  const voltaAlm = document.getElementById('jornadaVoltaAlm').value.trim();
  const saida    = document.getElementById('jornadaSaida').value.trim();
  if (!entrada || !saida) { alert('Preencha pelo menos Entrada e Saída.'); return; }

  let jornada;
  if (colab.tipo === 'fixo') {
    jornada = [{ entrada, saidaAlmoco: saidaAlm || null, voltaAlmoco: voltaAlm || null, saida }];
  } else {
    const sexEntrada  = document.getElementById('jornadaSexEntrada').value.trim();
    const sexSaidaAlm = document.getElementById('jornadaSexSaidaAlm').value.trim();
    const sexVoltaAlm = document.getElementById('jornadaSexVoltaAlm').value.trim();
    const sexSaida    = document.getElementById('jornadaSexSaida').value.trim();
    jornada = [
      { dias:[1,2,3,4], entrada, saidaAlmoco: saidaAlm || null, voltaAlmoco: voltaAlm || null, saida },
      { dias:[5], entrada: sexEntrada || entrada, saidaAlmoco: sexSaidaAlm || saidaAlm || null, voltaAlmoco: sexVoltaAlm || voltaAlm || null, saida: sexSaida || saida }
    ];
  }

  try {
    await apiRequest('colaborador_jornada.php', {
      method: 'POST',
      body: JSON.stringify({ colabId, tipo: colab.tipo, jornada })
    });

    colab.jornada = jornada;
    fecharModalJornada();
    renderColaboradores();

  } catch (e) {
    alert('Erro ao salvar jornada: ' + e.message);
  }
}

function fecharModalJornada() {
  document.getElementById('jornadaModal').style.display = 'none';
}

/* ── MODAL DE CARGO ─────────────────────── */

function abrirModalCargo(colabId) {
  if (PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode editar o cargo.');
    return;
  }
  const colab = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  document.getElementById('cargoColabId').value      = colabId;
  document.getElementById('cargoTitulo').textContent = 'Cargo — ' + colab.nome;
  document.getElementById('cargoInput').value        = colab.cargo || '';

  document.getElementById('cargoModal').style.display = 'flex';
  document.getElementById('cargoInput').focus();
}

async function salvarCargo() {
  const colabId = parseInt(document.getElementById('cargoColabId').value, 10);
  const cargo   = document.getElementById('cargoInput').value.trim();
  if (!cargo) { alert('Preencha o cargo.'); return; }

  const colab = COLABORADORES.find(c => c.id === colabId);
  if (!colab) return;

  try {
    await apiRequest('colaborador_cargo.php', {
      method: 'POST',
      body: JSON.stringify({ colabId, cargo })
    });

    colab.cargo = cargo;
    fecharModalCargo();
    renderColaboradores();
    renderRelatorio();

  } catch (e) {
    alert('Erro ao salvar cargo: ' + e.message);
  }
}

function fecharModalCargo() {
  document.getElementById('cargoModal').style.display = 'none';
}

/* ── MODAL NOVO COLABORADOR ─────────────────────── */

function abrirModalNovoColab() {
  if (PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode adicionar colaboradores.');
    return;
  }

  document.getElementById('novoNome').value      = '';
  document.getElementById('novoCargo').value     = '';
  document.getElementById('novoApelidos').value  = '';
  document.getElementById('novoTipo').value      = 'fixo';
  document.getElementById('novoEntrada').value   = '';
  document.getElementById('novoSaidaAlm').value  = '';
  document.getElementById('novoVoltaAlm').value  = '';
  document.getElementById('novoSaida').value     = '';
  document.getElementById('novoSexEntrada').value  = '';
  document.getElementById('novoSexSaidaAlm').value = '';
  document.getElementById('novoSexVoltaAlm').value = '';
  document.getElementById('novoSexSaida').value    = '';
  document.getElementById('novoColabBlocoSex').style.display = 'none';

  document.getElementById('novoColabModal').style.display = 'flex';
  document.getElementById('novoNome').focus();
}

function toggleNovoColabSex() {
  const tipo = document.getElementById('novoTipo').value;
  document.getElementById('novoColabBlocoSex').style.display =
    tipo === 'semanal' ? 'block' : 'none';
}

async function salvarNovoColab() {
  const nome    = document.getElementById('novoNome').value.trim().toUpperCase();
  const cargo   = document.getElementById('novoCargo').value.trim();
  const tipo    = document.getElementById('novoTipo').value;
  const entrada = document.getElementById('novoEntrada').value.trim();
  const saida   = document.getElementById('novoSaida').value.trim();

  if (!nome)    { alert('Preencha o nome do colaborador.'); return; }
  if (!entrada || !saida) { alert('Preencha pelo menos Entrada e Saída.'); return; }

  const saidaAlm = document.getElementById('novoSaidaAlm').value.trim();
  const voltaAlm = document.getElementById('novoVoltaAlm').value.trim();

  const apelidos = document.getElementById('novoApelidos').value
    .split(',')
    .map(a => a.trim().toUpperCase())
    .filter(a => a.length > 0);

  let jornada;
  if (tipo === 'fixo') {
    jornada = [{ entrada, saidaAlmoco: saidaAlm || null, voltaAlmoco: voltaAlm || null, saida }];
  } else {
    const sexEntrada  = document.getElementById('novoSexEntrada').value.trim();
    const sexSaidaAlm = document.getElementById('novoSexSaidaAlm').value.trim();
    const sexVoltaAlm = document.getElementById('novoSexVoltaAlm').value.trim();
    const sexSaida    = document.getElementById('novoSexSaida').value.trim();
    jornada = [
      { dias:[1,2,3,4], entrada, saidaAlmoco: saidaAlm || null, voltaAlmoco: voltaAlm || null, saida },
      { dias:[5], entrada: sexEntrada || entrada, saidaAlmoco: sexSaidaAlm || saidaAlm || null, voltaAlmoco: sexVoltaAlm || voltaAlm || null, saida: sexSaida || saida }
    ];
  }

  try {
    const resp = await apiRequest('colaboradores.php', {
      method: 'POST',
      body: JSON.stringify({ nome, cargo, apelidos, tipo, jornada })
    });

    COLABORADORES.push({
      id:       resp.id,
      nome,
      cargo:    cargo || '',
      apelidos,
      tipo,
      jornada,
      rescisao: null,
      ferias:   null
    });

    fecharModalNovoColab();
    renderColaboradores();

  } catch (e) {
    alert('Erro ao salvar novo colaborador: ' + e.message);
  }
}

function fecharModalNovoColab() {
  document.getElementById('novoColabModal').style.display = 'none';
}

/* ── FECHA MODAIS AO CLICAR FORA ─────────────────────── */
window.addEventListener('click', function(e) {
  const mr = document.getElementById('rescisaoModal');
  if (mr && e.target === mr) fecharModalRescisao();

  const mf = document.getElementById('feriasModal');
  if (mf && e.target === mf) fecharModalFerias();

  const mj = document.getElementById('jornadaModal');
  if (mj && e.target === mj) fecharModalJornada();

  const mc = document.getElementById('cargoModal');
  if (mc && e.target === mc) fecharModalCargo();

  const mn = document.getElementById('novoColabModal');
  if (mn && e.target === mn) fecharModalNovoColab();
});
