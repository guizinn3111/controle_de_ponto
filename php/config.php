<?php
/*
  CONFIG.PHP
  Conexão com o banco + funções auxiliares usadas por todos os
  outros arquivos PHP da API.

  IMPORTANTE: preencha DB_NAME, DB_USER e DB_PASS com os dados
  reais do banco que você criar no painel da KingHost.
*/

// ── Sessão (usada para saber quem está logado) ──────────────
session_start();

// ── Dados de conexão com o banco ────────────────────────────
define('DB_HOST', 'mysql18-farm10.kinghost.net');
define('DB_NAME', 'laboratorionov02');
define('DB_USER', 'laboratorionov02');
define('DB_PASS', 'mec123');

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Falha na conexão com o banco de dados']);
    exit;
}

// ── Lê o corpo JSON da requisição (POST/PUT) ────────────────
function corpoJson() {
    $raw = file_get_contents('php://input');
    $dados = json_decode($raw, true);
    return is_array($dados) ? $dados : [];
}

// ── Responde em JSON e encerra ───────────────────────────────
function responder($dados, $status = 200) {
    http_response_code($status);
    echo json_encode($dados);
    exit;
}

// ── Exige que exista alguém logado ──────────────────────────
function exigirLogin() {
    if (!isset($_SESSION['perfil'])) {
        responder(['erro' => 'Não autenticado. Faça login novamente.'], 401);
    }
}

// ── Exige que quem está logado seja admin ───────────────────
function exigirAdmin() {
    exigirLogin();
    if ($_SESSION['perfil'] !== 'admin') {
        responder(['erro' => 'Apenas o administrador pode fazer isso.'], 403);
    }
}

// ── Gera um ID único no mesmo formato usado pelo front-end ──
function gerarId() {
    return (string) round(microtime(true) * 1000) . '-' . random_int(0, 999999);
}
