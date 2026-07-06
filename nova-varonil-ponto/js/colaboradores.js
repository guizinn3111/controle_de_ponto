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

    return `
      <div class="colab-card">

        <!-- Cabeçalho do card -->
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px">
          <div class="colab-avatar"
               style="width:34px; height:34px; font-size:13px">
            ${c.nome.charAt(0)}
          </div>
          <div>
            <h4>${c.nome}</h4>
            <span style="font-size:11px; color:var(--gray-500)">
              ${totalRegs} registro(s) no sistema
            </span>
          </div>
        </div>

        <!-- Jornada -->
        <div class="jornada">
          <strong>Jornada oficial:</strong>
        </div>
        <div class="jornada" style="margin-bottom:10px">
          ${getJornadaStr(c)}
        </div>

        <!-- Apelidos reconhecidos -->
        <div class="jornada">
          <strong>Reconhecido como:</strong>
        </div>
        <div class="jornada-row">
          ${tags}
        </div>

      </div>`;
  }).join('');
}