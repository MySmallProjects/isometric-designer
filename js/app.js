/**
 * Isometric Room Designer - Application Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Library and Canvas
  const library = new SpriteLibrary();
  const canvasEl = document.getElementById('roomCanvas');
  const roomCanvas = new RoomCanvas(canvasEl, library);

  // Application State
  let keepAspectLocked = true;
  let currentSidebarTab = 'library'; // 'library' | 'placed'
  let activePlacedFilter = 'all';    // 'all' | 'inView'
  let placedSearchQuery = '';
  let activeBgTarget = null;         // CanvasItem or SpriteDef
  let activeBgImg = null;            // HTMLImageElement

  // DOM Elements - Header / Toolbar
  const btnToolSelect = document.getElementById('btnToolSelect');
  const btnToolPan = document.getElementById('btnToolPan');
  const gridSizeInput = document.getElementById('gridSizeInput');
  const gridTypeSelect = document.getElementById('gridTypeSelect');
  const snapToggle = document.getElementById('snapToggle');
  const showGridToggle = document.getElementById('showGridToggle');
  const btnAutoSort = document.getElementById('btnAutoSort');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnResetView = document.getElementById('btnResetView');
  const zoomPercent = document.getElementById('zoomPercent');
  const btnClear = document.getElementById('btnClear');
  const btnExport = document.getElementById('btnExport');

  // DOM Elements - Sidebar Switcher & Tabs
  const tabBtnLibrary = document.getElementById('tabBtnLibrary');
  const tabBtnPlaced = document.getElementById('tabBtnPlaced');
  const tabCountLibrary = document.getElementById('tabCountLibrary');
  const tabCountPlaced = document.getElementById('tabCountPlaced');
  const tabContentLibrary = document.getElementById('tabContentLibrary');
  const tabContentPlaced = document.getElementById('tabContentPlaced');

  // DOM Elements - Sidebar / Library
  const libraryGrid = document.getElementById('libraryGrid');
  const libraryCount = document.getElementById('libraryCount');
  const btnRefreshLibrary = document.getElementById('btnRefreshLibrary');
  const spriteSearchInput = document.getElementById('spriteSearchInput');
  const categoryTabs = document.getElementById('categoryTabs');
  const uploadDropzone = document.getElementById('uploadDropzone');
  const spriteFileInput = document.getElementById('spriteFileInput');
  const folderFileInput = document.getElementById('folderFileInput');
  const btnPickFiles = document.getElementById('btnPickFiles');
  const btnPickFolder = document.getElementById('btnPickFolder');

  // DOM Elements - Sidebar / Placed Assets
  const placedCountSummary = document.getElementById('placedCountSummary');
  const btnPlacedDepthSort = document.getElementById('btnPlacedDepthSort');
  const placedSearchInput = document.getElementById('placedSearchInput');
  const btnFilterAllPlaced = document.getElementById('btnFilterAllPlaced');
  const btnFilterInView = document.getElementById('btnFilterInView');
  const countAllPlaced = document.getElementById('countAllPlaced');
  const countInView = document.getElementById('countInView');
  const placedList = document.getElementById('placedList');

  // DOM Elements - Slide-out Inspector
  const inspectorPanel = document.getElementById('inspectorPanel');
  const btnCloseInspector = document.getElementById('btnCloseInspector');
  const inspPreviewImg = document.getElementById('inspPreviewImg');
  const inspFilename = document.getElementById('inspFilename');
  const inspOrigDimensions = document.getElementById('inspOrigDimensions');
  const inspPosition = document.getElementById('inspPosition');
  const inspWidthInput = document.getElementById('inspWidthInput');
  const inspHeightInput = document.getElementById('inspHeightInput');
  const btnToggleAspect = document.getElementById('btnToggleAspect');
  const aspectLockIcon = document.getElementById('aspectLockIcon');
  const btnSetDimensions = document.getElementById('btnSetDimensions');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const btnBringForward = document.getElementById('btnBringForward');
  const btnSendBackward = document.getElementById('btnSendBackward');
  const btnBringToFront = document.getElementById('btnBringToFront');
  const btnSendToBack = document.getElementById('btnSendToBack');
  const btnDuplicate = document.getElementById('btnDuplicate');
  const btnRemoveSprite = document.getElementById('btnRemoveSprite');
  const btnDeleteFromLibrary = document.getElementById('btnDeleteFromLibrary');
  const btnOpenBgRemover = document.getElementById('btnOpenBgRemover');

  // DOM Elements - Background Remover Modal
  const bgRemoverModal = document.getElementById('bgRemoverModal');
  const btnCloseBgModal = document.getElementById('btnCloseBgModal');
  const btnCancelBgModal = document.getElementById('btnCancelBgModal');
  const bgOriginalImg = document.getElementById('bgOriginalImg');
  const bgResultCanvas = document.getElementById('bgResultCanvas');
  const bgColorPicker = document.getElementById('bgColorPicker');
  const bgColorHex = document.getElementById('bgColorHex');
  const btnEyedropper = document.getElementById('btnEyedropper');
  const bgTolerance = document.getElementById('bgTolerance');
  const bgToleranceVal = document.getElementById('bgToleranceVal');
  const bgModeRadios = document.querySelectorAll('input[name="bgMode"]');
  const bgSmoothEdges = document.getElementById('bgSmoothEdges');
  const btnDownloadTransparentPng = document.getElementById('btnDownloadTransparentPng');
  const btnSaveToAssets = document.getElementById('btnSaveToAssets');
  const btnApplyTransparent = document.getElementById('btnApplyTransparent');

  // Toast Notification Container
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  // Preload and Auto-discover Sprite Library
  await library.autoDiscoverAssets();
  await library.preloadAll();
  renderCategoryTabs();
  renderLibrary();

  // Add default starter room scene so user sees an immediate beautiful room!
  createStarterRoom(library, roomCanvas);
  renderPlacedList();

  // =========================================================================
  // Canvas Callbacks (Selection & Item Changes)
  // =========================================================================

  roomCanvas.onToolChange = (tool) => {
    btnToolSelect.classList.toggle('active', tool === 'select');
    btnToolPan.classList.toggle('active', tool === 'pan');
  };

  btnToolSelect.addEventListener('click', () => {
    roomCanvas.setTool('select');
  });

  btnToolPan.addEventListener('click', () => {
    roomCanvas.setTool('pan');
  });

  roomCanvas.onSelectionChange = (item) => {
    if (item) {
      updateInspectorValues(item);
      inspectorPanel.classList.add('is-open');
    } else {
      inspectorPanel.classList.remove('is-open');
    }
    renderPlacedList(false);
  };

  roomCanvas.onItemChange = (item) => {
    if (item && roomCanvas.selectedItem === item) {
      updateInspectorValues(item, false); // Don't steal focus from active inputs
    }
    renderPlacedList(false);
  };

  roomCanvas.onItemsListChange = () => {
    renderPlacedList();
  };

  roomCanvas.onViewChange = () => {
    if (activePlacedFilter === 'inView') {
      renderPlacedList();
    } else {
      updateInViewCount();
    }
  };

  function updateInspectorValues(item, updateInputs = true) {
    inspPreviewImg.src = item.src;
    inspFilename.textContent = item.filename;
    inspFilename.title = item.filename;
    inspOrigDimensions.textContent = `${item.origWidth} × ${item.origHeight} px`;
    inspPosition.textContent = `X: ${Math.round(item.x)}, Y: ${Math.round(item.y)}`;

    if (updateInputs) {
      inspWidthInput.value = Math.round(item.width);
      inspHeightInput.value = Math.round(item.height);
    }
  }

  // =========================================================================
  // Sidebar Dual Tab Navigation & Placed Assets Outliner
  // =========================================================================

  tabBtnLibrary.addEventListener('click', () => {
    currentSidebarTab = 'library';
    tabBtnLibrary.classList.add('active');
    tabBtnPlaced.classList.remove('active');
    tabContentLibrary.classList.add('active');
    tabContentPlaced.classList.remove('active');
  });

  tabBtnPlaced.addEventListener('click', () => {
    currentSidebarTab = 'placed';
    tabBtnPlaced.classList.add('active');
    tabBtnLibrary.classList.remove('active');
    tabContentPlaced.classList.add('active');
    tabContentLibrary.classList.remove('active');
    renderPlacedList();
  });

  btnFilterAllPlaced.addEventListener('click', () => {
    activePlacedFilter = 'all';
    btnFilterAllPlaced.classList.add('active');
    btnFilterInView.classList.remove('active');
    renderPlacedList();
  });

  btnFilterInView.addEventListener('click', () => {
    activePlacedFilter = 'inView';
    btnFilterInView.classList.add('active');
    btnFilterAllPlaced.classList.remove('active');
    renderPlacedList();
  });

  placedSearchInput.addEventListener('input', (e) => {
    placedSearchQuery = e.target.value.trim().toLowerCase();
    renderPlacedList();
  });

  btnPlacedDepthSort.addEventListener('click', () => {
    roomCanvas.autoSortDepth();
    renderPlacedList();
    showToast('Placed assets sorted by isometric depth');
  });

  function updateInViewCount() {
    const inViewCount = roomCanvas.items.filter(item => roomCanvas.isItemInView(item)).length;
    countInView.textContent = inViewCount;
    placedCountSummary.textContent = `${roomCanvas.items.length} items (${inViewCount} in view)`;
    tabCountPlaced.textContent = roomCanvas.items.length;
    tabCountLibrary.textContent = library.sprites.length;
    countAllPlaced.textContent = roomCanvas.items.length;
  }

  function renderPlacedList(rebuildDom = true) {
    updateInViewCount();

    // If placed tab is not active, we don't need to rebuild cards unless requested
    if (currentSidebarTab !== 'placed' && !rebuildDom) return;

    // Filter items
    const filtered = roomCanvas.items.filter(item => {
      if (activePlacedFilter === 'inView' && !roomCanvas.isItemInView(item)) {
        return false;
      }
      if (placedSearchQuery) {
        const matchesName = item.name && item.name.toLowerCase().includes(placedSearchQuery);
        const matchesFilename = item.filename && item.filename.toLowerCase().includes(placedSearchQuery);
        if (!matchesName && !matchesFilename) return false;
      }
      return true;
    });

    // Sort by layer descending (topmost on canvas appears at top of list)
    filtered.sort((a, b) => b.zIndex - a.zIndex);

    placedList.innerHTML = '';

    if (filtered.length === 0) {
      const emptyMsg = roomCanvas.items.length === 0
        ? 'No sprites placed in room yet.<br><span style="color:var(--primary); cursor:pointer;" id="linkSwitchToLibrary">Go to Library tab to add items.</span>'
        : (activePlacedFilter === 'inView' ? 'No placed sprites currently visible in the screen view.<br><span style="font-size:11px; color:var(--text-muted);">Pan or zoom canvas to reveal assets.</span>' : 'No placed sprites match search query.');
      
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'placed-empty-box';
      emptyDiv.innerHTML = emptyMsg;
      const link = emptyDiv.querySelector('#linkSwitchToLibrary');
      if (link) {
        link.addEventListener('click', () => tabBtnLibrary.click());
      }
      placedList.appendChild(emptyDiv);
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = `placed-item-card ${item === roomCanvas.selectedItem ? 'is-selected' : ''} ${item.hidden ? 'is-hidden' : ''}`;
      card.title = `${item.name} (${item.filename})\nClick to select & edit in Inspector`;

      const isHidden = item.hidden;

      card.innerHTML = `
        <div class="placed-item-thumb">
          <img src="${item.src}" alt="${item.name}">
        </div>
        <div class="placed-item-info">
          <div class="placed-item-title">${item.name}</div>
          <div class="placed-item-details">${Math.round(item.width)}×${Math.round(item.height)} px &bull; (${Math.round(item.x)}, ${Math.round(item.y)})</div>
        </div>
        <div class="placed-item-actions">
          <button class="placed-action-btn btn-vis ${isHidden ? 'active-hidden' : ''}" title="${isHidden ? 'Show sprite' : 'Hide sprite'}">
            ${isHidden ? `
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ` : `
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            `}
          </button>
          <button class="placed-action-btn btn-focus" title="Center camera view on this sprite">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="22" y1="12" x2="18" y2="12"/>
              <line x1="6" y1="12" x2="2" y2="12"/>
              <line x1="12" y1="6" x2="12" y2="2"/>
              <line x1="12" y1="22" x2="12" y2="18"/>
            </svg>
          </button>
          <button class="placed-action-btn btn-trash" title="Remove sprite from room">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;

      // Select item on click
      card.addEventListener('click', (e) => {
        if (e.target.closest('.placed-action-btn')) return;
        roomCanvas.selectItem(item);
      });

      // Hover preview highlight on canvas
      card.addEventListener('mouseenter', () => {
        roomCanvas.setHoveredItem(item);
      });
      card.addEventListener('mouseleave', () => {
        roomCanvas.setHoveredItem(null);
      });

      // Visibility toggle
      const btnVis = card.querySelector('.btn-vis');
      btnVis.addEventListener('click', (e) => {
        e.stopPropagation();
        roomCanvas.toggleItemVisibility(item);
        renderPlacedList();
      });

      // Focus / Center button
      const btnFocus = card.querySelector('.btn-focus');
      btnFocus.addEventListener('click', (e) => {
        e.stopPropagation();
        roomCanvas.centerOnItem(item);
        roomCanvas.selectItem(item);
        showToast(`Centered on "${item.name}"`);
      });

      // Delete button
      const btnTrash = card.querySelector('.btn-trash');
      btnTrash.addEventListener('click', (e) => {
        e.stopPropagation();
        roomCanvas.removeItem(item);
        showToast(`Removed "${item.name}"`);
      });

      placedList.appendChild(card);
    });
  }

  // =========================================================================
  // Inspector Panel Interactions
  // =========================================================================

  btnCloseInspector.addEventListener('click', () => {
    roomCanvas.selectItem(null);
  });

  // Aspect Lock Toggle
  btnToggleAspect.addEventListener('click', () => {
    keepAspectLocked = !keepAspectLocked;
    if (keepAspectLocked) {
      btnToggleAspect.classList.remove('unlocked');
      btnToggleAspect.title = 'Aspect Ratio Locked (Click to unlock)';
      aspectLockIcon.innerHTML = `
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      `;
      // Recalculate height to match aspect ratio
      if (roomCanvas.selectedItem && inspWidthInput.value) {
        inspHeightInput.value = Math.round(Number(inspWidthInput.value) / roomCanvas.selectedItem.aspectRatio);
      }
    } else {
      btnToggleAspect.classList.add('unlocked');
      btnToggleAspect.title = 'Aspect Ratio Unlocked (Click to lock)';
      aspectLockIcon.innerHTML = `
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
      `;
    }
  });

  // Dynamic aspect ratio calculation while typing
  inspWidthInput.addEventListener('input', () => {
    if (keepAspectLocked && roomCanvas.selectedItem) {
      const w = Number(inspWidthInput.value);
      if (w > 0) {
        inspHeightInput.value = Math.round(w / roomCanvas.selectedItem.aspectRatio);
      }
    }
  });

  inspHeightInput.addEventListener('input', () => {
    if (keepAspectLocked && roomCanvas.selectedItem) {
      const h = Number(inspHeightInput.value);
      if (h > 0) {
        inspWidthInput.value = Math.round(h * roomCanvas.selectedItem.aspectRatio);
      }
    }
  });

  // "Set Dimensions" button: applies changes on canvas
  btnSetDimensions.addEventListener('click', () => {
    applyDimensionChanges();
  });

  // Support pressing Enter in width/height inputs
  inspWidthInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyDimensionChanges();
  });
  inspHeightInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') applyDimensionChanges();
  });

  function applyDimensionChanges() {
    if (!roomCanvas.selectedItem) return;
    const w = Number(inspWidthInput.value);
    const h = Number(inspHeightInput.value);

    if (isNaN(w) || w <= 0 || isNaN(h) || h <= 0) {
      showToast('Please enter valid positive dimensions');
      return;
    }

    roomCanvas.setItemDimensions(roomCanvas.selectedItem, w, h, keepAspectLocked);
    showToast(`Sprite resized to ${w} × ${h} px`);
  }

  // Quick Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!roomCanvas.selectedItem) return;
      const scale = parseFloat(btn.dataset.scale);
      const newW = Math.round(roomCanvas.selectedItem.origWidth * scale);
      const newH = Math.round(roomCanvas.selectedItem.origHeight * scale);

      inspWidthInput.value = newW;
      inspHeightInput.value = newH;
      roomCanvas.setItemDimensions(roomCanvas.selectedItem, newW, newH, keepAspectLocked);
      showToast(`Scale set to ${btn.textContent}`);
    });
  });

  // Layer Controls
  btnBringForward.addEventListener('click', () => {
    if (roomCanvas.selectedItem) {
      roomCanvas.bringForward(roomCanvas.selectedItem);
      showToast('Layer moved forward');
    }
  });

  btnSendBackward.addEventListener('click', () => {
    if (roomCanvas.selectedItem) {
      roomCanvas.sendBackward(roomCanvas.selectedItem);
      showToast('Layer moved backward');
    }
  });

  btnBringToFront.addEventListener('click', () => {
    if (roomCanvas.selectedItem) {
      roomCanvas.bringToFront(roomCanvas.selectedItem);
      showToast('Brought to front');
    }
  });

  btnSendToBack.addEventListener('click', () => {
    if (roomCanvas.selectedItem) {
      roomCanvas.sendToBack(roomCanvas.selectedItem);
      showToast('Sent to back');
    }
  });

  // Duplicate & Remove
  btnDuplicate.addEventListener('click', () => {
    if (roomCanvas.selectedItem) {
      roomCanvas.duplicateSelectedItem();
      showToast('Sprite duplicated');
    }
  });

  btnRemoveSprite.addEventListener('click', () => {
    if (roomCanvas.selectedItem) {
      const name = roomCanvas.selectedItem.name;
      roomCanvas.removeItem(roomCanvas.selectedItem);
      showToast(`Removed "${name}" from canvas`);
    }
  });

  btnDeleteFromLibrary.addEventListener('click', async () => {
    if (!roomCanvas.selectedItem) return;
    const item = roomCanvas.selectedItem;
    const spriteId = item.spriteId;
    const name = item.name;
    const filename = item.filename;

    if (confirm(`Permanently delete "${name}" (${filename}) from the sprite library catalog?`)) {
      await library.deleteSprite(spriteId);
      showToast(`Deleted "${name}" from library`);
    }
  });

  // =========================================================================
  // Background Remover Modal Logic
  // =========================================================================

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  btnOpenBgRemover.addEventListener('click', () => {
    if (roomCanvas.selectedItem) {
      openBgRemover(roomCanvas.selectedItem);
    }
  });

  function openBgRemover(target) {
    if (!target) return;
    activeBgTarget = target;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      activeBgImg = img;
      bgOriginalImg.src = img.src;

      // Auto-detect corner background color
      const cornerColor = BackgroundRemover.getCornerColor(img);
      const hex = rgbToHex(cornerColor.r, cornerColor.g, cornerColor.b);
      bgColorPicker.value = hex;
      bgColorHex.textContent = hex;

      // Reset tolerance default
      bgTolerance.value = 20;
      bgToleranceVal.textContent = '20%';

      updateBgPreview();
      bgRemoverModal.classList.add('is-active');
    };
    img.onerror = () => {
      showToast('Error loading image for background removal');
    };
    img.src = target.src;
  }

  function closeBgModal() {
    bgRemoverModal.classList.remove('is-active');
    activeBgTarget = null;
    activeBgImg = null;
  }

  btnCloseBgModal.addEventListener('click', closeBgModal);
  btnCancelBgModal.addEventListener('click', closeBgModal);
  bgRemoverModal.addEventListener('click', (e) => {
    if (e.target === bgRemoverModal) closeBgModal();
  });

  function updateBgPreview() {
    if (!activeBgImg) return;

    const targetColor = hexToRgb(bgColorPicker.value);
    const tolerance = Number(bgTolerance.value);
    const mode = document.querySelector('input[name="bgMode"]:checked').value;
    const smoothEdges = bgSmoothEdges.checked;

    const processedCanvas = BackgroundRemover.process(activeBgImg, {
      targetColor,
      tolerance,
      mode,
      smoothEdges
    });

    bgResultCanvas.width = processedCanvas.width;
    bgResultCanvas.height = processedCanvas.height;
    const ctx = bgResultCanvas.getContext('2d');
    ctx.clearRect(0, 0, bgResultCanvas.width, bgResultCanvas.height);
    ctx.drawImage(processedCanvas, 0, 0);
  }

  bgTolerance.addEventListener('input', () => {
    bgToleranceVal.textContent = bgTolerance.value + '%';
    updateBgPreview();
  });

  bgColorPicker.addEventListener('input', () => {
    bgColorHex.textContent = bgColorPicker.value;
    updateBgPreview();
  });

  bgModeRadios.forEach(r => r.addEventListener('change', updateBgPreview));
  bgSmoothEdges.addEventListener('change', updateBgPreview);

  // Click on original image to eyedrop background color
  btnEyedropper.addEventListener('click', () => {
    showToast('Click anywhere on the Original Image to sample color');
  });

  bgOriginalImg.addEventListener('click', (e) => {
    if (!activeBgImg) return;
    const rect = bgOriginalImg.getBoundingClientRect();
    const scaleX = (activeBgImg.naturalWidth || activeBgImg.width) / rect.width;
    const scaleY = (activeBgImg.naturalHeight || activeBgImg.height) / rect.height;

    const px = Math.min((activeBgImg.naturalWidth || activeBgImg.width) - 1, Math.max(0, Math.floor((e.clientX - rect.left) * scaleX)));
    const py = Math.min((activeBgImg.naturalHeight || activeBgImg.height) - 1, Math.max(0, Math.floor((e.clientY - rect.top) * scaleY)));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = activeBgImg.naturalWidth || activeBgImg.width;
    tempCanvas.height = activeBgImg.naturalHeight || activeBgImg.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(activeBgImg, 0, 0);
    const pixel = tempCtx.getImageData(px, py, 1, 1).data;

    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    bgColorPicker.value = hex;
    bgColorHex.textContent = hex;
    updateBgPreview();
    showToast(`Sampled color: ${hex}`);
  });

  // Apply Transparent Background to sprite
  btnApplyTransparent.addEventListener('click', () => {
    if (!activeBgTarget || !bgResultCanvas) return;

    const dataUrl = bgResultCanvas.toDataURL('image/png');
    const newImg = new Image();
    newImg.onload = () => {
      const targetId = activeBgTarget.spriteId || activeBgTarget.id;
      library.loadedImages.set(targetId, newImg);

      // Update in Library
      const libSprite = library.sprites.find(s => s.id === targetId || s.filename === activeBgTarget.filename);
      if (libSprite) {
        libSprite.src = dataUrl;
      }

      // Update on Canvas items
      roomCanvas.items.forEach(item => {
        if (item.spriteId === targetId || item === activeBgTarget) {
          item.src = dataUrl;
        }
      });

      if (roomCanvas.selectedItem) {
        inspPreviewImg.src = dataUrl;
      }

      roomCanvas.requestRender();
      renderLibrary();
      closeBgModal();
      showToast('Transparent sprite applied!');
    };
    newImg.src = dataUrl;
  });

  // Download Transparent PNG file
  btnDownloadTransparentPng.addEventListener('click', () => {
    if (!activeBgTarget || !bgResultCanvas) return;
    const base = (activeBgTarget.filename || 'sprite').replace(/\.[^/.]+$/, '');
    const outName = `${base}_transparent.png`;

    const link = document.createElement('a');
    link.download = outName;
    link.href = bgResultCanvas.toDataURL('image/png');
    link.click();
    showToast(`Downloaded "${outName}"`);
  });

  // Save directly to assets/sprites/ on disk
  btnSaveToAssets.addEventListener('click', async () => {
    if (!activeBgTarget || !bgResultCanvas) return;
    const base = (activeBgTarget.filename || 'sprite').replace(/\.[^/.]+$/, '');
    const outName = `${base}_transparent.png`;
    const dataUrl = bgResultCanvas.toDataURL('image/png');

    try {
      const res = await fetch('/api/save-sprite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: outName,
          dataUrl: dataUrl
        })
      });

      if (res.ok) {
        const json = await res.json();
        showToast(`Saved "${outName}" to assets/sprites folder!`);
        // Refresh library to include the new transparent asset
        await library.autoDiscoverAssets();
        renderLibrary();
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      // If server is not active (e.g. static file:// mode), offer direct download
      showToast('Server not reachable. Downloading PNG file instead...');
      const link = document.createElement('a');
      link.download = outName;
      link.href = dataUrl;
      link.click();
    }
  });

  // =========================================================================
  // Toolbar Controls (Grid & Viewport)
  // =========================================================================

  gridSizeInput.addEventListener('change', () => {
    let val = parseInt(gridSizeInput.value, 10);
    if (isNaN(val) || val < 8) val = 8;
    if (val > 256) val = 256;
    gridSizeInput.value = val;
    roomCanvas.grid.size = val;
    roomCanvas.requestRender();
    showToast(`Grid size set to ${val}px`);
  });

  gridTypeSelect.addEventListener('change', () => {
    roomCanvas.grid.type = gridTypeSelect.value;
    roomCanvas.requestRender();
  });

  snapToggle.addEventListener('change', () => {
    roomCanvas.grid.snap = snapToggle.checked;
    showToast(snapToggle.checked ? 'Grid snapping enabled' : 'Grid snapping disabled');
  });

  showGridToggle.addEventListener('change', () => {
    roomCanvas.grid.showGrid = showGridToggle.checked;
    roomCanvas.requestRender();
  });

  btnAutoSort.addEventListener('click', () => {
    roomCanvas.autoSortDepth();
    showToast('Layers depth-sorted');
  });

  btnZoomIn.addEventListener('click', () => {
    roomCanvas.setZoom(roomCanvas.view.scale * 1.2);
    updateZoomDisplay();
  });

  btnZoomOut.addEventListener('click', () => {
    roomCanvas.setZoom(roomCanvas.view.scale / 1.2);
    updateZoomDisplay();
  });

  btnResetView.addEventListener('click', () => {
    roomCanvas.resetZoom();
    updateZoomDisplay();
  });

  function updateZoomDisplay() {
    zoomPercent.textContent = `${Math.round(roomCanvas.view.scale * 100)}%`;
  }

  // Update zoom label on mousewheel
  canvasEl.addEventListener('wheel', () => {
    updateZoomDisplay();
  });

  btnClear.addEventListener('click', () => {
    if (roomCanvas.items.length === 0) return;
    if (confirm('Clear all sprites from canvas?')) {
      roomCanvas.clear();
      showToast('Canvas cleared');
    }
  });

  btnExport.addEventListener('click', () => {
    roomCanvas.exportImage();
  });

  // =========================================================================
  // Sprite Library UI & Interactions
  // =========================================================================

  function renderCategoryTabs() {
    categoryTabs.innerHTML = '';
    library.categories.forEach(cat => {
      const tab = document.createElement('button');
      tab.className = `cat-tab ${library.selectedCategory === cat ? 'active' : ''}`;
      tab.textContent = cat;
      tab.addEventListener('click', () => {
        library.selectedCategory = cat;
        renderCategoryTabs();
        renderLibrary();
      });
      categoryTabs.appendChild(tab);
    });
  }

  function renderLibrary() {
    const sprites = library.getFilteredSprites();
    libraryCount.textContent = `${sprites.length} sprite${sprites.length !== 1 ? 's' : ''}`;
    libraryGrid.innerHTML = '';

    if (sprites.length === 0) {
      libraryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 30px 10px; text-align: center; color: var(--text-dim); font-size: 12px;">
          No sprites found matching filter.
        </div>
      `;
      return;
    }

    sprites.forEach(sprite => {
      const card = document.createElement('div');
      card.className = 'sprite-card';
      card.title = `Click to add or drag to canvas\n${sprite.filename} (${sprite.width}×${sprite.height})`;
      card.draggable = true;

      card.innerHTML = `
        <div class="sprite-thumb-wrap">
          <img class="sprite-thumb" src="${sprite.src}" alt="${sprite.name}" loading="lazy">
        </div>
        <div class="sprite-meta">
          <span class="sprite-name">${sprite.name}</span>
          <span class="sprite-filename">${sprite.filename}</span>
          <span class="sprite-dim-tag">${sprite.width} × ${sprite.height} px</span>
        </div>
        <button class="sprite-del-lib-btn" title="Delete sprite from library catalog">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
        <button class="sprite-wand-btn" title="Remove background & make transparent">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 4V2m0 16v-2m6-6h-2M4 12H2m15.5-5.5l-1.5 1.5M6 18l-1.5 1.5M14 9l-9 9 2 2 9-9z"/>
          </svg>
        </button>
        <div class="sprite-add-overlay" title="Add to Canvas">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      `;

      // Delete from library button click
      const delLibBtn = card.querySelector('.sprite-del-lib-btn');
      delLibBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${sprite.name}" (${sprite.filename}) from the sprite library?`)) {
          await library.deleteSprite(sprite.id);
          showToast(`Deleted "${sprite.name}" from library`);
        }
      });

      // Wand button click to remove background
      const wandBtn = card.querySelector('.sprite-wand-btn');
      wandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openBgRemover(sprite);
      });

      // Click to add to canvas center
      card.addEventListener('click', () => {
        const item = roomCanvas.addItem(sprite);
        showToast(`Added "${sprite.name}" to canvas`);
      });

      // Drag and drop onto canvas
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('application/json', JSON.stringify(sprite));
        e.dataTransfer.effectAllowed = 'copy';
      });

      libraryGrid.appendChild(card);
    });
  }

  spriteSearchInput.addEventListener('input', (e) => {
    library.searchQuery = e.target.value;
    renderLibrary();
  });

  library.onChange(() => {
    renderCategoryTabs();
    renderLibrary();
  });

  // Refresh Library Button
  btnRefreshLibrary.addEventListener('click', async () => {
    btnRefreshLibrary.style.transform = 'rotate(360deg)';
    btnRefreshLibrary.style.transition = 'transform 0.5s ease';
    await library.autoDiscoverAssets();
    await library.preloadAll();
    renderCategoryTabs();
    renderLibrary();
    setTimeout(() => {
      btnRefreshLibrary.style.transform = '';
      btnRefreshLibrary.style.transition = '';
    }, 500);
    showToast(`Library refreshed (${library.sprites.length} sprites)`);
  });

  // Custom Sprite Upload - File & Folder Pickers
  uploadDropzone.addEventListener('click', () => {
    spriteFileInput.click();
  });

  btnPickFiles.addEventListener('click', (e) => {
    e.stopPropagation();
    spriteFileInput.click();
  });

  btnPickFolder.addEventListener('click', (e) => {
    e.stopPropagation();
    folderFileInput.click();
  });

  folderFileInput.addEventListener('change', async (e) => {
    const count = await library.loadFolderFiles(e.target.files);
    showToast(`Loaded ${count} sprites from folder`);
    folderFileInput.value = '';
  });

  spriteFileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const newSprite = await library.addCustomSprite(file);
        showToast(`Added "${newSprite.filename}"`);
      } catch (err) {
        console.error(err);
        showToast('Error reading uploaded image file');
      }
    }
    spriteFileInput.value = '';
  });

  uploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadDropzone.classList.add('drag-active');
  });

  uploadDropzone.addEventListener('dragleave', () => {
    uploadDropzone.classList.remove('drag-active');
  });

  uploadDropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadDropzone.classList.remove('drag-active');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    for (const file of files) {
      try {
        const newSprite = await library.addCustomSprite(file);
        showToast(`Uploaded "${newSprite.filename}"`);
      } catch (err) {
        console.error(err);
      }
    }
  });

  // =========================================================================
  // Starter Scene Setup
  // =========================================================================

  function createStarterRoom(lib, canvas) {
    const woodFloor = lib.sprites.find(s => s.id === 'floor_wood');
    const carpet = lib.sprites.find(s => s.id === 'floor_carpet');
    const wallL = lib.sprites.find(s => s.id === 'wall_left');
    const wallR = lib.sprites.find(s => s.id === 'wall_right');
    const sofa = lib.sprites.find(s => s.id === 'sofa_isometric');
    const table = lib.sprites.find(s => s.id === 'table_isometric');
    const plant = lib.sprites.find(s => s.id === 'indoor_plant');
    const lamp = lib.sprites.find(s => s.id === 'floor_lamp');

    if (!woodFloor || !wallL || !wallR || !sofa) return;

    // Floor grid (3x3 tiles)
    const originX = 0;
    const originY = 60;
    const tileW = 128;
    const tileH = 64;

    // Place back walls
    canvas.items.push({
      id: 'init_wall_left',
      spriteId: wallL.id,
      name: wallL.name,
      filename: wallL.filename,
      src: wallL.src,
      origWidth: wallL.width,
      origHeight: wallL.height,
      aspectRatio: wallL.width / wallL.height,
      x: originX - 128,
      y: originY - 112,
      width: wallL.width,
      height: wallL.height,
      zIndex: 1
    });

    canvas.items.push({
      id: 'init_wall_right',
      spriteId: wallR.id,
      name: wallR.name,
      filename: wallR.filename,
      src: wallR.src,
      origWidth: wallR.width,
      origHeight: wallR.height,
      aspectRatio: wallR.width / wallR.height,
      x: originX,
      y: originY - 112,
      width: wallR.width,
      height: wallR.height,
      zIndex: 2
    });

    // Floor tiles in isometric diamond lattice
    const floorCoords = [
      { u: 0, v: 0 },
      { u: 1, v: 0 },
      { u: 2, v: 0 },
      { u: 0, v: 1 },
      { u: 1, v: 1, isCarpet: true },
      { u: 2, v: 1 },
      { u: 0, v: 2 },
      { u: 1, v: 2 },
      { u: 2, v: 2 }
    ];

    floorCoords.forEach((coord, i) => {
      // Iso math: x = (u - v) * (tileW / 2), y = (u + v) * (tileH / 2)
      const px = originX + (coord.u - coord.v) * (tileW / 2) - tileW / 2;
      const py = originY + (coord.u + coord.v) * (tileH / 2);
      const sprite = coord.isCarpet ? carpet : woodFloor;

      canvas.items.push({
        id: 'init_floor_' + i,
        spriteId: sprite.id,
        name: sprite.name,
        filename: sprite.filename,
        src: sprite.src,
        origWidth: sprite.width,
        origHeight: sprite.height,
        aspectRatio: sprite.width / sprite.height,
        x: px,
        y: py,
        width: sprite.width,
        height: sprite.height,
        zIndex: 5 + i
      });
    });

    // Place Furniture
    if (sofa) {
      canvas.items.push({
        id: 'init_sofa',
        spriteId: sofa.id,
        name: sofa.name,
        filename: sofa.filename,
        src: sofa.src,
        origWidth: sofa.width,
        origHeight: sofa.height,
        aspectRatio: sofa.width / sofa.height,
        x: originX - 60,
        y: originY + 20,
        width: sofa.width,
        height: sofa.height,
        zIndex: 20
      });
    }

    if (table) {
      canvas.items.push({
        id: 'init_table',
        spriteId: table.id,
        name: table.name,
        filename: table.filename,
        src: table.src,
        origWidth: table.width,
        origHeight: table.height,
        aspectRatio: table.width / table.height,
        x: originX - 60,
        y: originY + 70,
        width: table.width,
        height: table.height,
        zIndex: 25
      });
    }

    if (plant) {
      canvas.items.push({
        id: 'init_plant',
        spriteId: plant.id,
        name: plant.name,
        filename: plant.filename,
        src: plant.src,
        origWidth: plant.width,
        origHeight: plant.height,
        aspectRatio: plant.width / plant.height,
        x: originX + 70,
        y: originY + 10,
        width: plant.width,
        height: plant.height,
        zIndex: 22
      });
    }

    if (lamp) {
      canvas.items.push({
        id: 'init_lamp',
        spriteId: lamp.id,
        name: lamp.name,
        filename: lamp.filename,
        src: lamp.src,
        origWidth: lamp.width,
        origHeight: lamp.height,
        aspectRatio: lamp.width / lamp.height,
        x: originX - 110,
        y: originY - 10,
        width: lamp.width,
        height: lamp.height,
        zIndex: 21
      });
    }

    // Auto sort initial z-orders & select the sofa to demonstrate the inspector
    canvas.autoSortDepth();
    const starterSofa = canvas.items.find(i => i.id === 'init_sofa');
    if (starterSofa) {
      canvas.selectItem(starterSofa);
    }
  }
});

