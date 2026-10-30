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
 * Infers sprite pack name from file's directory relative to assets/
 */
function infer_sprite_pack($pathname, $assets_dir) {
    $rel_assets = str_replace('\\', '/', ltrim(str_replace($assets_dir, '', $pathname), '/\\'));
    $parts = explode('/', $rel_assets);
    
    // e.g. "sprites/chair.svg" -> Core
    // e.g. "sprites/modern_living/chair.svg" -> Modern Living
    // e.g. "packs/cyberpunk/chair.svg" -> Cyberpunk
    // e.g. "fantasy/chair.svg" -> Fantasy
    if (count($parts) > 1) {
        $first = strtolower($parts[0]);
        if (in_array($first, ['sprites', 'packs', 'images']) && count($parts) > 2) {
            $folder = $parts[1];
        } elseif (!in_array($first, ['sprites', 'packs', 'images'])) {
            $folder = $parts[0];
        } else {
            $folder = 'Core';
        }
        if (!empty($folder) && strtolower($folder) !== 'core') {
            return ucwords(str_replace(['_', '-'], ' ', $folder));
        }
    }
    return 'Core';
}

/**
 * Recursively scans assets/ for images and infers categories and packs.
 */
function scan_assets_directory($assets_dir, $base_dir, $valid_extensions) {
    $items = [];
    if (!is_dir($assets_dir)) {
        return $items;
    }

    $categories_file = $assets_dir . '/categories.json';
    $cat_overrides = [];
    if (file_exists($categories_file)) {
        $cat_overrides = json_decode(file_get_contents($categories_file), true) ?: [];
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
                $name_no_ext = pathinfo($filename, PATHINFO_FILENAME);
                $id = strtolower(str_replace(' ', '_', $name_no_ext));

                // Check manual category override first
                if (isset($cat_overrides[$filename])) {
                    $category = $cat_overrides[$filename];
                } elseif (isset($cat_overrides[$fname_lower])) {
                    $category = $cat_overrides[$fname_lower];
                } elseif (isset($cat_overrides[$id])) {
                    $category = $cat_overrides[$id];
                } elseif (preg_match('/(lamp|light|candle|lantern|pendant)/i', $fname_lower)) {
                    $category = 'Lighting';
                } elseif (preg_match('/(shelf|bookshelf|storage|wardrobe|cabinet|dresser)/i', $fname_lower)) {
                    $category = 'Storage';
                } elseif (preg_match('/(sofa|couch|chair|table|desk|bed|bench|tv|stool|armchair)/i', $fname_lower)) {
                    $category = 'Furniture';
                } elseif (preg_match('/(plant|flower|tree|pot|rug|art|decor|clock|book)/i', $fname_lower)) {
                    $category = 'Decor';
                } elseif (preg_match('/(floor|carpet|stone|tile|tatami|terracotta|parquet|grass|ground|wood)/i', $fname_lower)) {
                    $category = 'Floors';
                } elseif (preg_match('/(wall|window|door|brick)/i', $fname_lower)) {
                    $category = 'Walls';
                } else {
                    $category = 'Decor';
                }

                $pack = infer_sprite_pack($pathname, $assets_dir);
                $pack_id = strtolower(str_replace(' ', '_', $pack));

                $name_no_ext = pathinfo($filename, PATHINFO_FILENAME);
                $friendly_name = ucwords(str_replace(['_', '-'], ' ', $name_no_ext));
                $id = strtolower(str_replace(' ', '_', $name_no_ext));

                $items[] = [
                    'id' => $id,
                    'name' => $friendly_name,
                    'category' => $category,
                    'pack' => $pack,
                    'packId' => $pack_id,
                    'filename' => $filename,
                    'src' => $rel_path,
                    'tags' => [strtolower($category), strtolower($pack), $ext]
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

    case 'packs':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $sprites = scan_assets_directory($assets_dir, $base_dir, $valid_extensions);
        $pack_counts = [];
        foreach ($sprites as $s) {
            $p = $s['pack'] ?? 'Core';
            $pack_counts[$p] = ($pack_counts[$p] ?? 0) + 1;
        }

        // Also discover any empty pack folders in assets/sprites/ and assets/packs/
        $check_dirs = [$assets_dir . '/sprites', $assets_dir . '/packs', $assets_dir];
        foreach ($check_dirs as $pdir) {
            if (is_dir($pdir)) {
                $subdirs = @scandir($pdir);
                if ($subdirs) {
                    foreach ($subdirs as $sd) {
                        if ($sd !== '.' && $sd !== '..' && is_dir($pdir . '/' . $sd)) {
                            if (!in_array(strtolower($sd), ['sprites', 'packs', 'images', 'icons'])) {
                                $pname = ucwords(str_replace(['_', '-'], ' ', $sd));
                                if (!isset($pack_counts[$pname])) {
                                    $pack_counts[$pname] = 0;
                                }
                            }
                        }
                    }
                }
            }
        }

        $packs = [];
        foreach ($pack_counts as $name => $count) {
            $packs[] = [
                'name' => $name,
                'id' => strtolower(str_replace(' ', '_', $name)),
                'count' => $count
            ];
        }

        usort($packs, function($a, $b) {
            if ($a['name'] === 'Core') return -1;
            if ($b['name'] === 'Core') return 1;
            return strcasecmp($a['name'], $b['name']);
        });

        echo json_encode($packs, JSON_UNESCAPED_SLASHES);
        break;

    case 'create-pack':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $name = trim($data['name'] ?? '');
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Pack name required']);
            exit;
        }

        $slug = preg_replace('/[^a-z0-9_-]/i', '_', strtolower($name));
        $target_dir = $assets_dir . '/sprites/' . $slug;
        if (!is_dir($target_dir)) {
            @mkdir($target_dir, 0775, true);
        }

        $display_name = ucwords(str_replace(['_', '-'], ' ', $slug));
        echo json_encode([
            'success' => true,
            'name' => $display_name,
            'id' => $slug,
            'path' => 'assets/sprites/' . $slug,
            'message' => "Created pack folder: assets/sprites/{$slug}"
        ], JSON_UNESCAPED_SLASHES);
        break;

    case 'save-sprite':
    case 'upload-sprite':
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

        $raw_filename = basename($data['filename'] ?? 'sprite.png');
        $ext = strtolower(pathinfo($raw_filename, PATHINFO_EXTENSION));
        $name_part = pathinfo($raw_filename, PATHINFO_FILENAME);
        $name_part = preg_replace('/[^a-zA-Z0-9_\-\. ]/', '_', trim($name_part));
        if (empty($name_part)) {
            $name_part = 'sprite_' . time();
        }
        if (!in_array($ext, $valid_extensions, true)) {
            $ext = 'png';
        }
        $overwrite = !empty($data['overwrite']);
        if ($overwrite && $ext !== 'png') {
            $ext = 'png';
        }
        $filename = $name_part . '.' . $ext;

        $pack = trim($data['pack'] ?? '');
        $pack_slug = preg_replace('/[^a-z0-9_-]/i', '_', strtolower($pack));
        if (!empty($pack_slug) && $pack_slug !== 'core' && $pack_slug !== 'all' && $pack_slug !== 'all_packs') {
            $target_dir = $assets_dir . '/sprites/' . $pack_slug;
            $save_rel = 'assets/sprites/' . $pack_slug . '/' . $filename;
            $display_pack = ucwords(str_replace(['_', '-'], ' ', $pack_slug));
        } else {
            $target_dir = $assets_dir . '/sprites';
            $save_rel = 'assets/sprites/' . $filename;
            $display_pack = 'Core';
        }

        if (!is_dir($target_dir)) {
            @mkdir($target_dir, 0775, true);
        }

        $target_path = $target_dir . '/' . $filename;

        // If overwriting, remove old file if name/extension changed
        if ($overwrite && !empty($raw_filename)) {
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($assets_dir, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::SELF_FIRST
            );
            foreach ($iterator as $fileinfo) {
                if ($fileinfo->isFile() && $fileinfo->getFilename() === $raw_filename) {
                    if (realpath($fileinfo->getPathname()) !== realpath($target_path)) {
                        @unlink($fileinfo->getPathname());
                    }
                }
            }
        }

        $data_url = $data['dataUrl'];

        if (strpos($data_url, ',') !== false) {
            $parts = explode(',', $data_url, 2);
            $header = $parts[0];
            $encoded = $parts[1];
            if (strpos($header, ';base64') !== false || strpos($header, 'data:') !== 0) {
                $binary = base64_decode($encoded);
            } else {
                $binary = urldecode($encoded);
            }
        } else {
            $binary = base64_decode($data_url);
        }

        if ($binary === false) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Data decoding failed']);
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
            'path' => $save_rel,
            'filename' => $filename,
            'pack' => $display_pack,
            'bytes' => $written,
            'message' => "Saved {$filename} successfully to {$save_rel}."
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

    case 'update-category':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $filename = trim($data['filename'] ?? '');
        $sprite_id = trim($data['spriteId'] ?? '');
        $category = trim($data['category'] ?? '');

        if (empty($category) || (empty($filename) && empty($sprite_id))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Category and filename/spriteId are required']);
            exit;
        }

        $categories_file = $assets_dir . '/categories.json';
        $overrides = [];
        if (file_exists($categories_file)) {
            $overrides = json_decode(file_get_contents($categories_file), true) ?: [];
        }
        if (!empty($filename)) {
            $overrides[$filename] = $category;
            $overrides[strtolower($filename)] = $category;
        }
        if (!empty($sprite_id)) {
            $overrides[$sprite_id] = $category;
            $overrides[strtolower($sprite_id)] = $category;
        }

        @file_put_contents($categories_file, json_encode($overrides, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        $sprites = scan_assets_directory($assets_dir, $base_dir, $valid_extensions);
        update_manifest_files($sprites, $assets_dir);

        echo json_encode([
            'success' => true,
            'filename' => $filename,
            'spriteId' => $sprite_id,
            'category' => $category
        ], JSON_UNESCAPED_SLASHES);
        break;

    case 'layouts':
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $layouts_dir = $base_dir . '/layouts';
        if (!is_dir($layouts_dir)) {
            @mkdir($layouts_dir, 0775, true);
        }

        $layouts = [];
        $files = @glob($layouts_dir . '/*.json') ?: [];
        foreach ($files as $file) {
            $content = @file_get_contents($file);
            if ($content) {
                $decoded = json_decode($content, true);
                if ($decoded) {
                    $layouts[] = $decoded;
                }
            }
        }

        usort($layouts, function($a, $b) {
            return ($b['updatedAt'] ?? 0) <=> ($a['updatedAt'] ?? 0);
        });

        echo json_encode($layouts, JSON_UNESCAPED_SLASHES);
        break;

    case 'save-layout':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $input = file_get_contents('php://input');
        $layout = json_decode($input, true);

        if (!$layout || !is_array($layout)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON payload']);
            exit;
        }

        $layout_id = preg_replace('/[^a-zA-Z0-9_-]/', '_', $layout['id'] ?? ('layout_' . time()));
        $layout['id'] = $layout_id;

        $layouts_dir = $base_dir . '/layouts';
        if (!is_dir($layouts_dir)) {
            @mkdir($layouts_dir, 0775, true);
        }

        $filepath = $layouts_dir . '/' . $layout_id . '.json';
        $written = @file_put_contents($filepath, json_encode($layout, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        if ($written === false) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Failed to save layout to disk. Check permissions on layouts/ folder.']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'id' => $layout_id,
            'name' => $layout['name'] ?? 'Untitled'
        ], JSON_UNESCAPED_SLASHES);
        break;

    case 'delete-layout':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            exit;
        }

        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $layout_id = preg_replace('/[^a-zA-Z0-9_-]/', '_', $data['id'] ?? '');

        $deleted = false;
        if (!empty($layout_id)) {
            $filepath = $base_dir . '/layouts/' . $layout_id . '.json';
            if (is_file($filepath)) {
                $deleted = @unlink($filepath);
            }
        }

        echo json_encode([
            'success' => true,
            'deleted' => $deleted,
            'id' => $layout_id
        ], JSON_UNESCAPED_SLASHES);
        break;

    default:
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint not found',
            'requested_uri' => $uri,
            'detected_endpoint' => $endpoint,
            'supported_endpoints' => ['/api/sprites', '/api/save-sprite', '/api/delete-sprite', '/api/layouts', '/api/save-layout', '/api/delete-layout']
        ]);
        break;
}

