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
    $stmt = $pdo->query('SELECT * FROM ponto_abonos');
    $lista = array_map(function ($r) {
        return [
            'id'       => $r['id'],
            'colabId'  => (int) $r['colab_id'],
            'data'     => dataSqlParaBr($r['data']),
            'tipo'     => $r['tipo'],
            'motivo'   => $r['motivo'],
            'criadoEm' => $r['criado_em'],
        ];
    }, $stmt->fetchAll());

    responder($lista);
}

if ($metodo === 'POST') {
    exigirAdmin();

    $dados   = corpoJson();
    $colabId = (int) ($dados['colabId'] ?? 0);
    $dataBr  = trim($dados['data']   ?? '');
    $tipo    = trim($dados['tipo']   ?? '');
    $motivo  = trim($dados['motivo'] ?? '');
    $dataSql = dataBrParaSql($dataBr);

    if (!$colabId || !$dataSql || $motivo === '') {
        responder(['erro' => 'Informe o motivo do abono.'], 400);
    }

    // remove abono anterior do mesmo dia (se existir) e insere o novo
    $pdo->beginTransaction();
    $pdo->prepare('DELETE FROM ponto_abonos WHERE colab_id = ? AND data = ?')
        ->execute([$colabId, $dataSql]);

    $id = gerarId();
    $pdo->prepare(
        'INSERT INTO ponto_abonos (id, colab_id, data, tipo, motivo, criado_em) VALUES (?, ?, ?, ?, ?, NOW())'
    )->execute([$id, $colabId, $dataSql, $tipo, $motivo]);
    $pdo->commit();

    responder(['ok' => true, 'id' => $id]);
}

if ($metodo === 'DELETE') {
    exigirAdmin();

    $colabId = (int) ($_GET['colabId'] ?? 0);
    $dataSql = dataBrParaSql($_GET['data'] ?? '');

    if (!$colabId || !$dataSql) {
        responder(['erro' => 'colabId e data são obrigatórios.'], 400);
    }

    $pdo->prepare('DELETE FROM ponto_abonos WHERE colab_id = ? AND data = ?')
        ->execute([$colabId, $dataSql]);

    responder(['ok' => true]);
}

responder(['erro' => 'Método não permitido'], 405);
