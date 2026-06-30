function renderRelatorio() {
  var mesSel    = document.getElementById('selMes') ? document.getElementById('selMes').value : '';
  var colabSel  = document.getElementById('selColab') ? document.getElementById('selColab').value : '';
  var container = document.getElementById('relatorioContent');
  if (!container || !mesSel) return;

  /* filtra por mês */
  var regs = [];
  var i    = 0;
  for (i = 0; i < REGISTROS.length; i++) {
    var p = REGISTROS[i].data.split('/');
    if (p.length === 3 && (p[2] + '-' + p[1]) === mesSel) {
      if (!colabSel || REGISTROS[i].colabId == colabSel) {
        regs.push(REGISTROS[i]);
      }
    }
  }

  /* agrupa por colaborador */
  var byColab = {};
  for (i = 0; i < regs.length; i++) {
    var cid = regs[i].colabId;
    if (!byColab[cid]) byColab[cid] = [];
    byColab[cid].push(regs[i]);
  }

  /* lista de colaboradores encontrados ordenados */
  var colabs = [];
  for (i = 0; i < COLABORADORES.length; i++) {
    var c = COLABORADORES[i];
    if (byColab[c.id]) colabs.push(c);
  }
  colabs.sort(function(a, b) { return a.nome.localeCompare(b.nome); });

  if (regs.length === 0) {
    container.innerHTML =
      '<div class="empty-state">' +
      '<h3>Nenhum registro encontrado</h3>' +
      '<p>Importe as batidas na aba "Importar Batidas".</p>' +
      '</div>';
    return;
  }

  /* total geral */
  var totalGeral = 0;
  var j = 0;
  for (i = 0; i < colabs.length; i++) {
    var dias = byColab[colabs[i].id];
    for (j = 0; j < dias.length; j++) {
      var h = calcHorasTrabalhadas(dias[j].batidas);
      if (h) totalGeral += h;
    }
  }

  /* cabeçalho do relatório */
  var html = '' +
    '<div class="report-header-card">' +
      '<img class="logo-folha" src="logo Nova Varonil - Preto.png" alt="Logo Nova Varonil">' +
      '<div>' +
        '<p class="card-title">Relatório de Ponto</p>' +
        '<h2>' + formatMesLabel(mesSel) + '</h2>' +
        '<p>' + colabs.length + ' colaborador(es) · ' + regs.length + ' dia(s) registrado(s)</p>' +
      '</div>' +
      '<div class="total-box">' +
        '<div class="label">TOTAL HORAS</div>' +
        '<div class="value">' + toHHMM(totalGeral) + '</div>' +
      '</div>' +
    '</div>';

  /* bloco de cada colaborador */
  for (i = 0; i < colabs.length; i++) {
    var colab = colabs[i];
    var diasC = byColab[colab.id];

    /* ordena dias */
    diasC.sort(function(a, b) {
      var da = a.data.split('/').reverse().join('');
      var db = b.data.split('/').reverse().join('');
      return da.localeCompare(db);
    });

    var totalMin  = 0;
var rows      = '';
var partesMes = mesSel.split('-');
var anoMes    = parseInt(partesMes[0], 10);
var mesMes    = parseInt(partesMes[1], 10);
var nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
var mapaDias  = {};

for (j = 0; j < diasC.length; j++) {
  mapaDias[diasC[j].data] = diasC[j];
}

var ultimoDia = new Date(anoMes, mesMes, 0).getDate();

for (j = 1; j <= ultimoDia; j++) {
  var dd      = String(j).padStart(2, '0');
  var mm      = String(mesMes).padStart(2, '0');
  var dataStr = dd + '/' + mm + '/' + anoMes;
  var dt      = new Date(anoMes, mesMes - 1, j);
  var r       = mapaDias[dataStr];

  if (dt.getDay() === 0 || dt.getDay() === 6) {
    rows +=
      '<tr class="tr-folga">' +
        '<td class="td-date">' + nomesDias[dt.getDay()] + ' ' + dataStr + '</td>' +
        '<td colspan="7" style="text-align:center; color:var(--gray-500); font-style:italic;">Folga</td>' +
        '<td></td>' +
      '</tr>';
    continue;
  }

  if (!r) continue;

  var entrada  = r.batidas[0] || '';
  var saidaAlm = r.batidas[1] || '';
  var voltaAlm = r.batidas[2] || '';
  var saida    = r.batidas[3] || '';
  var horas    = calcHorasTrabalhadas(r.batidas);
  var jornMin  = getJornadaMinutos(colab, r.data);
  var saldo    = horas !== null ? horas - jornMin : null;
  if (horas) totalMin += horas;

  /* saldo html */
  var saldoHtml = '';
  if (saldo !== null && jornMin > 0) {
    if      (saldo >  5) saldoHtml = '<span class="badge-extra">+' + toHHMM(saldo) + '</span>';
    else if (saldo < -5) saldoHtml = '<span class="badge-late">'  + toHHMM(saldo) + '</span>';
    else                 saldoHtml = '<span class="badge-ok">&#10003;</span>';
  }

  /* botão editar */
  var btnEditar =
    '<button class="btn-editar-linha" onclick="abrirEditor(\'' + r.id + '\')">' +
      '✏️ Editar' +
    '</button>';

  /* botão lançar HE */
  var btnHE =
    '<button class="btn-lancar-he" onclick="abrirModalHorasExtras(' +
      colab.id + ',\'' + r.data + '\')">' +
      '+ HE' +
    '</button>';

  /* horas extras do dia */
  var listaHE = getHorasExtras(colab.id, r.data);
  var totalHE = totalHEminutos(colab.id, r.data);
  var heHtml  = '';
  if (listaHE.length > 0) {
    heHtml = '+' + toHHMM(totalHE);
  } else {
    heHtml = '<span class="td-dash">—</span>';
  }

  var cel = function(v) { return v ? v : '<span class="td-dash">—</span>'; };

  /* verifica abono */
  var abono = getAbono(colab.id, r.data);
  var abonoHtml = '';
  if (abono) {
    abonoHtml =
      '<span class="badge-abono" title="' + abono.motivo + '">✓ Abonado</span>' +
      '<button class="btn-rm-abono" onclick="removerAbono(' + colab.id + ',\'' + r.data + '\')">✕</button>';
  } else if (saldo !== null && saldo < -5) {
    abonoHtml =
      saldoHtml +
      '<button class="btn-abonar" onclick="abrirModalAbono(' + colab.id + ',\'' + r.data + '\',\'atraso\')">Abonar</button>';
  } else {
    abonoHtml = saldoHtml;
  }

  /* monta linha */
  rows +=
    '<tr>' +
      '<td class="td-date">' + nomesDias[dt.getDay()] + ' ' + dataStr + '</td>' +
      '<td>' + cel(entrada)  + '</td>' +
      '<td>' + cel(saidaAlm) + '</td>' +
      '<td>' + cel(voltaAlm) + '</td>' +
      '<td>' + cel(saida)    + '</td>' +
      '<td style="text-align:right">' + heHtml + '</td>' +
      '<td style="text-align:right">' + abonoHtml + '</td>' +
      '<td class="td-hours">' + (horas !== null ? toHHMM(horas) : '<span class="td-dash">—</span>') + '</td>' +
      '<td>' + btnEditar + btnHE + '</td>' +
    '</tr>';
}

    /* ID único para o bloco */
    var blocoId = 'bloco-' + colab.id;

    html +=
      '<div class="colab-block" id="' + blocoId + '">' +

        '<div class="colab-header">' +
          '<div class="colab-avatar">' + colab.nome.charAt(0) + '</div>' +
          '<div class="colab-info">' +
            '<h3>' + colab.nome + '</h3>' +
            (colab.cargo ? '<p class="colab-cargo">' + colab.cargo + '</p>' : '') +
            '<p>' + diasC.length + ' dia(s) · ' + getJornadaStr(colab) + '</p>' +
          '</div>' +
          '<div class="colab-total">' +
            '<div class="label">TOTAL MÊS</div>' +
            '<div class="value">' + toHHMM(totalMin) + '</div>' +
          '</div>' +
          '<button class="btn-print-individual" onclick="imprimirFolhaIndividual(\'' + blocoId + '\')">' +
            '🖨️ Imprimir Folha' +
          '</button>' +
        '</div>' +

        '<div class="table-wrap">' +
          '<table>' +
            '<thead>' +
              '<tr>' +
                '<th>Data</th>' +
                '<th>Entrada</th>' +
                '<th>Saída Almoço</th>' +
                '<th>Volta Almoço</th>' +
                '<th>Saída</th>' +
                '<th style="text-align:right">Horas Extras</th>' +
                '<th style="text-align:right">Saldo</th>' +
                '<th style="text-align:right">Horas</th>' +
                '<th></th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rows + '</tbody>' +
          '</table>' +
        '</div>' +

      '</div>';
  }

  container.innerHTML = html;
}

/* 
  IMPRESSÃO INDIVIDUAL POR COLABORADOR
*/
function imprimirFolhaIndividual(blocoId) {
  var blocos = document.querySelectorAll('.colab-block');
  var i      = 0;
  for (i = 0; i < blocos.length; i++) {
    blocos[i].classList.remove('imprimindo');
  }
  var alvo = document.getElementById(blocoId);
  if (!alvo) return;
  alvo.classList.add('imprimindo');
  window.print();
  alvo.classList.remove('imprimindo');
}

/*
  EXPORTAÇÃO CSV
*/
function exportCSV() {
  var mesSel   = document.getElementById('selMes').value;
  var colabSel = document.getElementById('selColab').value;

  var regs = [];
  var i    = 0;
  for (i = 0; i < REGISTROS.length; i++) {
    var p = REGISTROS[i].data.split('/');
    if (p.length === 3 && (p[2] + '-' + p[1]) === mesSel) {
      if (!colabSel || REGISTROS[i].colabId == colabSel) {
        regs.push(REGISTROS[i]);
      }
    }
  }

  regs.sort(function(a, b) {
    var na = '';
    var nb = '';
    var j  = 0;
    for (j = 0; j < COLABORADORES.length; j++) {
      if (COLABORADORES[j].id === a.colabId) na = COLABORADORES[j].nome;
      if (COLABORADORES[j].id === b.colabId) nb = COLABORADORES[j].nome;
    }
    return na.localeCompare(nb) || a.data.localeCompare(b.data);
  });

  var csv = 'Colaborador,Data,Entrada,Saida Almoco,Volta Almoco,Saida,Horas Extras,Horas Trabalhadas,Saldo\n';

  for (i = 0; i < regs.length; i++) {
    var r     = regs[i];
    var colab = null;
    var j     = 0;
    for (j = 0; j < COLABORADORES.length; j++) {
      if (COLABORADORES[j].id === r.colabId) { colab = COLABORADORES[j]; break; }
    }
    var horas  = calcHorasTrabalhadas(r.batidas);
    var jorn   = colab ? getJornadaMinutos(colab, r.data) : 0;
    var saldo  = horas !== null ? horas - jorn : null;
    var totalHE = colab ? totalHEminutos(colab.id, r.data) : 0;

    csv +=
      (colab ? colab.nome : '') + ',' +
      r.data + ',' +
      (r.batidas[0] || '') + ',' +
      (r.batidas[1] || '') + ',' +
      (r.batidas[2] || '') + ',' +
      (r.batidas[3] || '') + ',' +
      (totalHE > 0 ? toHHMM(totalHE) : '') + ',' +
      (horas !== null ? toHHMM(horas) : '') + ',' +
      (saldo !== null ? toHHMM(saldo) : '') + '\n';
  }

  var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  var url  = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href     = url;
  link.download = 'ponto_' + mesSel + '.csv';
  link.click();
  URL.revokeObjectURL(url);
}