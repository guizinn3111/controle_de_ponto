 function normalizarData(data) {
  if (!data) return '';
  data = String(data).trim();
  if (data.indexOf('-') > -1) {
    var p = data.split('-');
    if (p.length === 3) return p[2] + '/' + p[1] + '/' + p[0];
  }
  return data;
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAbono(colabId, data) {
  var dataNorm = normalizarData(data);
  return ABONOS.find(function(a) {
    return Number(a.colabId) === Number(colabId) &&
           normalizarData(a.data) === dataNorm;
  }) || null;
}

function isDiaFerias(colab, dataStr) {
  if (!colab.ferias) return false;

  var partes = dataStr.split('/');
  var ts     = new Date(
    parseInt(partes[2], 10),
    parseInt(partes[1], 10) - 1,
    parseInt(partes[0], 10)
  ).getTime();

  var pi = colab.ferias.inicio.split('/');
  var pf = colab.ferias.fim.split('/');

  var tsI = new Date(parseInt(pi[2],10), parseInt(pi[1],10)-1, parseInt(pi[0],10)).getTime();
  var tsF = new Date(parseInt(pf[2],10), parseInt(pf[1],10)-1, parseInt(pf[0],10)).getTime();

  return ts >= tsI && ts <= tsF;
}

function renderRelatorio() {
  var mesSel    = document.getElementById('selMes') ? document.getElementById('selMes').value : '';
  var colabSel  = document.getElementById('selColab') ? document.getElementById('selColab').value : '';
  var container = document.getElementById('relatorioContent');
  if (!container || !mesSel) return;

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

  var byColab = {};
  for (i = 0; i < regs.length; i++) {
    var cid = regs[i].colabId;
    if (!byColab[cid]) byColab[cid] = [];
    byColab[cid].push(regs[i]);
  }

  var colabs = [];
for (i = 0; i < COLABORADORES.length; i++) {
  var c = COLABORADORES[i];
  if (!colabSel || c.id == colabSel) {  // ← respeita o filtro de colaborador
    colabs.push(c);
    if (!byColab[c.id]) byColab[c.id] = []; // ← garante array vazio para quem não tem registro
  }
}
colabs.sort(function(a, b) { return a.nome.localeCompare(b.nome); });

 

  var totalGeral = 0;
  var j = 0;
  for (i = 0; i < colabs.length; i++) {
    var dias = byColab[colabs[i].id];
    for (j = 0; j < dias.length; j++) {
      var h = calcHorasTrabalhadas(dias[j].batidas);
      if (h) totalGeral += h;
    }
  }

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

  for (i = 0; i < colabs.length; i++) {
    var colab = colabs[i];
    var diasC = byColab[colab.id];

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

      /* Dia de férias */
if (isDiaFerias(colab, dataStr)) {
  rows +=
    '<tr class="tr-ferias">' +
      '<td class="td-date">' + nomesDias[dt.getDay()] + ' ' + dataStr + '</td>' +
      '<td colspan="7" style="text-align:center; color:#b45309; font-weight:700; font-style:italic;">🏖️ Férias</td>' +
      '<td></td>' +
    '</tr>';
  continue;
}

      var entrada, saidaAlm, voltaAlm, saida, horas, jornMin, saldo, heHtml, abonoHtml, btnEditar, btnHE;

      if (!r) {
        entrada  = '';
        saidaAlm = '';
        voltaAlm = '';
        saida    = '';
        horas    = null;
        jornMin  = getJornadaMinutos(colab, dataStr);
        saldo    = -jornMin;
        heHtml   = '<span class="td-dash">—</span>';

        var abono = getAbono(colab.id, dataStr);
        abonoHtml = '';

        if (abono) {
          abonoHtml =
            '<span class="badge-abono" title="' + escapeHtml(abono.motivo) + '">&#10003; ' + escapeHtml(abono.motivo) + '</span>' +
            '<button class="btn-rm-abono" onclick="removerAbono(' + colab.id + ', \'' + normalizarData(dataStr) + '\')">&#10005;</button>';
        } else {
          abonoHtml =
            '<span class="badge-late">Falta</span> ' +
            '<button class="btn-abonar" onclick="abrirModalAbono(' + colab.id + ', \'' + dataStr + '\', \'falta\')">Abonar</button>';
        }

        btnEditar = '';
        btnHE     = '';

      } else {
        entrada  = r.batidas[0] || '';
        saidaAlm = r.batidas[1] || '';
        voltaAlm = r.batidas[2] || '';
        saida    = r.batidas[3] || '';
        horas    = calcHorasTrabalhadas(r.batidas);
        jornMin  = getJornadaMinutos(colab, r.data);
        saldo    = horas !== null ? horas - jornMin : null;
        if (horas) totalMin += horas;

        var listaHE = getHorasExtras(colab.id, r.data);
        var totalHE = totalHEminutos(colab.id, r.data);
        heHtml = '';
        if (listaHE.length > 0) {
          heHtml = '+' + toHHMM(totalHE);
        } else {
          heHtml = '<span class="td-dash">—</span>';
        }

        var saldoHtml = '';
        if (saldo !== null && jornMin > 0) {
          if      (saldo >  5) saldoHtml = '<span class="badge-extra">+' + toHHMM(saldo) + '</span>';
          else if (saldo < -5) saldoHtml = '<span class="badge-late">'  + toHHMM(saldo) + '</span>';
          else                 saldoHtml = '<span class="badge-ok">&#10003;</span>';
        }

        var abono = getAbono(colab.id, r.data);
        abonoHtml = '';

        if (abono) {
          abonoHtml =
            '<span class="badge-abono" title="' + escapeHtml(abono.motivo) + '">&#10003; ' + escapeHtml(abono.motivo) + '</span>' +
            '<button class="btn-rm-abono" onclick="removerAbono(' + colab.id + ', \'' + normalizarData(r.data) + '\')">&#10005;</button>';
        } else if (saldo !== null && saldo < -5) {
          abonoHtml =
            saldoHtml +
            '<button class="btn-abonar" onclick="abrirModalAbono(' + colab.id + ', \'' + r.data + '\', \'atraso\')">Abonar</button>';
        } else {
          abonoHtml = saldoHtml;
        }

        btnEditar =
          '<button class="btn-editar-linha" onclick="abrirEditor(\'' + r.id + '\')">' +
            '&#9999;&#65039; Editar' +
          '</button>';

        btnHE =
          '<button class="btn-lancar-he" onclick="abrirModalHorasExtras(' +
            colab.id + ', \'' + r.data + '\')">' +
            '+ HE' +
          '</button>';
      }

      var cel = function(v) { return v ? v : '<span class="td-dash">—</span>'; };

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
            '&#128424;&#65039; Imprimir Folha' +
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

        '<div class="folha-rodape">' +
          '<div class="rodape-data">' +
            'Rio de Janeiro, ______ / ______ / __________' +
          '</div>' +
          '<div class="rodape-assinatura">' +
            '<div class="linha-assinatura"></div>' +
            '<p>Assinatura do Funcionário</p>' +
          '</div>' +
        '</div>' +

      '</div>';
  }

  container.innerHTML = html;
}

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
    var horas   = calcHorasTrabalhadas(r.batidas);
    var jorn    = colab ? getJornadaMinutos(colab, r.data) : 0;
    var saldo   = horas !== null ? horas - jorn : null;
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