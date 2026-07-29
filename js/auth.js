/*
  AUTENTICAÇÃO — agora valida usuário/senha no servidor
  (tabela `usuarios`) em vez de usar uma lista fixa no código.
 */

async function doLogin() {
  const usuario = document.getElementById('loginUser').value.trim();
  const senha   = document.getElementById('loginPass').value.trim();

  const btn = document.querySelector('.login-btn');
  const textoOriginal = btn ? btn.textContent : null;
  if (btn) { btn.disabled = true; btn.textContent = 'Entrando...'; }

  try {
    const resp = await apiRequest('login.php', {
      method: 'POST',
      body: JSON.stringify({ usuario, senha })
    });

    /* guarda o perfil logado */
    PERFIL_ATUAL = resp.perfil;

    /* se for admin, adiciona classe no body para mostrar botões de edição */
    if (PERFIL_ATUAL === 'admin') {
      document.body.classList.add('admin-logado');
    }

    document.getElementById('loginError').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'none';
    await init();

  } catch (e) {
    document.getElementById('loginError').textContent =
      e.message || 'Usuário ou senha incorretos.';
    document.getElementById('loginError').style.display = 'block';

  } finally {
    if (btn) { btn.disabled = false; btn.textContent = textoOriginal; }
  }
}

document.getElementById('loginPass')
  .addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doLogin();
  });
