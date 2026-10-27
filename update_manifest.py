#!/usr/bin/env python3
"""
Scans the assets directory and generates assets/manifest.js and assets/manifest.json
so both file:/// and http:// can instantly load all images.
"""
import os
import json

VALID_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}

def get_pack_name(rel_path):
    rel_from_assets = os.path.relpath(rel_path, 'assets')
    parts = rel_from_assets.replace('\\', '/').split('/')
    if len(parts) > 1:
        first = parts[0].lower()
        if first in ['sprites', 'packs', 'images'] and len(parts) > 2:
            folder = parts[1]
        elif first not in ['sprites', 'packs', 'images']:
            folder = parts[0]
        else:
            folder = 'Core'
        if folder.lower() != 'core':
            return folder.replace('_', ' ').replace('-', ' ').title()
    return 'Core'

def scan_assets():
    found = []
    assets_dir = 'assets'
    if not os.path.isdir(assets_dir):
        return found

    for root, dirs, files in os.walk(assets_dir):
        for file in sorted(files):
            ext = os.path.splitext(file)[1].lower()
            if ext in VALID_EXTS:
                rel_path = os.path.relpath(os.path.join(root, file), '.').replace('\\', '/')
                fname_lower = file.lower()
                
                # Category inference with priority
                if any(w in fname_lower for w in ['lamp', 'light', 'candle', 'lantern', 'pendant']):
                    category = 'Lighting'
                elif any(w in fname_lower for w in ['shelf', 'bookshelf', 'storage', 'wardrobe', 'cabinet', 'dresser']):
                    category = 'Storage'
                elif any(w in fname_lower for w in ['sofa', 'couch', 'chair', 'table', 'desk', 'bed', 'bench', 'tv', 'stool', 'armchair']):
                    category = 'Furniture'
                elif any(w in fname_lower for w in ['plant', 'flower', 'tree', 'pot', 'rug', 'art', 'decor', 'clock', 'book']):
                    category = 'Decor'
                elif any(w in fname_lower for w in ['floor', 'carpet', 'stone', 'tile', 'tatami', 'terracotta', 'parquet', 'grass', 'ground', 'wood']):
                    category = 'Floors'
                elif any(w in fname_lower for w in ['wall', 'window', 'door', 'brick']):
                    category = 'Walls'
                else:
                    category = 'Decor'

                pack = get_pack_name(rel_path)
                pack_id = pack.lower().replace(' ', '_')
                friendly_name = os.path.splitext(file)[0].replace('_', ' ').replace('-', ' ').title()

                found.append({
                    'id': os.path.splitext(file)[0].lower().replace(' ', '_'),
                    'name': friendly_name,
                    'category': category,
                    'pack': pack,
                    'packId': pack_id,
                    'filename': file,
                    'src': rel_path,
                    'tags': [category.lower(), pack.lower(), ext.replace('.', '')]
                })
    return found

def main():
    items = scan_assets()
    js_content = f"// Auto-generated assets manifest\nwindow.ASSETS_MANIFEST = {json.dumps(items, indent=2)};\n"
    with open('assets/manifest.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    with open('assets/manifest.json', 'w', encoding='utf-8') as f:
        json.dump(items, f, indent=2)

    print(f"Manifest generated successfully with {len(items)} images:")
    for item in items:
        print(f" - {item['filename']} ({item['category']}) -> {item['src']}")

if __name__ == '__main__':
    main()

