/**
 * Isometric Sprite Library Management
 * Supports PNG, JPG, JPEG, GIF, SVG, and WebP
 */

const DEFAULT_SPRITES = [
  {
    id: 'floor_wood',
    name: 'Wood Floor Tile',
    category: 'Floors',
    filename: 'floor_wood.svg',
    src: 'assets/sprites/floor_wood.svg',
    width: 128,
    height: 64,
    tags: ['floor', 'wood', 'tile']
  },
  {
    id: 'floor_carpet',
    name: 'Carpet Floor Tile',
    category: 'Floors',
    filename: 'floor_carpet.svg',
    src: 'assets/sprites/floor_carpet.svg',
    width: 128,
    height: 64,
    tags: ['floor', 'carpet', 'blue']
  },
  {
    id: 'floor_stone',
    name: 'Stone Floor Tile',
    category: 'Floors',
    filename: 'floor_stone.svg',
    src: 'assets/sprites/floor_stone.svg',
    width: 128,
    height: 64,
    tags: ['floor', 'stone', 'gray']
  },
  {
    id: 'wall_left',
    name: 'Left Wall',
    category: 'Walls',
    filename: 'wall_left.svg',
    src: 'assets/sprites/wall_left.svg',
    width: 128,
    height: 160,
    tags: ['wall', 'brick', 'left']
  },
  {
    id: 'wall_right',
    name: 'Right Wall with Window',
    category: 'Walls',
    filename: 'wall_right.svg',
    src: 'assets/sprites/wall_right.svg',
    width: 128,
    height: 160,
    tags: ['wall', 'window', 'right']
  },
  {
    id: 'sofa_isometric',
    name: 'Modern Blue Sofa',
    category: 'Furniture',
    filename: 'sofa_isometric.svg',
    src: 'assets/sprites/sofa_isometric.svg',
    width: 130,
    height: 110,
    tags: ['sofa', 'couch', 'living']
  },
  {
    id: 'armchair',
    name: 'Orange Armchair',
    category: 'Furniture',
    filename: 'armchair.svg',
    src: 'assets/sprites/armchair.svg',
    width: 90,
    height: 90,
    tags: ['chair', 'armchair', 'orange']
  },
  {
    id: 'table_isometric',
    name: 'Wood Table',
    category: 'Furniture',
    filename: 'table_isometric.svg',
    src: 'assets/sprites/table_isometric.svg',
    width: 120,
    height: 90,
    tags: ['table', 'dining', 'coffee']
  },
  {
    id: 'work_desk',
    name: 'Workstation Desk',
    category: 'Furniture',
    filename: 'work_desk.svg',
    src: 'assets/sprites/work_desk.svg',
    width: 130,
    height: 115,
    tags: ['desk', 'office', 'laptop']
  },
  {
    id: 'bed_queen',
    name: 'Queen Bed',
    category: 'Furniture',
    filename: 'bed_queen.svg',
    src: 'assets/sprites/bed_queen.svg',
    width: 140,
    height: 120,
    tags: ['bed', 'bedroom', 'duvet']
  },
  {
    id: 'bookshelf',
    name: 'Tall Bookshelf',
    category: 'Storage',
    filename: 'bookshelf.svg',
    src: 'assets/sprites/bookshelf.svg',
    width: 90,
    height: 150,
    tags: ['shelf', 'books', 'storage']
  },
  {
    id: 'retro_tv',
    name: 'Retro TV Console',
    category: 'Furniture',
    filename: 'retro_tv.svg',
    src: 'assets/sprites/retro_tv.svg',
    width: 110,
    height: 95,
    tags: ['tv', 'television', 'entertainment']
  },
  {
    id: 'indoor_plant',
    name: 'Monstera Plant',
    category: 'Decor',
    filename: 'indoor_plant.svg',
    src: 'assets/sprites/indoor_plant.svg',
    width: 80,
    height: 110,
    tags: ['plant', 'nature', 'pot']
  },
  {
    id: 'floor_lamp',
    name: 'Floor Standing Lamp',
    category: 'Lighting',
    filename: 'floor_lamp.svg',
    src: 'assets/sprites/floor_lamp.svg',
    width: 60,
    height: 130,
    tags: ['lamp', 'light', 'stand']
  }
];

class SpriteLibrary {
  constructor() {
    this.sprites = [];
    this.loadedImages = new Map(); // id -> HTMLImageElement
    this.categories = ['All', 'Floors', 'Walls', 'Furniture', 'Storage', 'Decor', 'Lighting', 'Custom'];
    this.selectedCategory = 'All';
    this.searchQuery = '';
    this.listeners = [];

    // Initialize with manifest or defaults
    this.initSprites();
  }

  initSprites() {
    // If manifest was loaded by <script src="assets/manifest.js">, use it!
    if (window.ASSETS_MANIFEST && Array.isArray(window.ASSETS_MANIFEST) && window.ASSETS_MANIFEST.length > 0) {
      this.sprites = [...window.ASSETS_MANIFEST];
    } else {
      this.sprites = [...DEFAULT_SPRITES];
    }
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  // Auto-scan server or fetch manifest dynamically
  async autoDiscoverAssets() {
    try {
      // 1. Try server API endpoint (/api/sprites)
      const res = await fetch('/api/sprites', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.mergeSprites(data);
          await this.preloadAll();
          this.notify();
          return true;
        }
      }
    } catch (e) {
      // Not running custom server or offline; try next fallback
    }

    try {
      // 2. Try fetching assets/manifest.json
      const res = await fetch('assets/manifest.json', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.mergeSprites(data);
          await this.preloadAll();
          this.notify();
          return true;
        }
      }
    } catch (e) {
      // fetch may fail on file:/// without server
    }

    return false;
  }

  mergeSprites(newSprites) {
    const existingMap = new Map(this.sprites.map(s => [s.filename.toLowerCase(), s]));
    for (const item of newSprites) {
      const key = item.filename.toLowerCase();
      if (!existingMap.has(key)) {
        this.sprites.push(item);
      } else {
        // Update source and metadata if needed
        const existing = existingMap.get(key);
        existing.src = item.src;
        if (item.category && item.category !== 'Decor') {
          existing.category = item.category;
        }
      }
    }
  }

  async preloadAll() {
    const promises = this.sprites.map(sprite => this.loadImage(sprite));
    await Promise.all(promises);
  }

  loadImage(sprite) {
    return new Promise((resolve) => {
      if (this.loadedImages.has(sprite.id)) {
        resolve(this.loadedImages.get(sprite.id));
        return;
      }
      const img = new Image();
      img.onload = () => {
        sprite.width = img.naturalWidth || 64;
        sprite.height = img.naturalHeight || 64;
        this.loadedImages.set(sprite.id, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite image: ${sprite.src}`);
        resolve(null);
      };
      img.src = sprite.src;
    });
  }

  getImage(spriteId) {
    return this.loadedImages.get(spriteId);
  }

  getFilteredSprites() {
    return this.sprites.filter(s => {
      const matchesCategory = this.selectedCategory === 'All' || s.category === this.selectedCategory;
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;
      const matchesSearch = s.name.toLowerCase().includes(q) ||
        s.filename.toLowerCase().includes(q) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }

  // Load single or multiple files from user's file picker or drop
  addCustomSprite(file) {
    return new Promise((resolve, reject) => {
      const validExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExts.includes(ext) && !file.type.startsWith('image/')) {
        return reject(new Error('Unsupported image format'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const img = new Image();
        img.onload = () => {
          const id = 'custom_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
          
          // Infer category
          const fnameLower = file.name.toLowerCase();
          let category = 'Custom';
          if (anyWord(fnameLower, ['floor', 'tile', 'carpet', 'wood', 'stone'])) category = 'Floors';
          else if (anyWord(fnameLower, ['wall', 'window', 'door', 'brick'])) category = 'Walls';
          else if (anyWord(fnameLower, ['sofa', 'couch', 'chair', 'table', 'desk', 'bed', 'tv'])) category = 'Furniture';
          else if (anyWord(fnameLower, ['shelf', 'bookshelf', 'storage', 'cabinet'])) category = 'Storage';
          else if (anyWord(fnameLower, ['lamp', 'light'])) category = 'Lighting';
          else if (anyWord(fnameLower, ['plant', 'pot', 'decor', 'art'])) category = 'Decor';

          const friendlyName = file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

          // Check if already in library
          const existingIdx = this.sprites.findIndex(s => s.filename.toLowerCase() === file.name.toLowerCase());
          
          const newSprite = {
            id: id,
            name: friendlyName,
            category: category,
            filename: file.name,
            src: dataUrl,
            width: img.naturalWidth || 64,
            height: img.naturalHeight || 64,
            tags: ['custom', ext.replace('.', '')]
          };

          if (existingIdx !== -1) {
            this.sprites[existingIdx] = newSprite;
          } else {
            this.sprites.unshift(newSprite);
          }

          this.loadedImages.set(id, img);
          this.notify();
          resolve(newSprite);
        };
        img.onerror = reject;
        img.src = dataUrl;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Load an entire folder via webkitdirectory
  async loadFolderFiles(fileList) {
    const files = Array.from(fileList).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext) || f.type.startsWith('image/');
    });

    for (const file of files) {
      try {
        await this.addCustomSprite(file);
      } catch (e) {
        console.warn(`Error loading folder file: ${file.name}`, e);
      }
    }
    this.notify();
    return files.length;
  }

  // Delete a sprite from the library (and from disk if server is active)
  async deleteSprite(spriteId) {
    const idx = this.sprites.findIndex(s => s.id === spriteId);
    if (idx === -1) return false;
    const sprite = this.sprites[idx];

    this.sprites.splice(idx, 1);
    this.loadedImages.delete(spriteId);

    if (sprite.filename && !sprite.src.startsWith('data:')) {
      try {
        await fetch('/api/delete-sprite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: sprite.filename })
        });
      } catch (e) {
        // Offline / file:// mode
      }
    }

    this.notify();
    return true;
  }
}

function anyWord(str, words) {
  return words.some(w => str.includes(w));
}
