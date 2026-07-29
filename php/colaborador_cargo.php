<?php
require 'config.php';
exigirAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['erro' => 'Método não permitido'], 405);
}

$dados   = corpoJson();
$colabId = (int) ($dados['colabId'] ?? 0);
$cargo   = trim($dados['cargo'] ?? '');

if (!$colabId || $cargo === '') {
    responder(['erro' => 'Informe o cargo.'], 400);
}

$stmt = $pdo->prepare('UPDATE colaboradores SET cargo = ? WHERE id = ?');
$stmt->execute([$cargo, $colabId]);

responder(['ok' => true]);
