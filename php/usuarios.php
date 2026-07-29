<?php
require 'config.php';
exigirAdmin();

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $stmt = $pdo->query('SELECT usuario, perfil FROM usuarios ORDER BY usuario');
    responder($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $dados   = corpoJson();
    $usuario = trim($dados['usuario'] ?? '');
    $senha   = trim($dados['senha']   ?? '');
    $perfil  = trim($dados['perfil']  ?? 'usuario');

    if ($usuario === '' || $senha === '') {
        responder(['erro' => 'Informe usuário e senha.'], 400);
    }
    if (strlen($senha) < 4) {
        responder(['erro' => 'A senha precisa ter pelo menos 4 caracteres.'], 400);
    }

    $hash = password_hash($senha, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare('INSERT INTO usuarios (usuario, senha_hash, perfil) VALUES (?, ?, ?)');
        $stmt->execute([$usuario, $hash, $perfil]);
    } catch (PDOException $e) {
        // erro 23000 = violação de UNIQUE (usuário já existe)
        if ($e->getCode() === '23000') {
            responder(['erro' => 'Já existe um usuário com esse nome.'], 409);
        }
        throw $e;
    }

    responder(['ok' => true]);
}

if ($metodo === 'PUT') {
    $dados     = corpoJson();
    $usuario   = trim($dados['usuario']   ?? '');
    $senhaNova = trim($dados['senhaNova'] ?? '');

    if ($usuario === '' || $senhaNova === '') {
        responder(['erro' => 'Informe o usuário e a nova senha.'], 400);
    }
    if (strlen($senhaNova) < 4) {
        responder(['erro' => 'A senha precisa ter pelo menos 4 caracteres.'], 400);
    }

    $hash = password_hash($senhaNova, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('UPDATE usuarios SET senha_hash = ? WHERE usuario = ?');
    $stmt->execute([$hash, $usuario]);

    if ($stmt->rowCount() === 0) {
        responder(['erro' => 'Usuário não encontrado.'], 404);
    }

    responder(['ok' => true]);
}

if ($metodo === 'DELETE') {
    $usuario = trim($_GET['usuario'] ?? '');
    if ($usuario === '') responder(['erro' => 'usuario é obrigatório.'], 400);

    if ($usuario === $_SESSION['usuario']) {
        responder(['erro' => 'Você não pode excluir o usuário com o qual está logado.'], 400);
    }

    // impede excluir o último admin (senão ninguém mais consegue administrar o sistema)
    $stmt = $pdo->prepare('SELECT perfil FROM usuarios WHERE usuario = ?');
    $stmt->execute([$usuario]);
    $alvo = $stmt->fetch();

    if ($alvo && $alvo['perfil'] === 'admin') {
        $totalAdmins = (int) $pdo->query("SELECT COUNT(*) FROM usuarios WHERE perfil = 'admin'")->fetchColumn();
        if ($totalAdmins <= 1) {
            responder(['erro' => 'Não é possível excluir o último administrador do sistema.'], 400);
        }
    }

    $pdo->prepare('DELETE FROM usuarios WHERE usuario = ?')->execute([$usuario]);
    responder(['ok' => true]);
}

responder(['erro' => 'Método não permitido'], 405);
