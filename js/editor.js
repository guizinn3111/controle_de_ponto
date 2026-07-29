/*
  EDITOR DE HORÁRIOS — APENAS ADMIN
 */

/* variável que guarda o perfil logado */
var PERFIL_ATUAL = '';

/*
  ABRE O MODAL DE EDIÇÃO DE UM REGISTRO
 */
function abrirEditor(registroId) {

  /* só admin pode editar */
  if (PERFIL_ATUAL !== 'admin') {
    alert('Apenas o administrador pode editar horários.');
    return;
  }

  /* encontra o registro */
  var reg = null;
  var i   = 0;
  for (i = 0; i < REGISTROS.length; i++) {
    if (REGISTROS[i].id === registroId) {
      reg = REGISTROS[i];
      break;
    }
  }
  if (!reg) return;

  /* encontra o colaborador */
  var colab = null;
  for (i = 0; i < COLABORADORES.length; i++) {
    if (COLABORADORES[i].id === reg.colabId) {
      colab = COLABORADORES[i];
      break;
    }
  }
  if (!colab) return;

  /* preenche os campos do modal */
  document.getElementById('editorId').value    = reg.id;
  document.getElementById('editorTitulo').textContent =
    colab.nome + ' — ' + reg.data;

  /* preenche os 4 campos de horário */
  var campos = ['editorH1','editorH2','editorH3','editorH4'];
  for (i = 0; i < campos.length; i++) {
    var campo = document.getElementById(campos[i]);
    if (campo) {
      campo.value = reg.batidas[i] ? reg.batidas[i].substring(0,5) : '';
    }
  }

  /* exibe o modal */
  document.getElementById('editorModal').style.display = 'flex';
}

/*
   SALVA AS ALTERAÇÕES DO MODAL
 */
async function salvarEdicao() {

  var registroId = document.getElementById('editorId').value;

  /* encontra o registro */
  var reg = null;
  var i   = 0;
  for (i = 0; i < REGISTROS.length; i++) {
    if (REGISTROS[i].id === registroId) {
      reg = REGISTROS[i];
      break;
    }
  }
  if (!reg) return;

  /* lê os campos */
  var h1 = document.getElementById('editorH1').value.trim();
  var h2 = document.getElementById('editorH2').value.trim();
  var h3 = document.getElementById('editorH3').value.trim();
  var h4 = document.getElementById('editorH4').value.trim();

  /* valida os campos preenchidos */
  var novoBatidas = [];
  var campos = [h1, h2, h3, h4];
  for (i = 0; i < campos.length; i++) {
    if (campos[i].length === 0) continue;
    if (!ehHorarioValido(campos[i])) {
      alert('Horário inválido: "' + campos[i] + '". Use o formato HH:MM.');
      return;
    }
    novoBatidas.push(campos[i]);
  }

  if (novoBatidas.length === 0) {
    alert('Informe pelo menos um horário.');
    return;
  }

  try {
    await apiRequest('registros.php', {
      method: 'PUT',
      body: JSON.stringify({ id: reg.id, batidas: novoBatidas })
    });

    /* atualiza o registro na memória */
    reg.batidas = novoBatidas;

    fecharEditor();
    renderRelatorio();

  } catch (e) {
    alert('Erro ao salvar no servidor: ' + e.message);
  }
}

/*
   EXCLUI UM REGISTRO PELO MODAL
 */
async function excluirRegistro() {

  if (!confirm('Tem certeza que deseja excluir este registro?')) return;

  var registroId = document.getElementById('editorId').value;

  try {
    await apiRequest('registros.php?id=' + encodeURIComponent(registroId), {
      method: 'DELETE'
    });

    var novoArr = [];
    var i       = 0;
    for (i = 0; i < REGISTROS.length; i++) {
      if (REGISTROS[i].id !== registroId) {
        novoArr.push(REGISTROS[i]);
      }
    }
    REGISTROS = novoArr;

    fecharEditor();
    renderRelatorio();

  } catch (e) {
    alert('Erro ao excluir no servidor: ' + e.message);
  }
}

/* 
   FECHA O MODAL
 */
function fecharEditor() {
  document.getElementById('editorModal').style.display = 'none';
}

/*
   VALIDA FORMATO HH:MM
 */
function ehHorarioValido(token) {
  if (!token || token.length < 5) return false;
  if (token.charAt(2) !== ':')    return false;
  var h = parseInt(token.substring(0, 2), 10);
  var m = parseInt(token.substring(3, 5), 10);
  if (isNaN(h) || isNaN(m)) return false;
  if (h < 0 || h > 23)     return false;
  if (m < 0 || m > 59)     return false;
  return true;
}

/*
  FECHA MODAL AO CLICAR FORA
 */
window.addEventListener('click', function(e) {
  var modal = document.getElementById('editorModal');
  if (modal && e.target === modal) {
    fecharEditor();
  }
});
