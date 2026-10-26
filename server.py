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

        # Ensure no aggressive caching for development
        if parsed.path.endswith('.js') or parsed.path.endswith('.css') or parsed.path.endswith('.html'):
            self.extensions_map['.js'] = 'application/javascript'
            self.extensions_map['.svg'] = 'image/svg+xml'
            
        super().do_GET()

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
