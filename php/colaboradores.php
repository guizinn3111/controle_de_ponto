<?php
require 'config.php';
exigirLogin();

$metodo = $_SERVER['REQUEST_METHOD'];

// ── Transforma uma linha do banco no mesmo formato que o front-end espera ──
function formatarColab($row) {
    return [
        'id'       => (int) $row['id'],
        'nome'     => $row['nome'],
        'cargo'    => $row['cargo'],
        'apelidos' => json_decode($row['apelidos'], true) ?: [],
        'tipo'     => $row['tipo'],
        'jornada'  => json_decode($row['jornada'], true) ?: [],
        'rescisao' => $row['rescisao'] !== null ? json_decode($row['rescisao'], true) : null,
        'ferias'   => $row['ferias']   !== null ? json_decode($row['ferias'],   true) : null,
    ];
}

if ($metodo === 'GET') {
    $stmt = $pdo->query('SELECT * FROM colaboradores ORDER BY nome');
    $colabs = array_map('formatarColab', $stmt->fetchAll());
    responder($colabs);
}

if ($metodo === 'POST') {
    exigirAdmin();

    $dados    = corpoJson();
    $nome     = trim($dados['nome'] ?? '');
    $cargo    = trim($dados['cargo'] ?? '');
    $tipo     = $dados['tipo'] ?? 'fixo';
    $apelidos = $dados['apelidos'] ?? [];
    $jornada  = $dados['jornada'] ?? [];

    if ($nome === '') {
        responder(['erro' => 'Informe o nome do colaborador.'], 400);
    }
    if (empty($jornada)) {
        responder(['erro' => 'Informe pelo menos entrada e saída.'], 400);
    }

    // próximo ID livre
    $novoId = (int) $pdo->query('SELECT COALESCE(MAX(id), 0) + 1 FROM colaboradores')->fetchColumn();

    $stmt = $pdo->prepare(
        'INSERT INTO colaboradores (id, nome, cargo, apelidos, tipo, jornada, rescisao, ferias)
         VALUES (?, ?, ?, ?, ?, ?, NULL, NULL)'
    );
    $stmt->execute([
        $novoId,
        strtoupper($nome),
        $cargo,
        json_encode($apelidos, JSON_UNESCAPED_UNICODE),
        $tipo,
        json_encode($jornada, JSON_UNESCAPED_UNICODE),
    ]);

    responder(['ok' => true, 'id' => $novoId]);
}

responder(['erro' => 'Método não permitido'], 405);
