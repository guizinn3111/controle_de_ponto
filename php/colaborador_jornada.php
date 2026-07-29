<?php
require 'config.php';
exigirAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['erro' => 'Método não permitido'], 405);
}

$dados   = corpoJson();
$colabId = (int) ($dados['colabId'] ?? 0);
$tipo    = $dados['tipo'] ?? 'fixo';
$jornada = $dados['jornada'] ?? [];

if (!$colabId || empty($jornada)) {
    responder(['erro' => 'Preencha pelo menos Entrada e Saída.'], 400);
}

$stmt = $pdo->prepare('UPDATE colaboradores SET tipo = ?, jornada = ? WHERE id = ?');
$stmt->execute([$tipo, json_encode($jornada, JSON_UNESCAPED_UNICODE), $colabId]);

responder(['ok' => true]);
