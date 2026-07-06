/*
   UTILITÁRIOS DE TEMPO E CÁLCULOS
 */

// Converte "HH:MM" ou "HH:MM:SS" → minutos
function toMinutes(hms) {
  if (!hms) return null;
  const parts = hms.split(':').map(Number);
  return parts[0] * 60 + parts[1] + (parts[2] ? parts[2] / 60 : 0);
}

// Converte minutos → "XhYY" (ex: 8h30)
function toHHMM(mins) {
  if (mins === null || isNaN(mins)) return '—';
  const sign = mins < 0 ? '-' : '';
  const abs  = Math.abs(mins);
  const h    = Math.floor(abs / 60);
  const m    = Math.round(abs % 60);
  return `${sign}${h}h${String(m).padStart(2, '0')}`;
}

// Calcula horas trabalhadas a partir das batidas do dia
function calcHorasTrabalhadas(batidas) {
  if (!batidas || batidas.length < 2) return null;
  const b = batidas.map(x => toMinutes(x));
  let total = 0;

  if (batidas.length === 2) {
    total = b[1] - b[0];
  } else if (batidas.length >= 4) {
    total = (b[1] - b[0]) + (b[3] - b[2]);
  } else {
    total = b[batidas.length - 1] - b[0];
  }

  return total > 0 ? total : 0;
}

// Retorna a jornada esperada (em minutos) de um colaborador em uma data
function getJornadaMinutos(colab, dataStr) {
  // dataStr: "DD/MM/YYYY"
  const d   = new Date(dataStr.split('/').reverse().join('-'));
  const dow = d.getDay(); // 0=Dom … 6=Sáb

  if (colab.tipo === 'fixo') {
    const j = colab.jornada[0];
    if (!j.saida || !j.entrada) {
      return j.saidaAlmoco
        ? toMinutes(j.saidaAlmoco) - toMinutes(j.entrada)
        : 0;
    }
    if (j.voltaAlmoco) {
      return (toMinutes(j.saidaAlmoco)  - toMinutes(j.entrada))
           + (toMinutes(j.saida)        - toMinutes(j.voltaAlmoco));
    }
    return toMinutes(j.saida) - toMinutes(j.entrada);
  }

  // Tipo semanal
  for (const j of colab.jornada) {
    if (j.dias && j.dias.includes(dow)) {
      return (toMinutes(j.saidaAlmoco)  - toMinutes(j.entrada))
           + (toMinutes(j.saida)        - toMinutes(j.voltaAlmoco));
    }
  }
  return 0; // Sábado / Domingo
}

// Retorna a jornada como string legível
function getJornadaStr(colab) {
  if (colab.tipo === 'fixo') {
    const j     = colab.jornada[0];
    const parts = [j.entrada, j.saidaAlmoco, j.voltaAlmoco, j.saida]
                    .filter(Boolean);
    return parts.join(' — ');
  }

  const diasNome = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  return colab.jornada.map(j => {
    const dias = j.dias.map(d => diasNome[d]).join('/');
    return `${dias}: ${j.entrada}–${j.saida} (almoço ${j.saidaAlmoco}–${j.voltaAlmoco})`;
  }).join(' | ');
}

// Normaliza datas para "DD/MM/YYYY"
function normalizeDate(d) {
  const parts = d.split(/[\/\-]/);
  if (parts[2] && parts[2].length === 2) parts[2] = '20' + parts[2];
  return `${parts[0].padStart(2,'0')}/${parts[1].padStart(2,'0')}/${parts[2]}`;
}

// Label de mês: "YYYY-MM" → "Janeiro / 2026"
function formatMesLabel(ym) {
  const meses = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];
  const [y, m] = ym.split('-');
  return `${meses[parseInt(m) - 1]} / ${y}`;
}

// Lista de meses presentes nos registros (mais recente primeiro)
function getMesesDisponiveis() {
  const set = new Set();
  REGISTROS.forEach(r => {
    const p = r.data.split('/');
    if (p.length === 3) set.add(`${p[2]}-${p[1]}`);
  });
  return [...set].sort().reverse();
}