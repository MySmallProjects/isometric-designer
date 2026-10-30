<?php
/**
 * IsoRoom Studio - Web & API Front Controller
 * 
 * Allows standard Nginx / Apache PHP setups (e.g., try_files $uri $uri/ /index.php?$query_string)
 * to automatically route all /api/* requests to api.php, while serving index.html for UI requests.
 */

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// If request is for /api/* or specifies endpoint/action, route to api.php
if (preg_match('#^/api(/|$)#', $uri) || isset($_GET['endpoint']) || isset($_GET['action'])) {
    require __DIR__ . '/api.php';
    exit;
}

// Serve main app for root or other web requests
$indexPath = __DIR__ . '/index.html';
if (file_exists($indexPath)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($indexPath);
    exit;
}

http_response_code(404);
echo "404 Not Found";

