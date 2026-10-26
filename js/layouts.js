/**
 * LayoutManager - Manages room layouts: save, name, rename, delete, duplicate, import & export.
 * Persists instantaneously to localStorage and synchronizes with server endpoints (/api/layouts,
 * /api/save-layout, /api/delete-layout) when running behind Python or PHP + Nginx.
 */

const STORAGE_KEY_LAYOUTS = 'isoroom_saved_layouts_v1';
const STORAGE_KEY_ACTIVE = 'isoroom_active_layout_id_v1';

class LayoutManager {
  constructor() {
    this.layouts = [];
    this.activeLayoutId = null;
    this.listeners = [];
  }

  // Register listener for layout changes (save, rename, delete, active switch)
  onChange(fn) {
    if (typeof fn === 'function') {
      this.listeners.push(fn);
    }
  }

  notify(event, data) {
    for (const fn of this.listeners) {
      try {
        fn(event, data);
      } catch (err) {
        console.error('LayoutManager listener error:', err);
      }
    }
  }

  // Initialize: load from localStorage and attempt server sync
  async init(defaultCanvasData = null) {
    let loaded = false;

    // 1. Load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LAYOUTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.layouts = parsed;
          loaded = true;
        }
      }
      this.activeLayoutId = localStorage.getItem(STORAGE_KEY_ACTIVE);
    } catch (e) {
      console.warn('Could not read layouts from localStorage:', e);
    }

    // 2. Query server for saved layouts if running on HTTP/HTTPS
    if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
      try {
        const res = await fetch('/api/layouts', { cache: 'no-cache' });
        if (res.ok) {
          const serverLayouts = await res.json();
          if (Array.isArray(serverLayouts) && serverLayouts.length > 0) {
            // Merge server layouts with local layouts (server takes precedence for matching IDs)
            const map = new Map();
            this.layouts.forEach(l => map.set(l.id, l));
            serverLayouts.forEach(l => map.set(l.id, l));
            this.layouts = Array.from(map.values());
            loaded = true;
            this.saveToLocalStorage();
          }
        }
      } catch (e) {
        // Server not active / static mode - keep localStorage data
      }
    }

    // 3. If still empty, create initial starter layout
    if (!loaded || this.layouts.length === 0) {
      const initial = this.createDefaultLayout(defaultCanvasData);
      this.layouts = [initial];
      this.activeLayoutId = initial.id;
      this.saveToLocalStorage();
      this.syncServerSave(initial);
    }

    // Ensure activeLayoutId is valid
    if (!this.activeLayoutId || !this.get(this.activeLayoutId)) {
      this.activeLayoutId = this.layouts[0].id;
      this.saveActiveIdToLocalStorage();
    }

    this.notify('init', this.getActive());
    return this.getActive();
  }

  createDefaultLayout(canvasData = null) {
    return {
      id: 'layout_' + Date.now(),
      name: 'Starter Cozy Room',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gridSize: canvasData?.gridSize || 64,
      gridType: canvasData?.gridType || 'isometric',
      snapToGrid: canvasData?.snapToGrid !== false,
      items: canvasData?.items ? JSON.parse(JSON.stringify(canvasData.items)) : []
    };
  }

  // Get all layouts sorted by updatedAt descending
  getAll() {
    return [...this.layouts].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  get(id) {
    return this.layouts.find(l => l.id === id) || null;
  }

  getActiveId() {
    return this.activeLayoutId;
  }

  getActive() {
    return this.get(this.activeLayoutId) || this.layouts[0] || null;
  }

  setActiveId(id) {
    if (this.get(id)) {
      this.activeLayoutId = id;
      this.saveActiveIdToLocalStorage();
      this.notify('switch', this.getActive());
      return true;
    }
    return false;
  }

  // Save current canvas state to active layout
  saveActive(canvasData) {
    const active = this.getActive();
    if (!active) return null;

    active.updatedAt = Date.now();
    active.gridSize = canvasData.gridSize || active.gridSize || 64;
    active.gridType = canvasData.gridType || active.gridType || 'isometric';
    active.snapToGrid = canvasData.snapToGrid !== false;
    active.items = JSON.parse(JSON.stringify(canvasData.items || []));

    this.saveToLocalStorage();
    this.syncServerSave(active);
    this.notify('save', active);
    return active;
  }

  // Save current canvas state as a new named layout
  saveAsNew(name, canvasData) {
    const trimmed = (name || '').trim() || 'Untitled Room';
    const newId = 'layout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const newLayout = {
      id: newId,
      name: trimmed,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gridSize: canvasData.gridSize || 64,
      gridType: canvasData.gridType || 'isometric',
      snapToGrid: canvasData.snapToGrid !== false,
      items: JSON.parse(JSON.stringify(canvasData.items || []))
    };

    this.layouts.unshift(newLayout);
    this.activeLayoutId = newId;

    this.saveToLocalStorage();
    this.saveActiveIdToLocalStorage();
    this.syncServerSave(newLayout);
    this.notify('create', newLayout);
    return newLayout;
  }

  // Rename an existing layout
  rename(id, newName) {
    const layout = this.get(id);
    if (!layout) return null;

    const trimmed = (newName || '').trim();
    if (!trimmed) return null;

    layout.name = trimmed;
    layout.updatedAt = Date.now();

    this.saveToLocalStorage();
    this.syncServerSave(layout);
    this.notify('rename', layout);
    return layout;
  }

  // Delete a layout
  delete(id) {
    const index = this.layouts.findIndex(l => l.id === id);
    if (index === -1) return false;

    const [deleted] = this.layouts.splice(index, 1);
    this.syncServerDelete(deleted.id);

    // If deleted layout was active, switch to first available or create blank
    if (this.activeLayoutId === id) {
      if (this.layouts.length > 0) {
        this.activeLayoutId = this.layouts[0].id;
      } else {
        const fresh = this.createDefaultLayout();
        fresh.name = 'New Empty Room';
        this.layouts = [fresh];
        this.activeLayoutId = fresh.id;
        this.syncServerSave(fresh);
      }
      this.saveActiveIdToLocalStorage();
    }

    this.saveToLocalStorage();
    this.notify('delete', { deleted, active: this.getActive() });
    return true;
  }

  // Duplicate an existing layout
  duplicate(id) {
    const source = this.get(id);
    if (!source) return null;

    const copyName = `${source.name} (Copy)`;
    const newId = 'layout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const clone = {
      id: newId,
      name: copyName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      gridSize: source.gridSize || 64,
      gridType: source.gridType || 'isometric',
      snapToGrid: source.snapToGrid !== false,
      items: JSON.parse(JSON.stringify(source.items || []))
    };

    this.layouts.unshift(clone);
    this.activeLayoutId = newId;

    this.saveToLocalStorage();
    this.saveActiveIdToLocalStorage();
    this.syncServerSave(clone);
    this.notify('create', clone);
    return clone;
  }

  // Export single layout as JSON file
  exportJson(id) {
    const layout = this.get(id);
    if (!layout) return;

    const data = JSON.stringify(layout, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = layout.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    link.download = `isoroom_${safeName}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Export all layouts as backup JSON
  exportAllJson() {
    const data = JSON.stringify(this.layouts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `isoroom_all_layouts_${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Import layout(s) from JSON string or parsed object
  importJson(jsonData) {
    let parsed;
    try {
      parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch (e) {
      throw new Error('Invalid JSON format.');
    }

    const itemsToImport = Array.isArray(parsed) ? parsed : [parsed];
    let importedCount = 0;

    for (const item of itemsToImport) {
      if (item && item.name && Array.isArray(item.items)) {
        const newId = 'layout_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        const layout = {
          id: newId,
          name: item.name + (this.layouts.some(l => l.name === item.name) ? ' (Imported)' : ''),
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now(),
          gridSize: item.gridSize || 64,
          gridType: item.gridType || 'isometric',
          snapToGrid: item.snapToGrid !== false,
          items: item.items
        };
        this.layouts.unshift(layout);
        this.activeLayoutId = newId;
        this.syncServerSave(layout);
        importedCount++;
      }
    }

    if (importedCount === 0) {
      throw new Error('No valid layout structure found in file.');
    }

    this.saveToLocalStorage();
    this.saveActiveIdToLocalStorage();
    this.notify('import', this.getActive());
    return importedCount;
  }

  // Helper persistence methods
  saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_LAYOUTS, JSON.stringify(this.layouts));
    } catch (e) {
      console.warn('Failed to save layouts to localStorage:', e);
    }
  }

  saveActiveIdToLocalStorage() {
    try {
      if (this.activeLayoutId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, this.activeLayoutId);
      }
    } catch (e) {
      console.warn('Failed to save activeLayoutId to localStorage:', e);
    }
  }

  // Asynchronous server synchronization (non-blocking)
  async syncServerSave(layout) {
    if (typeof window === 'undefined' || !window.location || !window.location.protocol.startsWith('http')) return;
    try {
      await fetch('/api/save-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout)
      });
    } catch (e) {
      // Offline / file mode - safe to ignore
    }
  }

  async syncServerDelete(layoutId) {
    if (typeof window === 'undefined' || !window.location || !window.location.protocol.startsWith('http')) return;
    try {
      await fetch('/api/delete-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: layoutId })
      });
    } catch (e) {
      // Offline / file mode - safe to ignore
    }
  }
}

// Global instance or export
window.LayoutManager = LayoutManager;

