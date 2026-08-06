<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Serve built frontend assets directly if the file exists (not used in API-only mode,
// kept here in case the frontend is ever served from the same origin).
if ($uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH)) {
    $candidate = __DIR__.$uri;
    if ($uri !== '/' && file_exists($candidate) && is_file($candidate)) {
        return false;
    }
}

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
