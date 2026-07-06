
function renderHistorico() {
  const colabId  = parseInt(document.getElementById('selHistColab').value);
  const container = document.getElementById('historicoContent');

  if (!colabId) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Selecione um colaborador</h3>
        <p>O histórico completo será exibido aqui agrupado por ano e mês.</p>
      </div>`;
    return;
  }

  const colab = COLABORADORES.find(c => c.id === colabId);
  const regs  = REGISTROS.filter(r => r.colabId === colabId);

  if (regs.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Sem registros para ${colab.nome}</h3>
        <p>Importe batidas para visualizar o histórico.</p>
      </div>`;
    return;
  }

  /*  Agrupa: ano → mês */
  const byAnoMes = {};
  regs.forEach(r => {
    const partes = r.data.split('/');
    if (partes.length < 3) return;
    const mes = partes[1];
    const ano = partes[2];
    const key = `${ano}-${mes}`;
    if (!byAnoMes[key]) byAnoMes[key] = { ano, mes, regs: [] };
    byAnoMes[key].regs.push(r);
  });

  /*  Agrupa por ano */
  const anos = {};
  Object.values(byAnoMes).forEach(m => {
    if (!anos[m.ano]) anos[m.ano] = [];
    anos[m.ano].push(m);
  });

  /*  Card do colaborador  */
  let html = `
    <div class="card" style="margin-bottom:20px">
      <div style="display:flex; align-items:center; gap:14px">
        <div class="colab-avatar">${colab.nome.charAt(0)}</div>
        <div>
          <h3 style="font-size:16px; font-weight:700; color:var(--petrol-dark)">
            ${colab.nome}
          </h3>
          <p style="font-size:12px; color:var(--gray-500)">
            ${getJornadaStr(colab)}
          </p>
        </div>
      </div>
    </div>`;

  /* Blocos por ano  */
  Object.keys(anos)
    .sort()
    .reverse()
    .forEach(ano => {
      html += `
        <div class="hist-year">
          <div class="hist-year-title">${ano}</div>
          <div class="hist-month-grid">`;

      anos[ano]
        .sort((a, b) => b.mes.localeCompare(a.mes))
        .forEach(m => {
          let totalMin    = 0;
          let jornadaTotal = 0;

          m.regs.forEach(r => {
            const h = calcHorasTrabalhadas(r.batidas);
            if (h) totalMin += h;
            jornadaTotal += getJornadaMinutos(colab, r.data);
          });

          const saldo      = totalMin - jornadaTotal;
          const saldoClass = saldo >= 0 ? 'saldo-pos' : 'saldo-neg';
          const saldoSinal = saldo >= 0 ? '+' : '';
          const mLabel     = formatMesLabel(`${m.ano}-${m.mes}`).split(' / ')[0];

          html += `
            <div class="hist-month-card"
                 onclick="irParaMes('${m.ano}-${m.mes}', ${colabId})">
              <h5>${mLabel}</h5>
              <div class="hm-stats">${m.regs.length} dia(s) registrado(s)</div>
              <div class="hm-stats">
                Total trabalhado: <strong>${toHHMM(totalMin)}</strong>
              </div>
              <div class="hm-stats">
                Jornada esperada: <strong>${toHHMM(jornadaTotal)}</strong>
              </div>
              <div class="hm-saldo ${saldoClass}">
                Saldo: ${saldoSinal}${toHHMM(saldo)}
              </div>
            </div>`;
        });

      html += `</div></div>`; // fecha hist-month-grid + hist-year
    });

  container.innerHTML = html;
}

/* Navega direto para o mês no Relatório */
function irParaMes(ym, colabId) {
  // Muda para aba Relatório
  document.querySelectorAll('.tab-content')
    .forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-tab')
    .forEach(t => t.classList.remove('active'));

  document.getElementById('tab-relatorio').classList.add('active');
  document.querySelectorAll('.nav-tab')[0].classList.add('active');

  // Define filtros
  const selMes   = document.getElementById('selMes');
  const selColab = document.getElementById('selColab');

  // Garante que a opção existe antes de setar
  let mesExiste = false;
  for (const opt of selMes.options) {
    if (opt.value === ym) { mesExiste = true; break; }
  }
  if (!mesExiste) {
    const opt = document.createElement('option');
    opt.value       = ym;
    opt.textContent = formatMesLabel(ym);
    selMes.appendChild(opt);
  }

  selMes.value   = ym;
  selColab.value = colabId;
  renderRelatorio();
}