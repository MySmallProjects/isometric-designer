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
import http.server
import socketserver
import urllib.parse
from update_manifest import scan_assets, main as update_manifest_files

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
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # Save transparent sprite directly to assets/sprites/
        if parsed.path == '/api/save-sprite':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length).decode('utf-8')
                payload = json.loads(body)
                
                filename = payload.get('filename', 'sprite_transparent.png')
                data_url = payload.get('dataUrl', '')
                
                # Sanitize filename
                filename = os.path.basename(filename)
                if not filename.lower().endswith('.png'):
                    filename += '.png'
                    
                target_dir = os.path.join('assets', 'sprites')
                os.makedirs(target_dir, exist_ok=True)
                target_path = os.path.join(target_dir, filename)
                
                # Extract base64
                if ',' in data_url:
                    data_url = data_url.split(',', 1)[1]
                    
                img_data = base64.b64decode(data_url)
                with open(target_path, 'wb') as f:
                    f.write(img_data)
                    
                print(f"[Server] Saved transparent sprite: {target_path} ({len(img_data)} bytes)")
                
                # Update manifest
                update_manifest_files()
                
                response_data = json.dumps({
                    'success': True,
                    'path': target_path,
                    'filename': filename,
                    'message': f'Saved {filename} to {target_path}'
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
