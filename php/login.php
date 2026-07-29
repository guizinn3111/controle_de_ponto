<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['erro' => 'Método não permitido'], 405);
}

$dados   = corpoJson();
$usuario = trim($dados['usuario'] ?? '');
$senha   = trim($dados['senha'] ?? '');

if ($usuario === '' || $senha === '') {
    responder(['erro' => 'Informe usuário e senha.'], 400);
}

$stmt = $pdo->prepare('SELECT usuario, senha_hash, perfil FROM usuarios WHERE usuario = ?');
$stmt->execute([$usuario]);
$user = $stmt->fetch();

if (!$user || !password_verify($senha, $user['senha_hash'])) {
    responder(['erro' => 'Usuário ou senha incorretos.'], 401);
}

$_SESSION['usuario'] = $user['usuario'];
$_SESSION['perfil']  = $user['perfil'];

responder([
    'ok'      => true,
    'usuario' => $user['usuario'],
    'perfil'  => $user['perfil'],
]);
