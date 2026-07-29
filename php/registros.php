<?php
require 'config.php';
exigirLogin();

$metodo = $_SERVER['REQUEST_METHOD'];

// DD/MM/AAAA -> AAAA-MM-DD
function dataBrParaSql($dataBr) {
    $p = explode('/', $dataBr);
    if (count($p) !== 3) return null;
    return $p[2] . '-' . $p[1] . '-' . $p[0];
}

// AAAA-MM-DD -> DD/MM/AAAA
function dataSqlParaBr($dataSql) {
    $p = explode('-', $dataSql);
    if (count($p) !== 3) return $dataSql;
    return $p[2] . '/' . $p[1] . '/' . $p[0];
}

function formatarRegistro($row) {
    return [
        'id'      => $row['id'],
        'colabId' => (int) $row['colab_id'],
        'data'    => dataSqlParaBr($row['data']),
        'batidas' => json_decode($row['batidas'], true) ?: [],
    ];
}

function dedupeSort($lista) {
    $unicos = array_values(array_unique($lista));
    sort($unicos);
    return $unicos;
}

// ═══════════════════════════════════════════════════════════
// GET — lista registros (opcionalmente filtrados)
// ?mes=AAAA-MM&colabId=123
// ═══════════════════════════════════════════════════════════
if ($metodo === 'GET') {
    $mes     = $_GET['mes']     ?? null;
    $colabId = $_GET['colabId'] ?? null;

    $sql    = 'SELECT * FROM ponto_registros WHERE 1=1';
    $params = [];

    if ($mes) {
        $sql .= ' AND DATE_FORMAT(data, "%Y-%m") = ?';
        $params[] = $mes;
    }
    if ($colabId) {
        $sql .= ' AND colab_id = ?';
        $params[] = (int) $colabId;
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    responder(array_map('formatarRegistro', $stmt->fetchAll()));
}

// ═══════════════════════════════════════════════════════════
// POST — importar batidas em lote (faz merge dia a dia)
// body: { grupos: [ { colabId, data: "DD/MM/AAAA", horarios: ["07:31", ...] } ] }
// ═══════════════════════════════════════════════════════════
if ($metodo === 'POST') {
    $dados  = corpoJson();
    $grupos = $dados['grupos'] ?? [];

    $adicionados = 0;
    $atualizados = 0;
    $semMudanca  = 0;

    foreach ($grupos as $g) {
        $colabId  = (int) ($g['colabId'] ?? 0);
        $dataBr   = $g['data'] ?? '';
        $horarios = dedupeSort($g['horarios'] ?? []);
        $dataSql  = dataBrParaSql($dataBr);

        if (!$colabId || !$dataSql || empty($horarios)) continue;

        $stmt = $pdo->prepare('SELECT * FROM ponto_registros WHERE colab_id = ? AND data = ?');
        $stmt->execute([$colabId, $dataSql]);
        $existente = $stmt->fetch();

        if (!$existente) {
            $ins = $pdo->prepare(
                'INSERT INTO ponto_registros (id, colab_id, data, batidas) VALUES (?, ?, ?, ?)'
            );
            $ins->execute([gerarId(), $colabId, $dataSql, json_encode($horarios)]);
            $adicionados++;
            continue;
        }

        $batidasAtuais = json_decode($existente['batidas'], true) ?: [];
        $combinados    = dedupeSort(array_merge($batidasAtuais, $horarios));

        if ($combinados == $batidasAtuais) {
            $semMudanca++;
            continue;
        }

        $upd = $pdo->prepare('UPDATE ponto_registros SET batidas = ? WHERE id = ?');
        $upd->execute([json_encode($combinados), $existente['id']]);
        $atualizados++;
    }

    responder([
        'ok'          => true,
        'adicionados' => $adicionados,
        'atualizados' => $atualizados,
        'semMudanca'  => $semMudanca,
    ]);
}

// ═══════════════════════════════════════════════════════════
// PUT — edita um registro existente (admin)
// body: { id, batidas: ["07:30", "12:00", ...] }
// ═══════════════════════════════════════════════════════════
if ($metodo === 'PUT') {
    exigirAdmin();

    $dados   = corpoJson();
    $id      = $dados['id']      ?? '';
    $batidas = $dados['batidas'] ?? [];

    if ($id === '' || empty($batidas)) {
        responder(['erro' => 'Informe pelo menos um horário.'], 400);
    }

    $stmt = $pdo->prepare('UPDATE ponto_registros SET batidas = ? WHERE id = ?');
    $stmt->execute([json_encode($batidas), $id]);

    responder(['ok' => true]);
}

// ═══════════════════════════════════════════════════════════
// DELETE — exclui um registro (admin)
// ?id=xxxx
// ═══════════════════════════════════════════════════════════
if ($metodo === 'DELETE') {
    exigirAdmin();

    $id = $_GET['id'] ?? '';
    if ($id === '') responder(['erro' => 'id é obrigatório.'], 400);

    $stmt = $pdo->prepare('DELETE FROM ponto_registros WHERE id = ?');
    $stmt->execute([$id]);

    responder(['ok' => true]);
}

responder(['erro' => 'Método não permitido'], 405);
