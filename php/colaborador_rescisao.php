<?php
require 'config.php';
exigirAdmin();

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $dados   = corpoJson();
    $colabId = (int) ($dados['colabId'] ?? 0);
    $data    = trim($dados['data'] ?? '');

    if (!$colabId || $data === '') {
        responder(['erro' => 'Selecione a data da rescisão.'], 400);
    }

    $rescisao = json_encode(['ativo' => false, 'data' => $data], JSON_UNESCAPED_UNICODE);
    $stmt = $pdo->prepare('UPDATE colaboradores SET rescisao = ? WHERE id = ?');
    $stmt->execute([$rescisao, $colabId]);

    responder(['ok' => true]);
}

if ($metodo === 'DELETE') {
    $colabId = (int) ($_GET['colabId'] ?? 0);
    if (!$colabId) responder(['erro' => 'colabId é obrigatório.'], 400);

    $stmt = $pdo->prepare('UPDATE colaboradores SET rescisao = NULL WHERE id = ?');
    $stmt->execute([$colabId]);

    responder(['ok' => true]);
}

responder(['erro' => 'Método não permitido'], 405);
