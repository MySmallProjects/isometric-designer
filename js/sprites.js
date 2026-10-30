/**
 * Isometric Sprite Library Management
 * Supports PNG, JPG, JPEG, GIF, SVG, and WebP
 */

const STORAGE_KEY_CUSTOM_SPRITES = 'isoroom_custom_sprites_v1';

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
    this.selectedPack = 'All';
    this.customPacks = new Set();
    this.searchQuery = '';
    this.listeners = [];

    // Initialize with manifest or defaults
    this.initSprites();
  }

  initSprites() {
    // If manifest was loaded by <script src="assets/manifest.js">, use it!
    if (window.ASSETS_MANIFEST && Array.isArray(window.ASSETS_MANIFEST) && window.ASSETS_MANIFEST.length > 0) {
      this.sprites = window.ASSETS_MANIFEST.map(s => ({
        ...s,
        pack: s.pack || 'Core',
        packId: s.packId || 'core'
      }));
    } else {
      this.sprites = DEFAULT_SPRITES.map(s => ({
        ...s,
        pack: s.pack || 'Core',
        packId: s.packId || 'core'
      }));
    }

    // Merge any custom sprites preserved in client-side storage
    this.loadCustomSpritesFromStorage();
    // Apply category overrides preserved in client-side storage
    this.applyCategoryOverrides();
  }

  // Apply manual category overrides preserved in localStorage
  applyCategoryOverrides() {
    try {
      const stored = localStorage.getItem('isoroom_category_overrides');
      if (!stored) return;
      const overrides = JSON.parse(stored);
      if (typeof overrides === 'object' && overrides !== null) {
        this.sprites.forEach(s => {
          const custom = overrides[s.filename] || (s.filename ? overrides[s.filename.toLowerCase()] : null) || overrides[s.id];
          if (custom) {
            s.category = custom;
          }
        });
      }
    } catch (e) {
      console.warn('Could not apply category overrides from localStorage:', e);
    }
  }

  // Update a sprite category and persist to localStorage and server
  async updateSpriteCategory(identifier, newCategory) {
    if (!identifier || !newCategory) return false;
    const sprite = this.findSprite(identifier);
    if (sprite) {
      sprite.category = newCategory;
      if (sprite.tags && Array.isArray(sprite.tags)) {
        sprite.tags = sprite.tags.filter(t => !['floors', 'walls', 'furniture', 'storage', 'decor', 'lighting', 'custom'].includes(t.toLowerCase()));
        sprite.tags.unshift(newCategory.toLowerCase());
      }
    }

    // Persist to local storage for offline / file:// mode
    try {
      const stored = localStorage.getItem('isoroom_category_overrides');
      const overrides = stored ? JSON.parse(stored) : {};
      const keyFilename = sprite ? sprite.filename : identifier;
      const keyId = sprite ? sprite.id : identifier;
      if (keyFilename) {
        overrides[keyFilename] = newCategory;
        overrides[keyFilename.toLowerCase()] = newCategory;
      }
      if (keyId) {
        overrides[keyId] = newCategory;
        overrides[keyId.toLowerCase()] = newCategory;
      }
      localStorage.setItem('isoroom_category_overrides', JSON.stringify(overrides));
    } catch (e) {
      console.warn('Could not save category override to localStorage:', e);
    }

    // Persist to server if running on HTTP
    if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
      const payload = JSON.stringify({
        filename: sprite ? sprite.filename : identifier,
        spriteId: sprite ? sprite.id : identifier,
        category: newCategory
      });
      try {
        const res = await fetch('/api/update-category', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload
        });
        if (!res.ok) {
          await fetch('api.php?action=update-category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          }).catch(() => {});
        }
      } catch (err) {
        // Fallback retry via api.php
        try {
          await fetch('api.php?action=update-category', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          });
        } catch (e2) {
          console.warn('Server update-category call failed (changes saved locally):', err);
        }
      }
    }

    if (typeof this.notify === 'function') {
      this.notify();
    }
    return true;
  }

  // Client storage helpers for offline/file:// mode
  loadCustomSpritesFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_SPRITES);
      if (!stored) return;
      const list = JSON.parse(stored);
      if (Array.isArray(list)) {
        const existingFilenames = new Set(this.sprites.map(s => (s.filename || '').toLowerCase()));
        for (const item of list) {
          if (item && item.filename && typeof item.filename === 'string' && !existingFilenames.has(item.filename.toLowerCase())) {
            this.sprites.unshift(item);
            existingFilenames.add(item.filename.toLowerCase());
            if (item.pack && item.pack !== 'Core' && item.pack !== 'Custom') {
              this.customPacks.add(item.pack);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not load custom sprites from localStorage:', e);
    }
  }

  saveCustomSpriteToStorage(sprite) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_SPRITES);
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex(s => s.filename.toLowerCase() === sprite.filename.toLowerCase());
      if (idx !== -1) {
        list[idx] = sprite;
      } else {
        list.unshift(sprite);
      }
      localStorage.setItem(STORAGE_KEY_CUSTOM_SPRITES, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save custom sprite to localStorage:', e);
    }
  }

  removeCustomSpriteFromStorage(filename) {
    if (!filename) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_SPRITES);
      if (!stored) return;
      let list = JSON.parse(stored);
      if (Array.isArray(list)) {
        list = list.filter(s => s.filename.toLowerCase() !== filename.toLowerCase());
        localStorage.setItem(STORAGE_KEY_CUSTOM_SPRITES, JSON.stringify(list));
      }
    } catch (e) {}
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  notifyChange() {
    this.notify();
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
        this.sprites.push({
          ...item,
          pack: item.pack || 'Core',
          packId: item.packId || 'core'
        });
      } else {
        // Update source and metadata if needed
        const existing = existingMap.get(key);
        existing.src = item.src;
        if (item.category) {
          existing.category = item.category;
        }
        if (item.pack) {
          existing.pack = item.pack;
          existing.packId = item.packId || item.pack.toLowerCase().replace(/[\s-]/g, '_');
        }
      }
    }
  }

  getPacks() {
    const packMap = new Map();
    for (const s of this.sprites) {
      const p = s.pack || 'Core';
      packMap.set(p, (packMap.get(p) || 0) + 1);
    }
    for (const cp of this.customPacks) {
      if (!packMap.has(cp)) {
        packMap.set(cp, 0);
      }
    }

    const list = [];
    for (const [name, count] of packMap.entries()) {
      list.push({
        name,
        id: name.toLowerCase().replace(/[\s-]/g, '_'),
        count
      });
    }

    list.sort((a, b) => {
      if (a.name === 'Core') return -1;
      if (b.name === 'Core') return 1;
      return a.name.localeCompare(b.name);
    });

    return [{ name: 'All Packs', id: 'all', count: this.sprites.length }, ...list];
  }

  async createPack(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    const formatted = trimmed.replace(/[_\s-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    this.customPacks.add(formatted);

    try {
      await fetch('/api/create-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formatted })
      });
    } catch (e) {}

    this.notify();
    return formatted;
  }

  preload(sprite) {
    return this.loadImage(sprite);
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
        if (sprite.filename) {
          this.loadedImages.set(sprite.filename.toLowerCase(), img);
        }
        if (sprite.src) {
          this.loadedImages.set(sprite.src, img);
        }
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
    if (!spriteId) return null;
    if (this.loadedImages.has(spriteId)) {
      return this.loadedImages.get(spriteId);
    }
    // Check if spriteId matches a sprite in the library by filename, src, or slug
    const sprite = this.findSprite(spriteId);
    if (sprite && this.loadedImages.has(sprite.id)) {
      const img = this.loadedImages.get(sprite.id);
      this.loadedImages.set(spriteId, img);
      return img;
    }
    return null;
  }

  getImageByFilename(filename) {
    if (!filename) return null;
    const lower = filename.toLowerCase();
    if (this.loadedImages.has(lower)) {
      return this.loadedImages.get(lower);
    }
    for (const sprite of this.sprites) {
      if (sprite.filename && sprite.filename.toLowerCase() === lower) {
        if (this.loadedImages.has(sprite.id)) {
          const img = this.loadedImages.get(sprite.id);
          this.loadedImages.set(lower, img);
          return img;
        }
      }
    }
    return null;
  }

  getImageBySrc(src) {
    if (!src) return null;
    if (this.loadedImages.has(src)) {
      return this.loadedImages.get(src);
    }
    if (src.startsWith('data:')) {
      return null;
    }
    for (const sprite of this.sprites) {
      if (sprite.src === src) {
        if (this.loadedImages.has(sprite.id)) {
          const img = this.loadedImages.get(sprite.id);
          this.loadedImages.set(src, img);
          return img;
        }
      }
    }
    return null;
  }

  findSprite(identifier) {
    if (!identifier) return null;
    const lower = String(identifier).toLowerCase();
    return this.sprites.find(s => 
      s.id === identifier || 
      (s.filename && s.filename.toLowerCase() === lower) ||
      (s.src && s.src.toLowerCase() === lower) ||
      s.id.toLowerCase() === lower
    ) || null;
  }

  getFilteredSprites() {
    return this.sprites.filter(s => {
      const itemPack = s.pack || 'Core';
      const matchesPack = this.selectedPack === 'All' || this.selectedPack === 'All Packs' || itemPack.toLowerCase() === this.selectedPack.toLowerCase();
      const matchesCategory = this.selectedCategory === 'All' || s.category === this.selectedCategory;
      const q = this.searchQuery.trim().toLowerCase();
      if (!q) return matchesPack && matchesCategory;
      const matchesSearch = s.name.toLowerCase().includes(q) ||
        s.filename.toLowerCase().includes(q) ||
        itemPack.toLowerCase().includes(q) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(q)));
      return matchesPack && matchesCategory && matchesSearch;
    });
  }

  // Load single or multiple files from user's file picker or drop
  async addCustomSprite(file, customPack = null) {
    const validExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!validExts.includes(ext) && !file.type.startsWith('image/')) {
      throw new Error('Unsupported image format');
    }

    const dataUrl = await this.readFileAsDataURL(file);
    const img = await this.loadImageElement(dataUrl);
    const cleanBase = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const id = cleanBase || ('sprite_' + Date.now());

    // Infer category
    const fnameLower = file.name.toLowerCase();
    let category = 'Custom';
    if (anyWord(fnameLower, ['floor', 'tile', 'carpet', 'wood', 'stone', 'grass', 'tatami', 'marble', 'checkerboard', 'parquet'])) {
      category = 'Floors';
    } else if (anyWord(fnameLower, ['wall', 'window', 'door', 'brick'])) {
      category = 'Walls';
    } else if (anyWord(fnameLower, ['sofa', 'couch', 'chair', 'table', 'desk', 'bed', 'tv', 'bench', 'stool', 'armchair'])) {
      category = 'Furniture';
    } else if (anyWord(fnameLower, ['shelf', 'bookshelf', 'storage', 'cabinet', 'dresser', 'wardrobe'])) {
      category = 'Storage';
    } else if (anyWord(fnameLower, ['lamp', 'light', 'lantern', 'candle', 'pendant'])) {
      category = 'Lighting';
    } else if (anyWord(fnameLower, ['plant', 'pot', 'decor', 'art', 'clock', 'book', 'rug'])) {
      category = 'Decor';
    }

    const friendlyName = file.name.replace(/\.[^/.]+$/, '').replace(/[_\s-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Infer pack
    let pack = customPack;
    if (!pack) {
      if (file.webkitRelativePath && file.webkitRelativePath.includes('/')) {
        const folder = file.webkitRelativePath.split('/')[0];
        pack = folder.replace(/[_\s-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      } else if (this.selectedPack && this.selectedPack !== 'All' && this.selectedPack !== 'All Packs') {
        pack = this.selectedPack;
      } else {
        pack = 'Custom';
      }
    }
    const packId = pack.toLowerCase().replace(/[\s-]/g, '_');
    if (pack !== 'Core' && pack !== 'Custom') {
      this.customPacks.add(pack);
    }

    // Persist file directly to disk on server
    let diskSrc = null;
    let savedFilename = file.name;
    try {
      const res = await fetch('/api/save-sprite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          dataUrl: dataUrl,
          pack: pack
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.path) {
          diskSrc = data.path;
          if (data.filename) savedFilename = data.filename;
          if (data.pack) pack = data.pack;
        }
      }
    } catch (netErr) {
      console.warn('Server not available to write file to disk (offline / file:// mode):', netErr);
    }

    const finalSrc = diskSrc || dataUrl;

    const newSprite = {
      id: id,
      name: friendlyName,
      category: category,
      pack: pack,
      packId: pack.toLowerCase().replace(/[\s-]/g, '_'),
      filename: savedFilename,
      src: finalSrc,
      width: img.naturalWidth || 64,
      height: img.naturalHeight || 64,
      savedToDisk: !!diskSrc,
      tags: ['custom', pack.toLowerCase(), ext.replace('.', '')]
    };

    // If offline/file:// mode (not saved to disk), cache in localStorage
    if (!diskSrc) {
      this.saveCustomSpriteToStorage(newSprite);
    }

    // Check if already in library
    const existingIdx = this.sprites.findIndex(s => s.filename.toLowerCase() === savedFilename.toLowerCase());
    if (existingIdx !== -1) {
      this.sprites[existingIdx] = newSprite;
    } else {
      this.sprites.unshift(newSprite);
    }

    this.loadedImages.set(id, img);
    if (newSprite.filename) {
      this.loadedImages.set(newSprite.filename.toLowerCase(), img);
    }
    if (newSprite.src) {
      this.loadedImages.set(newSprite.src, img);
    }
    this.notify();
    return newSprite;
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  loadImageElement(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        // Fallback image object if image cannot be decoded immediately
        resolve(img);
      };
      img.src = src;
    });
  }

  // Load an entire folder via webkitdirectory
  async loadFolderFiles(fileList) {
    const files = Array.from(fileList).filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext) || f.type.startsWith('image/');
    });

    // Detect folder name if webkitRelativePath is available
    let packName = null;
    if (files.length > 0 && files[0].webkitRelativePath && files[0].webkitRelativePath.includes('/')) {
      const folder = files[0].webkitRelativePath.split('/')[0];
      packName = folder.replace(/[_\s-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      await this.createPack(packName);
      this.selectedPack = packName;
    }

    for (const file of files) {
      try {
        await this.addCustomSprite(file, packName);
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
    this.removeCustomSpriteFromStorage(sprite.filename);

    if (sprite.filename) {
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
