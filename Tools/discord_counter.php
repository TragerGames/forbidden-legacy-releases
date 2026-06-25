<?php
// ============================================================
//  /discord_counter.php — Proxy para o contador do Discord
//  Busca membros via API do Discord server-side (evita CORS
//  no Safari/iOS) e faz cache de 5 minutos no servidor.
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=300');

$INVITE_CODE = 'MkJXZ9tNQ6';
$CACHE_FILE  = sys_get_temp_dir() . '/fl_discord_counter.json';
$CACHE_TTL   = 300; // 5 minutos

// Retorna cache se ainda válido
if (file_exists($CACHE_FILE)) {
    $cached = json_decode(file_get_contents($CACHE_FILE), true);
    if ($cached && isset($cached['ts']) && (time() - $cached['ts']) < $CACHE_TTL) {
        echo json_encode(['online' => $cached['online'], 'total' => $cached['total']]);
        exit;
    }
}

// Busca na API pública do Discord via cURL (mais confiável em hospedagem compartilhada)
$url = "https://discord.com/api/v9/invites/{$INVITE_CODE}?with_counts=true";
$ch  = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 6,
    CURLOPT_HTTPHEADER     => ['User-Agent: ForbiddenLegacy/1.0'],
    CURLOPT_SSL_VERIFYPEER => true,
]);
$body = curl_exec($ch);
$err  = curl_error($ch);
curl_close($ch);

if (!$body || $err) {
    // Fallback: cache antigo ou zeros
    if (file_exists($CACHE_FILE)) {
        $old = json_decode(file_get_contents($CACHE_FILE), true);
        echo json_encode(['online' => $old['online'] ?? 0, 'total' => $old['total'] ?? 0]);
    } else {
        echo json_encode(['online' => 0, 'total' => 0]);
    }
    exit;
}

$data   = json_decode($body, true);
$online = $data['approximate_presence_count'] ?? 0;
$total  = $data['approximate_member_count']   ?? 0;

// Salva cache
@file_put_contents($CACHE_FILE, json_encode(['online' => $online, 'total' => $total, 'ts' => time()]));

echo json_encode(['online' => $online, 'total' => $total]);
