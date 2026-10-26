<?php
/**
 * IsoRoom Studio - PHP API Backend
 * 
 * Replaces server.py when deploying to PHP + Nginx.
 * 
 * Endpoints handled:
 * - GET  /api/sprites       -> Auto-discovers all images in assets/ and updates manifest
 * - POST /api/save-sprite   -> Saves transparent PNG to assets/sprites/
 * - POST /api/delete-sprite -> Deletes a sprite from assets/ and updates manifest
 */

// Enable CORS and disable response caching
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Determine endpoint route
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$endpoint = $_GET['endpoint'] ?? $_GET['action'] ?? '';

if (empty($endpoint)) {
    if (preg_match('#/api/([^/?]+)#', $uri, $matches)) {
        $endpoint = $matches[1];
    } elseif (preg_match('#api\.php/([^/?]+)#', $uri, $matches)) {
        $endpoint = $matches[1];
    }
}

$valid_extensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];
$base_dir = __DIR__;
$assets_dir = $base_dir . '/assets';

/**
 * Recursively scans assets/ for images and infers categories.
 */
function scan_assets_directory($assets_dir, $base_dir, $valid_extensions) {
    $items = [];
    if (!is_dir($assets_dir)) {
        return $items;
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($assets_dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($iterator as $fileinfo) {
        if ($fileinfo->isFile()) {
            $ext = strtolower($fileinfo->getExtension());
            if (in_array($ext, $valid_extensions, true)) {
                $filename = $fileinfo->getFilename();
                $pathname = $fileinfo->getPathname();
                $rel_path = str_replace('\\', '/', ltrim(str_replace($base_dir, '', $pathname), '/\\'));
                $fname_lower = strtolower($filename);

                // Category inference
                if (preg_match('/(lamp|light|candle|lantern)/i', $fname_lower)) {
                    $category = 'Lighting';
                } elseif (preg_match('/(plant|flower|tree|pot|rug|art|decor)/i', $fname_lower)) {
                    $category = 'Decor';
                } elseif (preg_match('/(shelf|bookshelf|storage|wardrobe|cabinet)/i', $fname_lower)) {
                    $category = 'Storage';
                } elseif (preg_match('/(floor|carpet|stone|tile|wood|ground)/i', $fname_lower)) {
                    $category = 'Floors';
                } elseif (preg_match('/(wall|window|door|brick)/i', $fname_lower)) {
                    $category = 'Walls';
                } elseif (preg_match('/(sofa|couch|chair|table|desk|bed|bench|tv)/i', $fname_lower)) {
                    $category = 'Furniture';
                } else {
                    $category = 'Decor';
                }

                $name_no_ext = pathinfo($filename, PATHINFO_FILENAME);
                $friendly_name = ucwords(str_replace(['_', '-'], ' ', $name_no_ext));
                $id = strtolower(str_replace(' ', '_', $name_no_ext));

                $items[] = [
                    'id' => $id,
                    'name' => $friendly_name,
                    'category' => $category,
                    'filename' => $filename,
                    'src' => $rel_path,
                    'tags' => [strtolower($category), $ext]
                ];
            }
        }
    }

    // Sort by name
    usort($items, function($a, $b) {
        return strcasecmp($a['name'], $b['name']);
    });

    return $items;
}

/**
 * Updates assets/manifest.json and assets/manifest.js if directory is writable
 */
function update_manifest_files($items, $assets_dir) {
    if (!is_dir($assets_dir) || !is_writable($assets_dir)) {
        return;
    }

    $json_path = $assets_dir . '/manifest.json';
    $js_path = $assets_dir . '/manifest.js';

    $json_content = json_encode($items, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    @file_put_contents($json_path, $json_content);

    $js_content = "// Auto-generated assets manifest\nwindow.ASSETS_MANIFEST = " . $json_content . ";\n";
    @file_put_contents($js_path, $js_content);
}

// Route handlers
header('Content-Type: application/json; charset=utf-8');

switch ($endpoint) {
    case 'sprites':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $sprites = scan_assets_directory($assets_dir, $base_dir, $valid_extensions);
        update_manifest_files($sprites, $assets_dir);

        echo json_encode($sprites, JSON_UNESCAPED_SLASHES);
        break;

    case 'save-sprite':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $input = file_get_contents('php://input');
        $data = json_decode($input, true);

        if (!$data || empty($data['dataUrl'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid or missing dataUrl payload']);
            exit;
        }

        $filename = basename($data['filename'] ?? 'sprite_transparent.png');
        if (!preg_match('/\.png$/i', $filename)) {
            $filename .= '.png';
        }

        $target_dir = $assets_dir . '/sprites';
        if (!is_dir($target_dir)) {
            @mkdir($target_dir, 0775, true);
        }

        $target_path = $target_dir . '/' . $filename;
        $data_url = $data['dataUrl'];

        if (strpos($data_url, ',') !== false) {
            $parts = explode(',', $data_url, 2);
            $data_url = $parts[1];
        }

        $binary = base64_decode($data_url);
        if ($binary === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Base64 decoding failed']);
            exit;
        }

        $written = @file_put_contents($target_path, $binary);
        if ($written === false) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to write file. Check directory write permissions.']);
            exit;
        }

        // Re-scan and refresh manifest
        $sprites = scan_assets_directory($assets_dir, $base_dir, $valid_extensions);
        update_manifest_files($sprites, $assets_dir);

        echo json_encode([
            'success' => true,
            'path' => 'assets/sprites/' . $filename,
            'filename' => $filename,
            'bytes' => $written,
            'message' => "Saved {$filename} successfully."
        ], JSON_UNESCAPED_SLASHES);
        break;

    case 'delete-sprite':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $filename = basename($data['filename'] ?? '');

        $deleted = false;
        if (!empty($filename) && is_dir($assets_dir)) {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($assets_dir, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::SELF_FIRST
            );

            foreach ($iterator as $fileinfo) {
                if ($fileinfo->isFile() && $fileinfo->getFilename() === $filename) {
                    if (@unlink($fileinfo->getPathname())) {
                        $deleted = true;
                        break;
                    }
                }
            }
        }

        // Re-scan and refresh manifest
        $sprites = scan_assets_directory($assets_dir, $base_dir, $valid_extensions);
        update_manifest_files($sprites, $assets_dir);

        echo json_encode([
            'success' => true,
            'deleted' => $deleted,
            'filename' => $filename
        ], JSON_UNESCAPED_SLASHES);
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'requested_uri' => $uri,
            'detected_endpoint' => $endpoint,
            'supported_endpoints' => ['/api/sprites', '/api/save-sprite', '/api/delete-sprite']
        ]);
        break;
}

