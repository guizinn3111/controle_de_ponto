<?php
require 'config.php';
exigirLogin();

$metodo = $_SERVER['REQUEST_METHOD'];

function dataBrParaSql($dataBr) {
    $p = explode('/', $dataBr);
    if (count($p) !== 3) return null;
    return $p[2] . '-' . $p[1] . '-' . $p[0];
}
function dataSqlParaBr($dataSql) {
    $p = explode('-', $dataSql);
    if (count($p) !== 3) return $dataSql;
    return $p[2] . '/' . $p[1] . '/' . $p[0];
}

if ($metodo === 'GET') {
    $stmt = $pdo->query('SELECT * FROM ponto_horas_extras');
    $lista = array_map(function ($r) {
        return [
            'id'         => $r['id'],
            'colabId'    => (int) $r['colab_id'],
            'data'       => dataSqlParaBr($r['data']),
            'quantidade' => $r['quantidade'],
            'minutos'    => (int) $r['minutos'],
            'motivo'     => $r['motivo'],
            'criadoEm'   => $r['criado_em'],
        ];
    }, $stmt->fetchAll());

    responder($lista);
}

if ($metodo === 'POST') {
    exigirAdmin();

    $dados      = corpoJson();
    $colabId    = (int) ($dados['colabId'] ?? 0);
    $dataSql    = dataBrParaSql(trim($dados['data'] ?? ''));
    $quantidade = trim($dados['quantidade'] ?? '');
    $minutos    = (int) ($dados['minutos'] ?? 0);
    $motivo     = trim($dados['motivo'] ?? '');

    if (!$colabId || !$dataSql || $quantidade === '' || $minutos <= 0 || $motivo === '') {
        responder(['erro' => 'Preencha quantidade e motivo corretamente.'], 400);
    }

    $id = gerarId();
    $pdo->prepare(
        'INSERT INTO ponto_horas_extras (id, colab_id, data, quantidade, minutos, motivo, criado_em)
         VALUES (?, ?, ?, ?, ?, ?, NOW())'
    )->execute([$id, $colabId, $dataSql, $quantidade, $minutos, $motivo]);

    responder(['ok' => true, 'id' => $id]);
}

if ($metodo === 'DELETE') {
    exigirAdmin();

    $id = $_GET['id'] ?? '';
    if ($id === '') responder(['erro' => 'id é obrigatório.'], 400);

    $pdo->prepare('DELETE FROM ponto_horas_extras WHERE id = ?')->execute([$id]);

    responder(['ok' => true]);
}

responder(['erro' => 'Método não permitido'], 405);
