/**
 * Isometric Room Canvas Management
 */

class RoomCanvas {
  constructor(canvasElement, library) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.library = library;

    // Canvas Items (placed sprites)
    this.items = [];
    this.selectedItem = null;

    // Viewport Transform (Pan & Zoom)
    this.view = {
      x: 0,
      y: 0,
      scale: 1.0,
      minScale: 0.25,
      maxScale: 3.0
    };

    // Active tool: 'select' | 'pan'
    this.activeTool = 'select';
    this.isSpacePressed = false;

    // Grid Configuration
    this.grid = {
      enabled: true,
      snap: true,
      size: 64, // Isometric diamond width
      type: 'isometric', // 'isometric' | 'rectangular'
      color: '#334155',
      showGrid: true
    };

    // Interaction State
    this.interaction = {
      mode: 'idle', // 'idle' | 'moving' | 'resizing' | 'panning'
      activeHandle: null, // 'nw' | 'ne' | 'se' | 'sw'
      hasDragged: false,
      screenDragStart: { x: 0, y: 0 },
      dragStart: { x: 0, y: 0 },
      itemStartPos: { x: 0, y: 0 },
      itemStartSize: { width: 0, height: 0 },
      panStart: { x: 0, y: 0 }
    };

    // Resize handle configuration
    this.handleRadius = 6;
    this.handleHitRadius = 12;

    // Callbacks
    this.hoveredItem = null;
    this.onSelectionChange = null;
    this.onItemChange = null;
    this.onToolChange = null;
    this.onItemsListChange = null;
    this.onViewChange = null;

    this.initCanvasSize();
    this.bindEvents();
    this.centerView();
    this.requestRender();
  }

  notifyListChange() {
    if (this.onItemsListChange) {
      this.onItemsListChange(this.items);
    }
  }

  setHoveredItem(item) {
    if (this.hoveredItem !== item) {
      this.hoveredItem = item;
      this.requestRender();
    }
  }

  isItemInView(item) {
    if (!item) return false;
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(this.displayWidth, this.displayHeight);
    return (
      item.x + item.width >= topLeft.x &&
      item.x <= bottomRight.x &&
      item.y + item.height >= topLeft.y &&
      item.y <= bottomRight.y
    );
  }

  centerOnItem(item) {
    if (!item) return;
    this.view.x = (this.displayWidth / 2) - (item.x + item.width / 2) * this.view.scale;
    this.view.y = (this.displayHeight / 2) - (item.y + item.height / 2) * this.view.scale;
    this.requestRender();
    if (this.onViewChange) this.onViewChange(this.view);
  }

  toggleItemVisibility(item) {
    if (!item) return;
    item.hidden = !item.hidden;
    if (item.hidden && this.selectedItem === item) {
      this.selectItem(null);
    }
    this.requestRender();
    this.notifyListChange();
  }

  setTool(tool) {
    this.activeTool = tool;
    this.updateCursor();
    if (this.onToolChange) this.onToolChange(tool);
  }

  updateCursor() {
    if (this.interaction.mode === 'panning') {
      this.canvas.style.cursor = 'grabbing';
    } else if (this.isSpacePressed || this.activeTool === 'pan') {
      this.canvas.style.cursor = 'grab';
    } else {
      this.canvas.style.cursor = 'default';
    }
  }

  initCanvasSize() {
    const parent = this.canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.displayWidth = rect.width;
    this.displayHeight = rect.height;

    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);

    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    this.dpr = dpr;
  }

  centerView() {
    this.view.x = this.displayWidth / 2;
    this.view.y = this.displayHeight / 3;
    this.requestRender();
  }

  // World <-> Screen conversion
  screenToWorld(sx, sy) {
    return {
      x: (sx - this.view.x) / this.view.scale,
      y: (sy - this.view.y) / this.view.scale
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.view.scale + this.view.x,
      y: wy * this.view.scale + this.view.y
    };
  }

  // Snapping logic
  snapCoordinate(x, y) {
    if (!this.grid.snap) return { x, y };

    if (this.grid.type === 'isometric') {
      // In 2:1 isometric, grid size S represents tile width, S/2 is tile height.
      // Snapping by half-steps (S/2 horizontally and S/4 vertically)
      // aligns to both tile corners and centers cleanly.
      const stepX = this.grid.size / 2;
      const stepY = this.grid.size / 4;
      return {
        x: Math.round(x / stepX) * stepX,
        y: Math.round(y / stepY) * stepY
      };
    } else {
      const s = this.grid.size;
      return {
        x: Math.round(x / s) * s,
        y: Math.round(y / s) * s
      };
    }
  }

  // Add a new sprite instance to canvas
  addItem(sprite, worldPos = null) {
    const origW = sprite.width || 64;
    const origH = sprite.height || 64;
    const ratio = origW / origH;

    // Sensible initial placement size if original image is very large (e.g. 700x700 JPG/PNG)
    let initW = origW;
    let initH = origH;
    const maxInitialDim = 160;
    if (initW > maxInitialDim || initH > maxInitialDim) {
      if (initW >= initH) {
        initW = maxInitialDim;
        initH = Math.round(maxInitialDim / ratio);
      } else {
        initH = maxInitialDim;
        initW = Math.round(maxInitialDim * ratio);
      }
    }

    let posX, posY;
    if (worldPos) {
      posX = worldPos.x - initW / 2;
      posY = worldPos.y - initH / 2;
    } else {
      // Place in center of current screen view
      const center = this.screenToWorld(this.displayWidth / 2, this.displayHeight / 2);
      posX = center.x - initW / 2;
      posY = center.y - initH / 2;
    }

    const snapped = this.snapCoordinate(posX, posY);

    const item = {
      id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      spriteId: sprite.id,
      name: sprite.name,
      filename: sprite.filename,
      src: sprite.src,
      origWidth: origW,
      origHeight: origH,
      aspectRatio: ratio,
      x: snapped.x,
      y: snapped.y,
      width: initW,
      height: initH,
      rotation: 0,
      flipX: false,
      flipY: false,
      zIndex: this.items.length
    };

    this.items.push(item);
    this.selectItem(item);
    this.requestRender();
    this.notifyListChange();
    return item;
  }

  // Remove an item
  removeItem(item) {
    if (!item) item = this.selectedItem;
    if (!item) return;

    const idx = this.items.indexOf(item);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      if (this.selectedItem === item) {
        this.selectItem(null);
      }
      this.requestRender();
      if (this.onItemChange) this.onItemChange(null);
      this.notifyListChange();
    }
  }

  // Clear all items
  clear() {
    this.items = [];
    this.selectItem(null);
    this.requestRender();
    this.notifyListChange();
  }

  setGridSize(size) {
    let val = parseInt(size, 10);
    if (isNaN(val) || val < 8) val = 8;
    if (val > 256) val = 256;
    this.grid.size = val;
    this.requestRender();
  }

  setGridType(type) {
    this.grid.type = type === 'rectangular' ? 'rectangular' : 'isometric';
    this.requestRender();
  }

  // Get serializable snapshot of the room layout
  getLayoutData() {
    return {
      gridSize: this.grid.size,
      gridType: this.grid.type,
      snapToGrid: this.grid.snap,
      items: this.items.map(item => ({
        id: item.id,
        spriteId: item.spriteId,
        name: item.name,
        filename: item.filename,
        src: item.src,
        origWidth: item.origWidth,
        origHeight: item.origHeight,
        aspectRatio: item.aspectRatio,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        rotation: Math.round(item.rotation || 0),
        flipX: !!item.flipX,
        flipY: !!item.flipY,
        zIndex: item.zIndex,
        hidden: !!item.hidden,
        locked: !!item.locked
      }))
    };
  }

  // Load a complete layout into the room canvas
  loadLayoutData(layoutData) {
    this.clear();
    if (!layoutData) return;

    if (layoutData.gridSize) {
      this.grid.size = layoutData.gridSize;
    }
    if (layoutData.gridType) {
      this.grid.type = layoutData.gridType;
    }
    if (typeof layoutData.snapToGrid === 'boolean') {
      this.grid.snap = layoutData.snapToGrid;
    }

    if (Array.isArray(layoutData.items)) {
      this.items = layoutData.items.map(item => ({
        ...item,
        rotation: Number(item.rotation) || 0,
        flipX: !!item.flipX,
        flipY: !!item.flipY
      }));
      
      // Preload any missing sprite images
      this.items.forEach(item => {
        const img = this.library.getImage(item.spriteId);
        if (!img) {
          const spriteDef = this.library.sprites.find(s => s.id === item.spriteId) || {
            id: item.spriteId,
            name: item.name || 'Sprite',
            filename: item.filename || `${item.spriteId}.png`,
            src: item.src || `assets/${item.filename}`
          };
          this.library.preload(spriteDef).then(() => this.requestRender());
        }
      });
    }

    this.requestRender();
    this.notifyListChange();
  }

  // Select/Deselect item
  selectItem(item) {
    if (this.selectedItem === item) return;
    this.selectedItem = item;
    if (this.onSelectionChange) {
      this.onSelectionChange(this.selectedItem);
    }
    this.requestRender();
  }

  // Corner handles in world coordinates (taking rotation into account)
  getHandles(item) {
    if (!item) return null;
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    const hw = item.width / 2;
    const hh = item.height / 2;
    const rad = ((item.rotation || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rotatePt = (lx, ly) => ({
      x: cx + lx * cos - ly * sin,
      y: cy + lx * sin + ly * cos
    });

    return {
      nw: { ...rotatePt(-hw, -hh), cursor: 'nwse-resize' },
      ne: { ...rotatePt(hw, -hh), cursor: 'nesw-resize' },
      se: { ...rotatePt(hw, hh), cursor: 'nwse-resize' },
      sw: { ...rotatePt(-hw, hh), cursor: 'nesw-resize' }
    };
  }

  // Check if point hits any resize handle of selected item
  hitTestHandle(worldPt) {
    if (!this.selectedItem) return null;
    const handles = this.getHandles(this.selectedItem);
    const hitRadiusWorld = this.handleHitRadius / this.view.scale;

    for (const [key, pt] of Object.entries(handles)) {
      const dx = worldPt.x - pt.x;
      const dy = worldPt.y - pt.y;
      if (Math.hypot(dx, dy) <= hitRadiusWorld) {
        return key;
      }
    }
    return null;
  }

  // Hit test items from top to bottom (supports rotated bounds)
  hitTestItem(worldPt) {
    const sorted = [...this.items].sort((a, b) => b.zIndex - a.zIndex);
    for (const item of sorted) {
      if (item.hidden) continue;

      const cx = item.x + item.width / 2;
      const cy = item.y + item.height / 2;
      const dx = worldPt.x - cx;
      const dy = worldPt.y - cy;
      const rad = -((item.rotation || 0) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const localX = dx * cos - dy * sin;
      const localY = dx * sin + dy * cos;
      const hw = item.width / 2;
      const hh = item.height / 2;

      if (localX >= -hw && localX <= hw && localY >= -hh && localY <= hh) {
        return item;
      }
    }
    return null;
  }

  // Auto depth sort for isometric rooms
  autoSortDepth() {
    // In isometric projection, items with higher bottom edge (y + height) render in front
    this.items.sort((a, b) => {
      const bottomA = a.y + a.height;
      const bottomB = b.y + b.height;
      return bottomA - bottomB;
    });
    this.items.forEach((item, index) => {
      item.zIndex = index;
    });
    this.requestRender();
    this.notifyListChange();
  }

  // Layer ordering
  bringToFront(item) {
    if (!item) return;
    const maxZ = Math.max(0, ...this.items.map(i => i.zIndex));
    item.zIndex = maxZ + 1;
    this.normalizeZIndex();
    this.requestRender();
  }

  sendToBack(item) {
    if (!item) return;
    const minZ = Math.min(0, ...this.items.map(i => i.zIndex));
    item.zIndex = minZ - 1;
    this.normalizeZIndex();
    this.requestRender();
  }

  bringForward(item) {
    if (!item) return;
    const higher = this.items
      .filter(i => i.zIndex > item.zIndex)
      .sort((a, b) => a.zIndex - b.zIndex);
    if (higher.length > 0) {
      const swapWith = higher[0];
      const temp = item.zIndex;
      item.zIndex = swapWith.zIndex;
      swapWith.zIndex = temp;
      this.normalizeZIndex();
      this.requestRender();
    }
  }

  sendBackward(item) {
    if (!item) return;
    const lower = this.items
      .filter(i => i.zIndex < item.zIndex)
      .sort((a, b) => b.zIndex - a.zIndex);
    if (lower.length > 0) {
      const swapWith = lower[0];
      const temp = item.zIndex;
      item.zIndex = swapWith.zIndex;
      swapWith.zIndex = temp;
      this.normalizeZIndex();
      this.requestRender();
    }
  }

  normalizeZIndex() {
    const sorted = [...this.items].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((item, idx) => {
      item.zIndex = idx;
    });
    this.notifyListChange();
  }

  // Set Dimensions explicitly (from inspector inputs)
  setItemDimensions(item, newWidth, newHeight, keepAspect = true) {
    if (!item) return;
    newWidth = Math.max(10, Math.round(Number(newWidth) || item.width));
    newHeight = Math.max(10, Math.round(Number(newHeight) || item.height));

    if (keepAspect) {
      newHeight = Math.round(newWidth / item.aspectRatio);
    }

    item.width = newWidth;
    item.height = newHeight;

    this.requestRender();
    if (this.onItemChange) {
      this.onItemChange(item);
    }
    this.notifyListChange();
  }

  // Set rotation in degrees (supports any number specified by user)
  setItemRotation(item, degrees) {
    if (!item) return;
    let deg = Number(degrees);
    if (isNaN(deg)) deg = 0;
    item.rotation = Math.round(deg);
    this.requestRender();
    if (this.onItemChange) {
      this.onItemChange(item);
    }
    this.notifyListChange();
  }

  // Toggle Horizontal Flip
  toggleItemFlipX(item) {
    if (!item) return false;
    item.flipX = !item.flipX;
    this.requestRender();
    if (this.onItemChange) {
      this.onItemChange(item);
    }
    this.notifyListChange();
    return item.flipX;
  }

  // Toggle Vertical Flip
  toggleItemFlipY(item) {
    if (!item) return false;
    item.flipY = !item.flipY;
    this.requestRender();
    if (this.onItemChange) {
      this.onItemChange(item);
    }
    this.notifyListChange();
    return item.flipY;
  }

  duplicateSelectedItem() {
    if (!this.selectedItem) return;
    const orig = this.selectedItem;
    const offset = this.grid.size / 2;
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
      spriteId: orig.spriteId,
      name: orig.name,
      filename: orig.filename,
      src: orig.src,
      origWidth: orig.origWidth,
      origHeight: orig.origHeight,
      aspectRatio: orig.aspectRatio,
      x: orig.x + offset,
      y: orig.y + offset / 2,
      width: orig.width,
      height: orig.height,
      rotation: orig.rotation || 0,
      flipX: !!orig.flipX,
      flipY: !!orig.flipY,
      zIndex: this.items.length
    };
    this.items.push(newItem);
    this.selectItem(newItem);
    this.requestRender();
    this.notifyListChange();
  }

  // Event Listeners
  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.requestRender();
    });

    if (typeof ResizeObserver !== 'undefined' && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.initCanvasSize();
        this.requestRender();
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    const el = this.canvas;

    el.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));

    // Prevent default context menu on canvas so right-click can be used to pan!
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    el.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // Drag-and-drop from library onto canvas
    el.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    el.addEventListener('drop', (e) => {
      e.preventDefault();
      const spriteData = e.dataTransfer.getData('application/json');
      if (spriteData) {
        try {
          const sprite = JSON.parse(spriteData);
          const rect = this.canvas.getBoundingClientRect();
          const screenX = e.clientX - rect.left;
          const screenY = e.clientY - rect.top;
          const worldPos = this.screenToWorld(screenX, screenY);
          this.addItem(sprite, worldPos);
        } catch (err) {
          console.error('Invalid sprite drop data', err);
        }
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Spacebar for Panning (prevent Firefox page scrolling)
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (!this.isSpacePressed) {
          this.isSpacePressed = true;
          this.updateCursor();
        }
        return;
      }

      // Tool switches: V = Select, H = Pan
      if (e.key === 'v' || e.key === 'V') {
        this.setTool('select');
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        this.setTool('pan');
        return;
      }

      // R = Rotate selected item by 45° (Shift+R for -45°)
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        if (this.selectedItem) {
          e.preventDefault();
          const delta = e.shiftKey ? -45 : 45;
          const next = (((this.selectedItem.rotation || 0) + delta) % 360 + 360) % 360;
          this.setItemRotation(this.selectedItem, next);
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedItem) {
          e.preventDefault();
          this.removeItem(this.selectedItem);
        }
      } else if (e.key === 'Escape') {
        this.selectItem(null);
      } else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        if (this.selectedItem) {
          e.preventDefault();
          this.duplicateSelectedItem();
        }
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (this.selectedItem) {
          e.preventDefault();
          const isIso = this.grid.type === 'isometric';
          let stepX, stepY;

          if (this.grid.snap) {
            if (e.shiftKey) {
              // Shift with snap enabled: precision micro-nudge (bypasses snap)
              stepX = 2;
              stepY = 2;
            } else {
              // Standard arrow with snap: step by grid cell unit
              stepX = isIso ? this.grid.size / 2 : this.grid.size;
              stepY = isIso ? this.grid.size / 4 : this.grid.size;
            }
          } else {
            // Free movement (snap disabled): 4px default, 16px with Shift
            const freeStep = e.shiftKey ? 16 : 4;
            stepX = freeStep;
            stepY = freeStep;
          }

          let dx = 0, dy = 0;
          if (e.key === 'ArrowLeft') dx = -stepX;
          if (e.key === 'ArrowRight') dx = stepX;
          if (e.key === 'ArrowUp') dy = -stepY;
          if (e.key === 'ArrowDown') dy = stepY;

          if (this.grid.snap && !e.shiftKey) {
            const snapped = this.snapCoordinate(this.selectedItem.x, this.selectedItem.y);
            this.selectedItem.x = snapped.x + dx;
            this.selectedItem.y = snapped.y + dy;
          } else {
            this.selectedItem.x += dx;
            this.selectedItem.y += dy;
          }

          this.requestRender();
          if (this.onItemChange) this.onItemChange(this.selectedItem);
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        this.isSpacePressed = false;
        if (this.interaction.mode === 'panning' && this.activeTool !== 'pan') {
          this.interaction.mode = 'idle';
        }
        this.updateCursor();
      }
    });

    window.addEventListener('blur', () => {
      this.isSpacePressed = false;
      if (this.interaction.mode === 'panning' && this.activeTool !== 'pan') {
        this.interaction.mode = 'idle';
      }
      this.updateCursor();
    });
  }

  onMouseDown(e) {
    const isPanTrigger = this.activeTool === 'pan' ||
                         this.isSpacePressed ||
                         e.button === 1 || // Middle-click
                         e.button === 2 || // Right-click
                         (e.button === 0 && e.altKey);

    if (isPanTrigger) {
      this.interaction.mode = 'panning';
      this.interaction.panStart = { x: e.clientX, y: e.clientY };
      this.canvas.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }

    if (e.button !== 0) return;

    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPt = this.screenToWorld(screenX, screenY);

    this.interaction.hasDragged = false;
    this.interaction.screenDragStart = { x: e.clientX, y: e.clientY };

    // 1. Check if clicking on an active resize handle of selected item
    if (this.selectedItem) {
      const handleKey = this.hitTestHandle(worldPt);
      if (handleKey) {
        this.interaction.mode = 'resizing';
        this.interaction.activeHandle = handleKey;
        this.interaction.dragStart = { ...worldPt };
        this.interaction.itemStartPos = { x: this.selectedItem.x, y: this.selectedItem.y };
        this.interaction.itemStartSize = { width: this.selectedItem.width, height: this.selectedItem.height };
        return;
      }
    }

    // 2. Hit test items
    const clickedItem = this.hitTestItem(worldPt);
    if (clickedItem) {
      this.selectItem(clickedItem);
      this.interaction.mode = 'moving';
      this.interaction.dragStart = { ...worldPt };
      this.interaction.itemStartPos = { x: clickedItem.x, y: clickedItem.y };
      return;
    }

    // 3. Clicked empty canvas -> Deselect
    this.selectItem(null);
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPt = this.screenToWorld(screenX, screenY);

    if (this.interaction.mode === 'panning') {
      const dx = e.clientX - this.interaction.panStart.x;
      const dy = e.clientY - this.interaction.panStart.y;
      this.view.x += dx;
      this.view.y += dy;
      this.interaction.panStart = { x: e.clientX, y: e.clientY };
      this.requestRender();
      if (this.onViewChange) this.onViewChange(this.view);
      return;
    }

    if (this.interaction.mode === 'moving' && this.selectedItem) {
      const dist = Math.hypot(e.clientX - this.interaction.screenDragStart.x, e.clientY - this.interaction.screenDragStart.y);
      if (!this.interaction.hasDragged && dist < 3) {
        return; // Avoid accidental micro-jumps on click
      }
      this.interaction.hasDragged = true;

      const dx = worldPt.x - this.interaction.dragStart.x;
      const dy = worldPt.y - this.interaction.dragStart.y;

      let targetX = this.interaction.itemStartPos.x + dx;
      let targetY = this.interaction.itemStartPos.y + dy;

      if (this.grid.snap) {
        const snapped = this.snapCoordinate(targetX, targetY);
        targetX = snapped.x;
        targetY = snapped.y;
      }

      this.selectedItem.x = targetX;
      this.selectedItem.y = targetY;

      this.requestRender();
      if (this.onItemChange) this.onItemChange(this.selectedItem);
      this.notifyListChange();
      return;
    }

    if (this.interaction.mode === 'resizing' && this.selectedItem) {
      const item = this.selectedItem;
      const handle = this.interaction.activeHandle;
      const startPos = this.interaction.itemStartPos;
      const startW = this.interaction.itemStartSize.width;
      const startH = this.interaction.itemStartSize.height;

      const startCenterX = startPos.x + startW / 2;
      const startCenterY = startPos.y + startH / 2;
      const rad = ((item.rotation || 0) * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      // Transform worldPt into local coordinate system centered at item's initial center
      const dx = worldPt.x - startCenterX;
      const dy = worldPt.y - startCenterY;
      const lx = dx * cos + dy * sin;
      const ly = -dx * sin + dy * cos;

      // Mathematical vector projection onto diagonal to preserve exact aspect ratio smoothly:
      let vx, vy, anchorLocalX, anchorLocalY, centerDirX, centerDirY;

      if (handle === 'se') {
        anchorLocalX = -startW / 2;
        anchorLocalY = -startH / 2;
        vx = lx - anchorLocalX;
        vy = ly - anchorLocalY;
        centerDirX = 0.5;
        centerDirY = 0.5;
      } else if (handle === 'nw') {
        anchorLocalX = startW / 2;
        anchorLocalY = startH / 2;
        vx = anchorLocalX - lx;
        vy = anchorLocalY - ly;
        centerDirX = -0.5;
        centerDirY = -0.5;
      } else if (handle === 'ne') {
        anchorLocalX = -startW / 2;
        anchorLocalY = startH / 2;
        vx = lx - anchorLocalX;
        vy = anchorLocalY - ly;
        centerDirX = 0.5;
        centerDirY = -0.5;
      } else if (handle === 'sw') {
        anchorLocalX = startW / 2;
        anchorLocalY = -startH / 2;
        vx = anchorLocalX - lx;
        vy = ly - anchorLocalY;
        centerDirX = -0.5;
        centerDirY = 0.5;
      }

      const denom = (startW * startW) + (startH * startH);
      let scale = (vx * startW + vy * startH) / denom;

      // Minimum size constraint (at least 20px)
      const minScale = 20 / startW;
      scale = Math.max(minScale, scale);

      const newW = Math.round(startW * scale);
      const newH = Math.round(startH * scale);

      // Compute local center position relative to startCenter
      const newLocalCenterX = anchorLocalX + centerDirX * newW;
      const newLocalCenterY = anchorLocalY + centerDirY * newH;

      // Rotate local center displacement back to world coordinates
      const worldCenterX = startCenterX + newLocalCenterX * cos - newLocalCenterY * sin;
      const worldCenterY = startCenterY + newLocalCenterX * sin + newLocalCenterY * cos;

      item.x = Math.round(worldCenterX - newW / 2);
      item.y = Math.round(worldCenterY - newH / 2);
      item.width = newW;
      item.height = newH;

      this.requestRender();
      if (this.onItemChange) this.onItemChange(item);
      this.notifyListChange();
      return;
    }

    // Hover cursor updates
    if (this.interaction.mode === 'idle') {
      if (this.isSpacePressed || this.activeTool === 'pan') {
        this.canvas.style.cursor = 'grab';
        return;
      }

      if (this.selectedItem) {
        const handleKey = this.hitTestHandle(worldPt);
        if (handleKey) {
          const handles = this.getHandles(this.selectedItem);
          this.canvas.style.cursor = handles[handleKey].cursor;
          return;
        }
      }

      const item = this.hitTestItem(worldPt);
      if (item) {
        this.canvas.style.cursor = 'move';
      } else {
        this.canvas.style.cursor = 'default';
      }
    }
  }

  onMouseUp(e) {
    if (this.interaction.mode !== 'idle') {
      this.interaction.mode = 'idle';
      this.interaction.activeHandle = null;
      this.updateCursor();
      this.requestRender();
    }
  }

  onWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.909;
    const newScale = Math.min(this.view.maxScale, Math.max(this.view.minScale, this.view.scale * zoomFactor));

    if (newScale !== this.view.scale) {
      this.view.x = mouseX - (mouseX - this.view.x) * (newScale / this.view.scale);
      this.view.y = mouseY - (mouseY - this.view.y) * (newScale / this.view.scale);
      this.view.scale = newScale;
      this.requestRender();
      if (this.onViewChange) this.onViewChange(this.view);
    }
  }

  setZoom(scale) {
    this.view.scale = Math.min(this.view.maxScale, Math.max(this.view.minScale, scale));
    this.requestRender();
    if (this.onViewChange) this.onViewChange(this.view);
  }

  resetZoom() {
    this.view.scale = 1.0;
    this.centerView();
    if (this.onViewChange) this.onViewChange(this.view);
  }

  requestRender() {
    if (!this.renderPending) {
      this.renderPending = true;
      requestAnimationFrame(() => {
        this.renderPending = false;
        this.render();
      });
    }
  }

  render() {
    const ctx = this.ctx;
    const dpr = this.dpr || 1;

    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.scale(dpr, dpr);
    ctx.translate(this.view.x, this.view.y);
    ctx.scale(this.view.scale, this.view.scale);

    // 1. Draw Grid
    if (this.grid.showGrid) {
      this.drawGrid(ctx);
    }

    // 2. Sort items by zIndex for rendering
    const sorted = [...this.items].sort((a, b) => a.zIndex - b.zIndex);

    // 3. Draw placed sprites
    for (const item of sorted) {
      this.drawItem(ctx, item);
    }

    // 4. Draw temporary hover highlight (e.g. from hovering in Placed Assets list)
    if (this.hoveredItem && this.hoveredItem !== this.selectedItem && !this.hoveredItem.hidden) {
      this.drawHoverOutline(ctx, this.hoveredItem);
    }

    // 5. Draw selection handles for selected item
    if (this.selectedItem && !this.selectedItem.hidden) {
      this.drawSelection(ctx, this.selectedItem);
    }

    ctx.restore();
  }

  drawHoverOutline(ctx, item) {
    ctx.save();
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    ctx.translate(cx, cy);
    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2 / this.view.scale;
    ctx.setLineDash([4 / this.view.scale, 4 / this.view.scale]);
    ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
    ctx.restore();
  }

  drawGrid(ctx) {
    const size = this.grid.size;
    if (size <= 0) return;

    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(this.displayWidth, this.displayHeight);

    const margin = size * 3;
    const minX = topLeft.x - margin;
    const maxX = bottomRight.x + margin;
    const minY = topLeft.y - margin;
    const maxY = bottomRight.y + margin;

    ctx.save();
    ctx.strokeStyle = this.grid.color;
    ctx.lineWidth = 1 / this.view.scale;

    if (this.grid.type === 'isometric') {
      const tileW = size;
      const tileH = size / 2;

      // Lines of slope +0.5 and slope -0.5
      const k = tileH;

      const minK1 = Math.floor((2 * minY - maxX) / (2 * k)) * (2 * k);
      const maxK1 = Math.ceil((2 * maxY - minX) / (2 * k)) * (2 * k);

      const minK2 = Math.floor((2 * minY + minX) / (2 * k)) * (2 * k);
      const maxK2 = Math.ceil((2 * maxY + maxX) / (2 * k)) * (2 * k);

      ctx.beginPath();

      for (let c = minK1; c <= maxK1; c += 2 * k) {
        const y1 = (minX + c) / 2;
        const y2 = (maxX + c) / 2;
        ctx.moveTo(minX, y1);
        ctx.lineTo(maxX, y2);
      }

      for (let c = minK2; c <= maxK2; c += 2 * k) {
        const y1 = (c - minX) / 2;
        const y2 = (c - maxX) / 2;
        ctx.moveTo(minX, y1);
        ctx.lineTo(maxX, y2);
      }

      ctx.stroke();

      // Subtle center origin marker
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2 / this.view.scale;
      ctx.beginPath();
      ctx.moveTo(0, -tileH / 2);
      ctx.lineTo(tileW / 2, 0);
      ctx.lineTo(0, tileH / 2);
      ctx.lineTo(-tileW / 2, 0);
      ctx.closePath();
      ctx.stroke();

    } else {
      ctx.beginPath();
      const startX = Math.floor(minX / size) * size;
      const endX = Math.ceil(maxX / size) * size;
      const startY = Math.floor(minY / size) * size;
      const endY = Math.ceil(maxY / size) * size;

      for (let x = startX; x <= endX; x += size) {
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
      }
      for (let y = startY; y <= endY; y += size) {
        ctx.moveTo(minX, y);
        ctx.lineTo(maxX, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  drawItem(ctx, item) {
    if (item.hidden) return;
    const img = this.library.getImage(item.spriteId);

    ctx.save();
    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;
    ctx.translate(cx, cy);

    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }

    const sx = item.flipX ? -1 : 1;
    const sy = item.flipY ? -1 : 1;
    if (sx !== 1 || sy !== 1) {
      ctx.scale(sx, sy);
    }

    if (!img) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
      ctx.strokeStyle = '#3b82f6';
      ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
      ctx.restore();

      const spriteDef = this.library.sprites.find(s => s.id === item.spriteId);
      if (spriteDef) {
        this.library.loadImage(spriteDef).then(() => this.requestRender());
      }
      return;
    }

    ctx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height);
    ctx.restore();
  }

  drawSelection(ctx, item) {
    ctx.save();

    const cx = item.x + item.width / 2;
    const cy = item.y + item.height / 2;

    // 1. Selection Bounding Box (rotated with item)
    ctx.save();
    ctx.translate(cx, cy);
    if (item.rotation) {
      ctx.rotate((item.rotation * Math.PI) / 180);
    }
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5 / this.view.scale;
    ctx.setLineDash([4 / this.view.scale, 4 / this.view.scale]);
    ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
    ctx.restore();

    // 2. Corner Draggable Points (Handles)
    const handles = this.getHandles(item);
    const radius = this.handleRadius / this.view.scale;

    for (const [key, pt] of Object.entries(handles)) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2 / this.view.scale;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();
    }

    // 3. Small badge showing current dimensions and transform status above sprite
    let badgeText = `${Math.round(item.width)} × ${Math.round(item.height)} px`;
    if (item.rotation) {
      badgeText += ` • ${Math.round(item.rotation)}°`;
    }
    if (item.flipX && item.flipY) {
      badgeText += ` • Flip HV`;
    } else if (item.flipX) {
      badgeText += ` • Flip H`;
    } else if (item.flipY) {
      badgeText += ` • Flip V`;
    }

    ctx.font = `${Math.max(10, 11 / this.view.scale)}px sans-serif`;
    const textMetrics = ctx.measureText(badgeText);
    const padding = 5 / this.view.scale;
    const badgeW = textMetrics.width + padding * 2;
    const badgeH = 16 / this.view.scale;

    const minY = Math.min(handles.nw.y, handles.ne.y, handles.se.y, handles.sw.y);
    const badgeX = cx - badgeW / 2;
    const badgeY = minY - badgeH - 6 / this.view.scale;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3 / this.view.scale);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, cx, badgeY + badgeH / 2);

    ctx.restore();
  }

  // Export room canvas as PNG
  exportImage() {
    const visibleItems = this.items.filter(i => !i.hidden);
    if (visibleItems.length === 0) {
      alert('No visible sprites to export.');
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const item of visibleItems) {
      const handles = this.getHandles(item);
      for (const pt of Object.values(handles)) {
        minX = Math.min(minX, pt.x);
        minY = Math.min(minY, pt.y);
        maxX = Math.max(maxX, pt.x);
        maxY = Math.max(maxY, pt.y);
      }
    }

    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const outW = Math.ceil(maxX - minX);
    const outH = Math.ceil(maxY - minY);

    const offscreen = document.createElement('canvas');
    offscreen.width = outW;
    offscreen.height = outH;
    const offCtx = offscreen.getContext('2d');

    offCtx.clearRect(0, 0, outW, outH);

    const sorted = [...visibleItems].sort((a, b) => a.zIndex - b.zIndex);
    for (const item of sorted) {
      const img = this.library.getImage(item.spriteId);
      if (img) {
        offCtx.save();
        const cx = item.x + item.width / 2 - minX;
        const cy = item.y + item.height / 2 - minY;
        offCtx.translate(cx, cy);
        if (item.rotation) {
          offCtx.rotate((item.rotation * Math.PI) / 180);
        }
        const sx = item.flipX ? -1 : 1;
        const sy = item.flipY ? -1 : 1;
        if (sx !== 1 || sy !== 1) {
          offCtx.scale(sx, sy);
        }
        offCtx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height);
        offCtx.restore();
      }
    }

    const dataUrl = offscreen.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `isometric_room_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  }
}

