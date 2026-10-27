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

  // DOM Elements - Layout Management (Toolbar)
  const layoutSelect = document.getElementById('layoutSelect');
  const btnSaveLayout = document.getElementById('btnSaveLayout');
  const btnSaveAsLayout = document.getElementById('btnSaveAsLayout');
  const btnRenameActiveLayout = document.getElementById('btnRenameActiveLayout');
  const btnManageLayouts = document.getElementById('btnManageLayouts');

  // DOM Elements - Layout Manager Modal
  const layoutManagerModal = document.getElementById('layoutManagerModal');
  const btnCloseLayoutModal = document.getElementById('btnCloseLayoutModal');
  const btnCloseLayoutModalFooter = document.getElementById('btnCloseLayoutModalFooter');
  const btnModalNewBlank = document.getElementById('btnModalNewBlank');
  const btnModalSaveCurrentAs = document.getElementById('btnModalSaveCurrentAs');
  const layoutImportInput = document.getElementById('layoutImportInput');
  const btnModalExportAll = document.getElementById('btnModalExportAll');
  const layoutCardsList = document.getElementById('layoutCardsList');
  const layoutModalCount = document.getElementById('layoutModalCount');

  // DOM Elements - Layout Prompt Modal (Name / Rename)
  const layoutPromptModal = document.getElementById('layoutPromptModal');
  const layoutPromptTitle = document.getElementById('layoutPromptTitle');
  const layoutPromptLabel = document.getElementById('layoutPromptLabel');
  const layoutPromptInput = document.getElementById('layoutPromptInput');
  const layoutPromptHint = document.getElementById('layoutPromptHint');
  const btnCancelLayoutPrompt = document.getElementById('btnCancelLayoutPrompt');
  const btnCloseLayoutPrompt = document.getElementById('btnCloseLayoutPrompt');
  const btnConfirmLayoutPrompt = document.getElementById('btnConfirmLayoutPrompt');
  const layoutPromptForm = document.getElementById('layoutPromptForm');

  // DOM Elements - Layout Delete Confirmation Modal
  const layoutConfirmModal = document.getElementById('layoutConfirmModal');
  const btnCloseLayoutConfirm = document.getElementById('btnCloseLayoutConfirm');
  const btnCancelLayoutConfirm = document.getElementById('btnCancelLayoutConfirm');
  const btnConfirmLayoutDelete = document.getElementById('btnConfirmLayoutDelete');
  const layoutConfirmMessage = document.getElementById('layoutConfirmMessage');

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

  // Initialize Layout Manager
  let layoutManager = null;
  try {
    layoutManager = typeof LayoutManager !== 'undefined' ? new LayoutManager() : null;
    const storedLayouts = localStorage.getItem('isoroom_saved_layouts_v1');
    if (!storedLayouts) {
      createStarterRoom(library, roomCanvas);
    }
    if (layoutManager) {
      const activeLayout = await layoutManager.init(roomCanvas.getLayoutData());
      if (activeLayout && activeLayout.items && activeLayout.items.length > 0) {
        roomCanvas.loadLayoutData(activeLayout);
        if (activeLayout.gridSize) {
          gridSizeInput.value = activeLayout.gridSize;
          roomCanvas.setGridSize(activeLayout.gridSize);
        }
        if (activeLayout.gridType) {
          gridTypeSelect.value = activeLayout.gridType;
          roomCanvas.setGridType(activeLayout.gridType);
        }
      }
    }
  } catch (err) {
    console.error('LayoutManager initialization error:', err);
    createStarterRoom(library, roomCanvas);
  }

  renderPlacedList();
  if (typeof populateLayoutSelect === 'function') {
    populateLayoutSelect();
  }

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
  // Sidebar Resizing Splitter
  // =========================================================================
  const sidebarEl = document.getElementById('sidebarLibrary') || document.querySelector('.sidebar-library');
  const resizerEl = document.getElementById('sidebarResizer');

  if (sidebarEl && resizerEl) {
    const MIN_SIDEBAR_WIDTH = 270;
    const DEFAULT_SIDEBAR_WIDTH = 340;
    const STORAGE_KEY = 'isoroom_sidebar_width';

    const setSidebarWidth = (width, save = false) => {
      sidebarEl.style.width = `${width}px`;
      document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
      if (save) {
        try {
          localStorage.setItem(STORAGE_KEY, width.toString());
        } catch (e) {}
      }
      if (roomCanvas) {
        roomCanvas.initCanvasSize();
        roomCanvas.requestRender();
      }
    };

    // Restore saved width from localStorage
    try {
      const savedWidth = localStorage.getItem(STORAGE_KEY);
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH) {
          setSidebarWidth(parsed, false);
        } else {
          setSidebarWidth(DEFAULT_SIDEBAR_WIDTH, false);
        }
      } else {
        setSidebarWidth(DEFAULT_SIDEBAR_WIDTH, false);
      }
    } catch (e) {
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH, false);
    }

    let isResizingSidebar = false;
    let resizeStartX = 0;
    let resizeStartWidth = 0;

    const onStartResize = (clientX) => {
      isResizingSidebar = true;
      resizeStartX = clientX;
      resizeStartWidth = sidebarEl.getBoundingClientRect().width;
      document.body.classList.add('resizing-sidebar');
      resizerEl.classList.add('is-resizing');
    };

    const onMoveResize = (clientX) => {
      if (!isResizingSidebar) return;
      const deltaX = clientX - resizeStartX;
      const maxAllowed = Math.max(MIN_SIDEBAR_WIDTH, Math.floor(window.innerWidth - 300));
      const targetWidth = Math.min(maxAllowed, Math.max(MIN_SIDEBAR_WIDTH, resizeStartWidth + deltaX));
      setSidebarWidth(targetWidth, false);
    };

    const onEndResize = () => {
      if (!isResizingSidebar) return;
      isResizingSidebar = false;
      document.body.classList.remove('resizing-sidebar');
      resizerEl.classList.remove('is-resizing');
      const finalWidth = Math.round(sidebarEl.getBoundingClientRect().width);
      setSidebarWidth(finalWidth, true);
    };

    // Mouse events
    resizerEl.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      onStartResize(e.clientX);

      const onMouseMove = (ev) => onMoveResize(ev.clientX);
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        onEndResize();
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // Touch events for touchscreens / tablets
    resizerEl.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      onStartResize(e.touches[0].clientX);

      const onTouchMove = (ev) => {
        if (ev.touches.length === 1) {
          ev.preventDefault();
          onMoveResize(ev.touches[0].clientX);
        }
      };
      const onTouchEnd = () => {
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        onEndResize();
      };
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }, { passive: true });

    // Double-click to reset to default comfortable 340px width
    resizerEl.addEventListener('dblclick', () => {
      setSidebarWidth(DEFAULT_SIDEBAR_WIDTH, true);
      showToast('Sidebar width reset to default (340px)');
    });

    // Keyboard accessibility: Left / Right arrow keys on focused resizer
    resizerEl.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 32 : 16;
      const currentWidth = sidebarEl.getBoundingClientRect().width;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const maxAllowed = Math.max(MIN_SIDEBAR_WIDTH, Math.floor(window.innerWidth - 300));
        const newWidth = Math.min(maxAllowed, Math.max(MIN_SIDEBAR_WIDTH, currentWidth - step));
        setSidebarWidth(newWidth, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const maxAllowed = Math.max(MIN_SIDEBAR_WIDTH, Math.floor(window.innerWidth - 300));
        const newWidth = Math.min(maxAllowed, Math.max(MIN_SIDEBAR_WIDTH, currentWidth + step));
        setSidebarWidth(newWidth, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setSidebarWidth(MIN_SIDEBAR_WIDTH, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        setSidebarWidth(DEFAULT_SIDEBAR_WIDTH, true);
      }
    });
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
    if (!hex) return { r: 255, g: 255, b: 255 };
    hex = String(hex).replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const num = parseInt(hex, 16);
    if (isNaN(num)) return { r: 255, g: 255, b: 255 };
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

    // Check if the image is already loaded in memory
    const targetId = target.spriteId || target.id;
    let existingImg = library ? library.getImage(targetId) : null;

    function onImageReady(img) {
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
    }

    if (existingImg && existingImg.complete && (existingImg.naturalWidth || existingImg.width) > 0) {
      onImageReady(existingImg);
    } else {
      const src = target.src || (target.filename ? `assets/${target.filename}` : '');
      if (!src) {
        showToast('Image source not found');
        return;
      }

      const img = new Image();
      // Only set crossOrigin for external http(s) URLs pointing to a foreign origin
      if (src.startsWith('http') && typeof window !== 'undefined' && window.location && !src.startsWith(window.location.origin)) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => onImageReady(img);
      img.onerror = () => {
        // Fallback retry without crossOrigin in case CORS header was rejected
        if (img.crossOrigin) {
          const fallback = new Image();
          fallback.onload = () => onImageReady(fallback);
          fallback.onerror = () => showToast('Error loading image for background removal');
          fallback.src = src;
        } else {
          showToast('Error loading image for background removal');
        }
      };
      img.src = src;
    }
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

    try {
      const targetColor = hexToRgb(bgColorPicker.value);
      const tolerance = Number(bgTolerance.value) || 20;
      const modeRadio = document.querySelector('input[name="bgMode"]:checked');
      const mode = modeRadio ? modeRadio.value : 'contiguous';
      const smoothEdges = bgSmoothEdges.checked;

      const processedCanvas = BackgroundRemover.process(activeBgImg, {
        targetColor,
        tolerance,
        mode,
        smoothEdges
      });

      bgResultCanvas.width = processedCanvas.width || (activeBgImg.naturalWidth || activeBgImg.width) || 64;
      bgResultCanvas.height = processedCanvas.height || (activeBgImg.naturalHeight || activeBgImg.height) || 64;
      const ctx = bgResultCanvas.getContext('2d');
      ctx.clearRect(0, 0, bgResultCanvas.width, bgResultCanvas.height);
      ctx.drawImage(processedCanvas, 0, 0);
    } catch (err) {
      console.error('Error updating background removal preview:', err);
    }
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
    if (!rect.width || !rect.height) return;

    const natW = activeBgImg.naturalWidth || activeBgImg.width || 1;
    const natH = activeBgImg.naturalHeight || activeBgImg.height || 1;
    const scaleX = natW / rect.width;
    const scaleY = natH / rect.height;

    const px = Math.min(natW - 1, Math.max(0, Math.floor((e.clientX - rect.left) * scaleX)));
    const py = Math.min(natH - 1, Math.max(0, Math.floor((e.clientY - rect.top) * scaleY)));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = natW;
    tempCanvas.height = natH;
    const tempCtx = tempCanvas.getContext('2d');
    try {
      tempCtx.drawImage(activeBgImg, 0, 0);
      const pixel = tempCtx.getImageData(px, py, 1, 1).data;

      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      bgColorPicker.value = hex;
      bgColorHex.textContent = hex;
      updateBgPreview();
      showToast(`Sampled color: ${hex}`);
    } catch (err) {
      console.error('Could not sample pixel color:', err);
    }
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
  // Room Layout Management (Save, Name, Rename, Delete, Switch, Export/Import)
  // =========================================================================

  let currentPromptAction = null;
  let currentConfirmAction = null;

  function timeAgo(ts) {
    if (!ts) return 'Unknown';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }

  // Populate the toolbar layout selector dropdown
  function populateLayoutSelect() {
    if (!layoutSelect || !layoutManager) return;
    const all = layoutManager.getAll();
    const activeId = layoutManager.getActiveId();

    layoutSelect.innerHTML = '';
    all.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      const count = l.items ? l.items.length : 0;
      opt.textContent = `${l.name} (${count} item${count !== 1 ? 's' : ''})`;
      if (l.id === activeId) opt.selected = true;
      layoutSelect.appendChild(opt);
    });
  }

  // Switch layout when dropdown option changes
  layoutSelect.addEventListener('change', (e) => {
    if (!layoutManager) return;
    const targetId = e.target.value;
    if (targetId && layoutManager.setActiveId(targetId)) {
      const active = layoutManager.getActive();
      if (active) {
        roomCanvas.loadLayoutData(active);
        if (active.gridSize) {
          gridSizeInput.value = active.gridSize;
          roomCanvas.setGridSize(active.gridSize);
        }
        if (active.gridType) {
          gridTypeSelect.value = active.gridType;
          roomCanvas.setGridType(active.gridType);
        }
        showToast(`Loaded layout: "${active.name}"`);
      }
    }
  });

  // Quick Save Button (Ctrl+S)
  function saveCurrentLayout() {
    if (!layoutManager) return;
    const saved = layoutManager.saveActive(roomCanvas.getLayoutData());
    if (saved) {
      showToast(`Saved layout: "${saved.name}"`);
      populateLayoutSelect();
    }
  }

  btnSaveLayout.addEventListener('click', saveCurrentLayout);

  // Keyboard shortcut Ctrl+S / Cmd+S to save layout
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveCurrentLayout();
    }
  });

  // Save As New Layout (from toolbar)
  btnSaveAsLayout.addEventListener('click', () => {
    if (!layoutManager) return;
    const active = layoutManager.getActive();
    const defaultName = active ? `${active.name} (Copy)` : 'My New Room';
    openPromptModal({
      title: 'Save Layout As...',
      label: 'New Layout Name:',
      hint: 'Enter a name to save current canvas as a new layout.',
      initialValue: defaultName,
      confirmText: 'Save New Layout',
      onConfirm: (name) => {
        const created = layoutManager.saveAsNew(name, roomCanvas.getLayoutData());
        populateLayoutSelect();
        showToast(`Saved as new layout: "${created.name}"`);
      }
    });
  });

  // Rename Active Layout Button (Pencil in toolbar)
  btnRenameActiveLayout.addEventListener('click', () => {
    if (!layoutManager) return;
    const active = layoutManager.getActive();
    if (!active) return;
    openPromptModal({
      title: 'Rename Layout',
      label: 'Layout Name:',
      hint: 'Enter a new name for this room layout.',
      initialValue: active.name,
      confirmText: 'Rename',
      onConfirm: (newName) => {
        layoutManager.rename(active.id, newName);
        populateLayoutSelect();
        showToast(`Renamed layout to "${newName}"`);
      }
    });
  });

  // Open Full Layouts Manager Modal
  btnManageLayouts.addEventListener('click', () => {
    openLayoutManagerModal();
  });

  function openLayoutManagerModal() {
    renderLayoutCards();
    layoutManagerModal.classList.add('is-active');
  }

  function closeLayoutManagerModal() {
    layoutManagerModal.classList.remove('is-active');
  }

  btnCloseLayoutModal.addEventListener('click', closeLayoutManagerModal);
  btnCloseLayoutModalFooter.addEventListener('click', closeLayoutManagerModal);

  // New Blank Room (from modal)
  btnModalNewBlank.addEventListener('click', () => {
    openPromptModal({
      title: 'Create Blank Room',
      label: 'Room Name:',
      hint: 'Enter a name for your fresh new empty room canvas.',
      initialValue: 'Untitled Room',
      confirmText: 'Create Room',
      onConfirm: (name) => {
        roomCanvas.clear();
        const created = layoutManager.saveAsNew(name, roomCanvas.getLayoutData());
        populateLayoutSelect();
        closeLayoutManagerModal();
        showToast(`Created blank room: "${created.name}"`);
      }
    });
  });

  // Save Canvas As New (from modal)
  btnModalSaveCurrentAs.addEventListener('click', () => {
    const active = layoutManager.getActive();
    const defaultName = active ? `${active.name} (Copy)` : 'My Room';
    openPromptModal({
      title: 'Save Canvas As New Layout',
      label: 'Layout Name:',
      hint: 'Save the current canvas sprites into a new layout slot.',
      initialValue: defaultName,
      confirmText: 'Save Layout',
      onConfirm: (name) => {
        const created = layoutManager.saveAsNew(name, roomCanvas.getLayoutData());
        populateLayoutSelect();
        renderLayoutCards();
        showToast(`Saved as "${created.name}"`);
      }
    });
  });

  // Export all layouts as backup JSON
  btnModalExportAll.addEventListener('click', () => {
    layoutManager.exportAllJson();
    showToast('Exported all layouts as JSON backup');
  });

  // Import layout(s) from JSON file
  layoutImportInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const count = layoutManager.importJson(evt.target.result);
        const active = layoutManager.getActive();
        if (active) {
          roomCanvas.loadLayoutData(active);
        }
        populateLayoutSelect();
        renderLayoutCards();
        showToast(`Successfully imported ${count} layout${count !== 1 ? 's' : ''}!`);
      } catch (err) {
        showToast(`Import error: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // Render the list of layout cards in the Manager Modal
  function renderLayoutCards() {
    const all = layoutManager.getAll();
    const activeId = layoutManager.getActiveId();
    layoutModalCount.textContent = `${all.length} saved layout${all.length !== 1 ? 's' : ''}`;
    layoutCardsList.innerHTML = '';

    if (all.length === 0) {
      layoutCardsList.innerHTML = `
        <div class="layout-empty-notice">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <div style="font-weight: 600;">No saved layouts found.</div>
          <div style="font-size: 12px; margin-top: 4px;">Click "+ New Blank Room" or "Save Canvas As New" above!</div>
        </div>
      `;
      return;
    }

    all.forEach(layout => {
      const isActive = layout.id === activeId;
      const count = layout.items ? layout.items.length : 0;
      const card = document.createElement('div');
      card.className = `layout-card ${isActive ? 'is-active' : ''}`;

      card.innerHTML = `
        <div class="layout-card-info">
          <div class="layout-card-title">
            <span>${escapeHtml(layout.name)}</span>
            ${isActive ? '<span class="layout-badge-active">Active</span>' : ''}
          </div>
          <div class="layout-card-meta">
            <span>${count} sprite${count !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Grid: ${layout.gridSize || 64}px (${layout.gridType || 'isometric'})</span>
            <span>•</span>
            <span>Saved ${timeAgo(layout.updatedAt)}</span>
          </div>
        </div>

        <div class="layout-card-actions">
          ${!isActive ? `
            <button class="btn btn-sm btn-primary btn-action-load" data-id="${layout.id}" title="Open this layout on canvas">
              Load
            </button>
          ` : `
            <button class="btn btn-sm btn-action-save" data-id="${layout.id}" title="Overwrite active layout with current canvas">
              Save
            </button>
          `}
          <button class="btn btn-sm btn-icon-only btn-action-rename" data-id="${layout.id}" title="Rename layout">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-icon-only btn-action-duplicate" data-id="${layout.id}" title="Duplicate layout">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-icon-only btn-action-export" data-id="${layout.id}" title="Download layout as JSON">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button class="btn btn-sm btn-icon-only btn-danger btn-action-delete" data-id="${layout.id}" title="Delete layout">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      `;

      layoutCardsList.appendChild(card);
    });
  }

  // Delegated event handling for layout cards
  layoutCardsList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const id = btn.getAttribute('data-id');
    const layout = layoutManager.get(id);
    if (!layout) return;

    // 1. Load layout
    if (btn.classList.contains('btn-action-load')) {
      layoutManager.setActiveId(id);
      roomCanvas.loadLayoutData(layout);
      if (layout.gridSize) {
        gridSizeInput.value = layout.gridSize;
        roomCanvas.setGridSize(layout.gridSize);
      }
      if (layout.gridType) {
        gridTypeSelect.value = layout.gridType;
        roomCanvas.setGridType(layout.gridType);
      }
      populateLayoutSelect();
      renderLayoutCards();
      showToast(`Loaded layout: "${layout.name}"`);
      return;
    }

    // 2. Overwrite / Save to active layout
    if (btn.classList.contains('btn-action-save')) {
      layoutManager.saveActive(roomCanvas.getLayoutData());
      populateLayoutSelect();
      renderLayoutCards();
      showToast(`Saved changes to "${layout.name}"`);
      return;
    }

    // 3. Rename layout
    if (btn.classList.contains('btn-action-rename')) {
      openPromptModal({
        title: 'Rename Layout',
        label: 'Layout Name:',
        hint: 'Enter a new name for this room layout.',
        initialValue: layout.name,
        confirmText: 'Rename',
        onConfirm: (newName) => {
          layoutManager.rename(id, newName);
          populateLayoutSelect();
          renderLayoutCards();
          showToast(`Renamed layout to "${newName}"`);
        }
      });
      return;
    }

    // 4. Duplicate layout
    if (btn.classList.contains('btn-action-duplicate')) {
      const clone = layoutManager.duplicate(id);
      roomCanvas.loadLayoutData(clone);
      populateLayoutSelect();
      renderLayoutCards();
      showToast(`Duplicated to "${clone.name}"`);
      return;
    }

    // 5. Export single layout
    if (btn.classList.contains('btn-action-export')) {
      layoutManager.exportJson(id);
      showToast(`Exported "${layout.name}" to JSON`);
      return;
    }

    // 6. Delete layout
    if (btn.classList.contains('btn-action-delete')) {
      openConfirmModal({
        message: `Are you sure you want to delete layout <strong>"${escapeHtml(layout.name)}"</strong>?<br><br>This layout and all its placed sprite positions will be removed.`,
        confirmText: 'Delete Layout',
        onConfirm: () => {
          const wasActive = layoutManager.getActiveId() === id;
          layoutManager.delete(id);
          if (wasActive) {
            const newActive = layoutManager.getActive();
            if (newActive) roomCanvas.loadLayoutData(newActive);
          }
          populateLayoutSelect();
          renderLayoutCards();
          showToast(`Deleted layout: "${layout.name}"`);
        }
      });
      return;
    }
  });

  // Prompt Modal Handlers (Naming / Renaming)
  function openPromptModal({ title, label, hint, initialValue, confirmText, onConfirm }) {
    layoutPromptTitle.textContent = title || 'Enter Name';
    layoutPromptLabel.textContent = label || 'Name:';
    layoutPromptHint.textContent = hint || '';
    layoutPromptInput.value = initialValue || '';
    btnConfirmLayoutPrompt.textContent = confirmText || 'Confirm';
    currentPromptAction = onConfirm;

    layoutPromptModal.classList.add('is-active');
    setTimeout(() => {
      layoutPromptInput.focus();
      layoutPromptInput.select();
    }, 50);
  }

  function closePromptModal() {
    layoutPromptModal.classList.remove('is-active');
    currentPromptAction = null;
  }

  btnCancelLayoutPrompt.addEventListener('click', closePromptModal);
  btnCloseLayoutPrompt.addEventListener('click', closePromptModal);

  function submitPromptForm(e) {
    if (e) e.preventDefault();
    const val = layoutPromptInput.value.trim();
    if (!val) {
      layoutPromptInput.focus();
      return;
    }
    const action = currentPromptAction;
    closePromptModal();
    if (typeof action === 'function') {
      action(val);
    }
  }

  layoutPromptForm.addEventListener('submit', submitPromptForm);
  btnConfirmLayoutPrompt.addEventListener('click', submitPromptForm);

  // Delete Confirmation Modal Handlers
  function openConfirmModal({ message, confirmText, onConfirm }) {
    layoutConfirmMessage.innerHTML = message || 'Are you sure?';
    btnConfirmLayoutDelete.textContent = confirmText || 'Delete';
    currentConfirmAction = onConfirm;
    layoutConfirmModal.classList.add('is-active');
  }

  function closeConfirmModal() {
    layoutConfirmModal.classList.remove('is-active');
    currentConfirmAction = null;
  }

  btnCancelLayoutConfirm.addEventListener('click', closeConfirmModal);
  btnCloseLayoutConfirm.addEventListener('click', closeConfirmModal);

  btnConfirmLayoutDelete.addEventListener('click', () => {
    const action = currentConfirmAction;
    closeConfirmModal();
    if (typeof action === 'function') {
      action();
    }
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

