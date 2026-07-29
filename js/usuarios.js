/*
  GERENCIAR USUÁRIOS — página separada, só para administradores.
 */

function mostrarMensagem(texto, tipo) {
  const el = document.getElementById('mensagem');
  el.textContent = texto;
  el.className = tipo === 'erro' ? 'alert alert-warn' : 'alert alert-info';
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

async function carregarUsuarios() {
  try {
    const usuarios = await apiRequest('usuarios.php');

    document.getElementById('bloqueado').style.display = 'none';
    document.getElementById('conteudo').style.display   = 'block';

    const lista = document.getElementById('listaUsuarios');
    lista.innerHTML = usuarios.map(u => `
      <div class="linha-usuario">
        <div>
          <div class="nome">${u.usuario}</div>
          <div class="perfil">${u.perfil === 'admin' ? 'Administrador' : 'Usuário comum'}</div>
        </div>
        <div class="acoes">
          <button class="btn btn-outline btn-sm" onclick="trocarSenha('${u.usuario}')">
            🔑 Trocar Senha
          </button>
          <button class="btn btn-sm" style="background:var(--red); color:white"
                  onclick="excluirUsuario('${u.usuario}')">
            🗑️ Excluir
          </button>
        </div>
      </div>
    `).join('');

  } catch (e) {
    document.getElementById('bloqueado').style.display = 'block';
    document.getElementById('conteudo').style.display   = 'none';
  }
}

async function criarUsuario() {
  const usuario = document.getElementById('novoUsuario').value.trim();
  const senha   = document.getElementById('novaSenha').value.trim();
  const perfil  = document.getElementById('novoPerfil').value;

  if (!usuario || !senha) {
    mostrarMensagem('Preencha usuário e senha.', 'erro');
    return;
  }

  try {
    await apiRequest('usuarios.php', {
      method: 'POST',
      body: JSON.stringify({ usuario, senha, perfil })
    });

    document.getElementById('novoUsuario').value = '';
    document.getElementById('novaSenha').value   = '';
    mostrarMensagem('Usuário criado com sucesso.', 'ok');
    carregarUsuarios();

  } catch (e) {
    mostrarMensagem(e.message, 'erro');
  }
}

async function trocarSenha(usuario) {
  const senhaNova = prompt(`Nova senha para "${usuario}" (mínimo 4 caracteres):`);
  if (senhaNova === null) return; // cancelou
  if (senhaNova.trim().length < 4) {
    mostrarMensagem('A senha precisa ter pelo menos 4 caracteres.', 'erro');
    return;
  }

  try {
    await apiRequest('usuarios.php', {
      method: 'PUT',
      body: JSON.stringify({ usuario, senhaNova: senhaNova.trim() })
    });
    mostrarMensagem('Senha alterada com sucesso.', 'ok');

  } catch (e) {
    mostrarMensagem(e.message, 'erro');
  }
}

async function excluirUsuario(usuario) {
  if (!confirm(`Tem certeza que deseja excluir o usuário "${usuario}"?`)) return;

  try {
    await apiRequest('usuarios.php?usuario=' + encodeURIComponent(usuario), { method: 'DELETE' });
    mostrarMensagem('Usuário excluído.', 'ok');
    carregarUsuarios();

  } catch (e) {
    mostrarMensagem(e.message, 'erro');
  }
}

carregarUsuarios();