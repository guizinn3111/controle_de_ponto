var USUARIOS = {
admin:'123',
financeiro: 'financeiro2025'
};

function doLogin() {
  var usuario = document.getElementById('loginUser').value.trim();
  var senha   = document.getElementById('loginPass').value.trim();

  if (USUARIOS[usuario] === senha) {
    /*  guarda o perfil logado */
    PERFIL_ATUAL = usuario;

    /*  se for admin, adiciona classe no body para mostrar botões de edição */
    if (usuario === 'admin') {
      document.body.classList.add('admin-logado');
    }

    document.getElementById('loginScreen').style.display = 'none';
    init();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

document.getElementById('loginPass')
  .addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doLogin();
  });