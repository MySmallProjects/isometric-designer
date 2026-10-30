#!/usr/bin/env python3
"""
Custom development HTTP server for IsoRoom Studio.
- Serves static files.
- Automatically scans assets/ and assets/sprites/ for images on /api/sprites.
- Supports /api/save-sprite to save transparent PNGs directly to disk.
- Supports .png, .jpg, .jpeg, .gif, .svg, .webp.
"""
import os
import json
import base64
import re
import time
import http.server
import socketserver
import urllib.parse
from update_manifest import scan_assets, load_category_overrides, save_category_overrides, main as update_manifest_files

PORT = 8000

class IsoRoomHTTPHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # API endpoint to dynamically discover all images in assets
        if parsed.path == '/api/sprites':
            try:
                update_manifest_files()
            except Exception as e:
                print(f"Error updating manifest: {e}")

            sprites = scan_assets()
            data = json.dumps(sprites).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(data)
            return

        # API endpoint to list sprite packs
        if parsed.path == '/api/packs':
            sprites = scan_assets()
            pack_counts = {}
            for s in sprites:
                p = s.get('pack') or 'Core'
                pack_counts[p] = pack_counts.get(p, 0) + 1

            # Also discover any empty pack folders in assets/sprites/
            sprites_dir = os.path.join('assets', 'sprites')
            if os.path.isdir(sprites_dir):
                for sd in os.listdir(sprites_dir):
                    subpath = os.path.join(sprites_dir, sd)
                    if os.path.isdir(subpath) and sd.lower() not in ('sprites', 'packs', 'images', 'icons'):
                        pname = sd.replace('_', ' ').replace('-', ' ').title()
                        if pname not in pack_counts:
                            pack_counts[pname] = 0

            packs = []
            for name, count in pack_counts.items():
                packs.append({
                    'name': name,
                    'id': name.lower().replace(' ', '_'),
                    'count': count
                })
            packs.sort(key=lambda x: (0 if x['name'] == 'Core' else 1, x['name'].lower()))
            data = json.dumps(packs).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(data)
            return

        # API endpoint to list saved room layouts
        if parsed.path == '/api/layouts':
            layouts_dir = 'layouts'
            os.makedirs(layouts_dir, exist_ok=True)
            layouts = []
            for fname in os.listdir(layouts_dir):
                if fname.endswith('.json'):
                    fpath = os.path.join(layouts_dir, fname)
                    try:
                        with open(fpath, 'r', encoding='utf-8') as f:
                            layouts.append(json.load(f))
                    except Exception as e:
                        print(f"Error reading layout {fname}: {e}")
            
            layouts.sort(key=lambda l: l.get('updatedAt', 0), reverse=True)
            data = json.dumps(layouts).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.end_headers()
            self.wfile.write(data)
            return

        # Ensure no aggressive caching for development
        if parsed.path.endswith('.js') or parsed.path.endswith('.css') or parsed.path.endswith('.html'):
            self.extensions_map['.js'] = 'application/javascript'
            self.extensions_map['.svg'] = 'image/svg+xml'
            
        super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        # Create sprite pack folder in assets/sprites/
        if parsed.path == '/api/create-pack':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(body)
                name = payload.get('name', '').strip()
                if not name:
                    raise ValueError('Pack name required')
                slug = re.sub(r'[^a-zA-Z0-9_-]', '_', name.lower())
                target_dir = os.path.join('assets', 'sprites', slug)
                os.makedirs(target_dir, exist_ok=True)
                display_name = slug.replace('_', ' ').replace('-', ' ').title()
                res = json.dumps({
                    'success': True,
                    'name': display_name,
                    'id': slug,
                    'path': f"assets/sprites/{slug}"
                }).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(res)))
                self.end_headers()
                self.wfile.write(res)
                return
            except Exception as e:
                err = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err)))
                self.end_headers()
                self.wfile.write(err)
                return
        
        # Save transparent or uploaded/dropped sprite directly to assets/sprites/
        if parsed.path in ('/api/save-sprite', '/api/upload-sprite'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(body)
                
                raw_filename = payload.get('filename', 'sprite.png')
                data_url = payload.get('dataUrl', '')
                pack = payload.get('pack', '').strip()
                overwrite = bool(payload.get('overwrite', False))
                
                # Sanitize filename while keeping valid extension
                raw_base = os.path.basename(raw_filename)
                name_part, ext_part = os.path.splitext(raw_base)
                ext = ext_part.lower()
                VALID_EXTS_LIST = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
                if ext not in VALID_EXTS_LIST:
                    ext = '.png'
                name_part = re.sub(r'[^a-zA-Z0-9_\-\. ]', '_', name_part).strip()
                if not name_part:
                    name_part = f"sprite_{int(time.time())}"
                
                # If overwriting with transparent background image, format is PNG
                if overwrite and ext != '.png':
                    ext = '.png'
                safe_filename = f"{name_part}{ext}"
                
                # Determine target directory and pack slug
                pack_slug = re.sub(r'[^a-zA-Z0-9_-]', '_', pack.lower().strip()) if pack else ''
                if pack_slug and pack_slug not in ('core', 'all', 'all_packs'):
                    target_dir = os.path.join('assets', 'sprites', pack_slug)
                    save_rel = f"assets/sprites/{pack_slug}/{safe_filename}".replace('\\', '/')
                    display_pack = pack_slug.replace('_', ' ').replace('-', ' ').title()
                else:
                    target_dir = os.path.join('assets', 'sprites')
                    save_rel = f"assets/sprites/{safe_filename}".replace('\\', '/')
                    display_pack = 'Core'
                    
                os.makedirs(target_dir, exist_ok=True)
                target_path = os.path.join(target_dir, safe_filename)
                
                # If overwriting, remove any previous non-PNG file with the old name
                if overwrite and raw_base:
                    for root, dirs, files in os.walk('assets'):
                        if raw_base in files:
                            old_cand = os.path.join(root, raw_base)
                            if os.path.abspath(old_cand) != os.path.abspath(target_path):
                                try:
                                    os.remove(old_cand)
                                except Exception:
                                    pass
                
                # Extract and decode base64 / url-encoded image data
                if ',' in data_url:
                    header, data_str = data_url.split(',', 1)
                    if ';base64' in header or not header.startswith('data:'):
                        img_data = base64.b64decode(data_str)
                    else:
                        img_data = urllib.parse.unquote_to_bytes(data_str)
                else:
                    img_data = base64.b64decode(data_url)
                    
                with open(target_path, 'wb') as f:
                    f.write(img_data)
                    
                print(f"[Server] Saved sprite to disk: {target_path} ({len(img_data)} bytes)")
                
                # Re-scan assets and update manifest files
                update_manifest_files()
                
                response_data = json.dumps({
                    'success': True,
                    'path': save_rel,
                    'filename': safe_filename,
                    'oldFilename': raw_base,
                    'pack': display_pack,
                    'bytes': len(img_data),
                    'message': f'Saved {safe_filename} to {save_rel}'
                }).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_data)))
                self.end_headers()
                self.wfile.write(response_data)
                return
            except Exception as e:
                print(f"[Server] Error saving sprite: {e}")
                err_data = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_data)))
                self.end_headers()
                self.wfile.write(err_data)
                return

        # Delete sprite from assets/ or assets/sprites/
        if parsed.path == '/api/delete-sprite':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(body)
                filename = payload.get('filename', '')
                deleted = False
                
                if filename:
                    filename = os.path.basename(filename)
                    for root, dirs, files in os.walk('assets'):
                        if filename in files:
                            target_file = os.path.join(root, filename)
                            os.remove(target_file)
                            print(f"[Server] Deleted sprite from disk: {target_file}")
                            deleted = True
                            break
                    update_manifest_files()

                response_data = json.dumps({
                    'success': True,
                    'deleted': deleted,
                    'filename': filename
                }).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(response_data)))
                self.end_headers()
                self.wfile.write(response_data)
                return
            except Exception as e:
                print(f"[Server] Error deleting sprite: {e}")
                err_data = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_data)))
                self.end_headers()
                self.wfile.write(err_data)
                return

        # Update sprite category override in assets/categories.json and update manifests
        if parsed.path == '/api/update-category':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(body)
                
                filename = payload.get('filename', '').strip()
                sprite_id = payload.get('spriteId', '').strip()
                category = payload.get('category', '').strip()
                
                if not category or (not filename and not sprite_id):
                    raise ValueError('Category and filename/spriteId are required')
                
                overrides = load_category_overrides()
                if filename:
                    overrides[filename] = category
                    overrides[filename.lower()] = category
                if sprite_id:
                    overrides[sprite_id] = category
                    overrides[sprite_id.lower()] = category
                    
                save_category_overrides(overrides)
                update_manifest_files()
                
                print(f"[Server] Updated category for {filename or sprite_id} -> {category}")
                
                res = json.dumps({
                    'success': True,
                    'filename': filename,
                    'spriteId': sprite_id,
                    'category': category
                }).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(res)))
                self.end_headers()
                self.wfile.write(res)
                return
            except Exception as e:
                print(f"[Server] Error updating category: {e}")
                err_data = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_data)))
                self.end_headers()
                self.wfile.write(err_data)
                return

        # Save room layout to layouts/<id>.json
        if parsed.path == '/api/save-layout':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                layout = json.loads(body)
                
                layout_id = str(layout.get('id', ''))
                # Sanitize layout_id
                safe_id = ''.join(c for c in layout_id if c.isalnum() or c in ('_', '-'))
                if not safe_id:
                    import time
                    safe_id = f"layout_{int(time.time())}"
                    layout['id'] = safe_id
                    
                layouts_dir = 'layouts'
                os.makedirs(layouts_dir, exist_ok=True)
                layout_path = os.path.join(layouts_dir, f"{safe_id}.json")
                
                with open(layout_path, 'w', encoding='utf-8') as f:
                    json.dump(layout, f, indent=2)
                    
                print(f"[Server] Saved layout: {layout.get('name', 'Untitled')} ({layout_path})")
                
                res_data = json.dumps({
                    'success': True,
                    'id': safe_id,
                    'name': layout.get('name')
                }).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(res_data)))
                self.end_headers()
                self.wfile.write(res_data)
                return
            except Exception as e:
                print(f"[Server] Error saving layout: {e}")
                err_data = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_data)))
                self.end_headers()
                self.wfile.write(err_data)
                return

        # Delete room layout from disk
        if parsed.path == '/api/delete-layout':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(body)
                layout_id = str(payload.get('id', ''))
                safe_id = ''.join(c for c in layout_id if c.isalnum() or c in ('_', '-'))
                
                deleted = False
                if safe_id:
                    layout_path = os.path.join('layouts', f"{safe_id}.json")
                    if os.path.isfile(layout_path):
                        os.remove(layout_path)
                        print(f"[Server] Deleted layout: {layout_path}")
                        deleted = True
                        
                res_data = json.dumps({
                    'success': True,
                    'deleted': deleted,
                    'id': safe_id
                }).encode('utf-8')
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(res_data)))
                self.end_headers()
                self.wfile.write(res_data)
                return
            except Exception as e:
                print(f"[Server] Error deleting layout: {e}")
                err_data = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(err_data)))
                self.end_headers()
                self.wfile.write(err_data)
                return

        super().do_POST()

def run_server():
    update_manifest_files()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), IsoRoomHTTPHandler) as httpd:
        print(f"==================================================")
        print(f" IsoRoom Studio Server Running at http://localhost:{PORT}")
        print(f" Serving images from assets/ and assets/sprites/")
        print(f" Background removal & saving enabled on /api/save-sprite")
        print(f" Press Ctrl+C to stop.")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == '__main__':
    run_server()
