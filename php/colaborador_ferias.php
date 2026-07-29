<?php
require 'config.php';
exigirAdmin();

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $dados   = corpoJson();
    $colabId = (int) ($dados['colabId'] ?? 0);
    $inicio  = trim($dados['inicio'] ?? '');
    $fim     = trim($dados['fim'] ?? '');

    if (!$colabId || $inicio === '' || $fim === '') {
        responder(['erro' => 'Preencha as datas de início e fim das férias.'], 400);
    }

    $ferias = json_encode(['inicio' => $inicio, 'fim' => $fim], JSON_UNESCAPED_UNICODE);
    $stmt = $pdo->prepare('UPDATE colaboradores SET ferias = ? WHERE id = ?');
    $stmt->execute([$ferias, $colabId]);

    responder(['ok' => true]);
}

if ($metodo === 'DELETE') {
    $colabId = (int) ($_GET['colabId'] ?? 0);
    if (!$colabId) responder(['erro' => 'colabId é obrigatório.'], 400);

    $stmt = $pdo->prepare('UPDATE colaboradores SET ferias = NULL WHERE id = ?');
    $stmt->execute([$colabId]);

    responder(['ok' => true]);
}

responder(['erro' => 'Método não permitido'], 405);
