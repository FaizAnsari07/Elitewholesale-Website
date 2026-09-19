<?php
// POST raw image bytes. Headers: X-Api-Key, Content-Type: image/*, X-Filename.
// Returns { url } -- an absolute URL served from this API host's /uploads/.
require __DIR__ . '/../../lib/config.php';
require_api_key();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['message' => 'Bad request'], 400);

$bytes = file_get_contents('php://input');
if ($bytes === false || $bytes === '') json_out(['message' => 'Empty upload'], 400);
if (strlen($bytes) > 8 * 1024 * 1024) json_out(['message' => 'File too large (8MB max)'], 413);

$mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
$allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
if (!isset($allowed[$mime])) json_out(['message' => 'Only JPG, PNG, WebP or GIF images are allowed'], 415);

$base = slugify(pathinfo($_SERVER['HTTP_X_FILENAME'] ?? 'image', PATHINFO_FILENAME)) ?: 'image';
$dir = __DIR__ . '/../uploads/' . date('Y/m');
if (!is_dir($dir) && !mkdir($dir, 0775, true)) json_out(['message' => 'Cannot create upload directory'], 500);
$name = $base . '-' . substr(md5($bytes), 0, 8) . '.' . $allowed[$mime];
file_put_contents($dir . '/' . $name, $bytes);

$publicBase = rtrim(getenv('PUBLIC_URL') ?: ((isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST']), '/');
json_out(['url' => $publicBase . '/uploads/' . date('Y/m') . '/' . $name], 201);
