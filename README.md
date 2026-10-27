# Isometric Room Designer (IsoRoom Studio)

A lightweight, responsive web application for creating isometric room scenes using isometric sprite graphics. Built with vanilla HTML5, CSS3, and modern JavaScript.

## Features

- **Sprite Library & Browser**:
  - Over 40 built-in isometric sprites across 6 categories:
    - **Tileable Flooring**: Light Wood, Dark Walnut, Carrara Marble, Checkerboard, Japanese Tatami, Terracotta, Lush Grass, Stone, and Cyberpunk Neon Grid.
    - **Rugs & Carpets**: Ornate Persian Rug, Round Boho Jute Rug, Scandinavian Geometric Runner.
    - **Tables & Desks**: Solid Oak Dining Table, Glass Round Coffee Table, Bedside Nightstand, Dual-Monitor Gaming Battlestation, Workstation Desk.
    - **Chairs & Seating**: Mid-Century Wooden Dining Chair, Ergonomic Mesh Swivel Office Chair, Vintage Leather Lounge Chair, Tall Bar Stool, Blue Sofa, Armchair.
    - **Storage**: Mid-Century 3-Drawer Dresser, Tall Double-Door Wardrobe with Mirror, Bookshelves.
    - **Lighting & Decor**: Potted Monstera Deliciosa, Stack of Hardcover Books with Coffee Mug, Articulated Desk Anglepoise Lamp, Industrial Edison Pendant Light, Floor Lamp.
  - Search/filter sprites by name or tag.
  - Category tabs (`All`, `Floors`, `Walls`, `Furniture`, `Storage`, `Decor`, `Lighting`, `Custom`).
  - **Click to Add** or **Drag-and-Drop** directly onto the canvas workspace.
  - **Upload Custom Sprites**: Drag & drop or pick image files (PNG, SVG, JPG, WebP) directly into the library.
  - **Delete Sprite from Library (New)**: Delete unwanted or uploaded sprites directly from the catalog using the 🗑 trash icon on any sprite card or via the Inspector panel. Deletes from disk when running `server.py` and updates manifests.

- **Dual-Tab Sidebar (Library & Placed Assets Outliner)**:
  - **📦 Sprite Library Tab**: Browse catalog, search, filter by category, drag/click to place, and upload custom sprites.
  - **📋 Placed Assets Tab**:
    - **In Current View Filter**: Toggle between "All Placed" and "In View" to see only assets inside your current screen viewport.
    - **Interactive List**: Displays thumbnail, sprite name, dimensions, canvas coordinates, and layer depth.
    - **Click to Select**: Selecting an item highlights it on canvas and opens its details in the right-side Inspector.
    - **Hover Highlight**: Hovering over an item draws a cyan preview outline on the canvas.
    - **👁 Visibility Toggle**: Hide or show individual sprites on the canvas (useful when arranging rugs or tiles underneath furniture).
    - **🎯 Focus / Center (Target)**: Click to smoothly center the camera viewport directly onto that asset.
    - **🗑 Quick Delete**: Remove an item from the canvas directly from the list.
    - **Depth Sort**: Re-order placed assets based on isometric depth.

- **Grid Locking & Configurable Grid Size**:
  - Grid size input (pixels) to change the snap step size (e.g. 16, 32, 64, 128px).
  - Isometric diamond grid snapping matching the 2:1 projection of the isometric sprites.
  - Toggle between **Isometric (Diamond)** and **Orthogonal (Square)** grids.
  - Snapping toggle (ON/OFF) and visual grid lines toggle (Show/Hide).

- **Selection & Draggable Points for Resizing**:
  - Click any sprite on canvas to select it.
  - Clicking empty canvas deselects the current sprite.
  - **Draggable corner points (handles)** only show when a sprite is selected.
  - Dragging any corner handle resizes the sprite while **strictly preserving its aspect ratio**.
  - A real-time dimension badge appears above the sprite during selection and resize.

- **Slide-out Inspector Panel**:
  - Smoothly slides in from the right edge when a sprite is selected; slides out / hides when deselected.
  - Displays the sprite's **filename** and **original dimensions** (e.g. `130 × 110 px`).
  - **🪄 Remove Background Button**: Open the Background Removal modal directly for any selected sprite.
  - Allows manual resize by entering **Width** and **Height** in pixels.
  - Aspect ratio lock toggle (calculates height automatically as you type width).
  - Quick scale presets: **50%**, **75%**, **100%**, **150%**, **200%**.
  - **Set Dimensions** button applies the new dimensions immediately to the canvas.
  - **Remove Sprite** button removes the sprite from the canvas.
  - Layer ordering controls: **Bring Forward**, **Send Backward**, **Bring to Front**, **Send to Back**.
  - **Duplicate Sprite** button to quickly clone tiles or furniture.

- **Background Removal & Transparency Tool (New)**:
  - **Sensible Access Points**: Accessible both from the **Slide-out Inspector Panel** ("Remove Background" button) and from each sprite card in the **Library Grid** (magic wand icon 🪄).
  - **Contiguous Flood-Fill (Edges Only)**: Automatically removes background only from the outer borders inward so white or light colors inside the sprite (e.g. book pages, highlights) are preserved.
  - **Auto-Detection & Eyedropper**: Automatically detects the corner background color, or click anywhere on the image to sample the exact background shade.
  - **Adjustable Tolerance Slider**: Removes JPEG compression artifacts and near-white fringes.
  - **Smooth Edges / Anti-Aliasing**: Feathers boundaries to eliminate jagged white halos.
  - **Three Save Options**:
    - **Apply to Sprite**: Updates the sprite on the room canvas and in your library instantly.
    - **Download PNG**: Saves `<name>_transparent.png` directly to your computer.
    - **Save to Assets**: Automatically writes the transparent PNG directly into `assets/sprites/` on disk (when running `server.py`).

- **Room Layout Management (Save, Name, Rename, Delete)**:
  - **Quick Save (Ctrl+S / Cmd+S)**: Instantly saves canvas changes to the active layout.
  - **Named Layouts**: Save layouts under custom names (e.g. "Cozy Living Room", "Modern Office", "Isometric Bedroom").
  - **Rename**: Quick-rename directly via the ✏️ pencil icon in the toolbar or in the Manage dialog.
  - **Delete**: Remove obsolete layouts with safety confirmation (🗑️).
  - **Switch Layouts**: Instant switching between rooms via the toolbar dropdown or Manage list.
  - **Duplicate & Backup**: Clone layouts with one click; import and export layouts as `.json` files.
  - **Zero-Friction Persistence**: Automatically saves to browser `localStorage` and synchronizes to server (`/api/save-layout`, `/api/delete-layout`) on Python or PHP + Nginx.

- **Isometric Depth Sorting**:
  - "Depth Sort" button orders items based on their isometric Y coordinate so sprites in front naturally occlude objects behind them.

- **Viewport Controls**:
  - **Space + Drag**: Hold `Space` and drag with the left mouse button (cursor turns to a grab hand).
  - **Right-Click Drag**: Drag with the right mouse button to pan directly without holding any keys.
  - **Middle-Click Drag**: Click and hold the mouse wheel to pan.
  - **Pan Tool (H)**: Click the "Pan" button in the toolbar to pan with normal left-click drag anywhere; switch back with "Select" (V).
  - **Zoom**: Mouse wheel or Zoom `+` / `-` buttons.
  - **Export**: One-click "Export PNG" to save your created room as an image.

## Getting Started

### Option 1: Running with PHP + Nginx (Production / Staging)
A complete drop-in PHP backend (`api.php`) and configuration sample (`nginx.conf.example`) are included.
1. Place the project files in your web root (e.g. `/var/www/isoroom`).
2. Ensure the web server has write permission to `assets/`:
   ```bash
   sudo chown -R www-data:www-data /var/www/isoroom/assets
   sudo chmod -R 775 /var/www/isoroom/assets
   ```
3. Copy or adapt [nginx.conf.example](file:///home/user/Documents/image-layout/nginx.conf.example) to your Nginx configuration.
4. Reload Nginx (`sudo systemctl reload nginx`). All features (live image discovery, saving transparent PNGs, library deletion) will work seamlessly!

### Option 2: Running the Python Dev Server
Run the built-in development server:
```bash
python3 server.py
```
Then open `http://localhost:8000` in your browser. Whenever you add new `.png`, `.jpg`, `.jpeg`, `.gif`, or `.svg` files to `assets/`, simply click the ↻ **Refresh** button in the library header!

### Option 3: Direct File Mode (`file:///`)
You can open `index.html` directly in your browser without a server:
- If you copy files directly into the `assets` folder on your disk, run `python3 update_manifest.py` once to update the manifest file so the browser knows they are there.
- Or use the **"Load Folder"** / **"Pick Files"** button in the app's sidebar to import images directly with one click!

## Supported Image Formats
- `.png`
- `.jpg` / `.jpeg`
- `.gif`
- `.svg`
- `.webp`

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Click` | Select sprite / Deselect when clicking empty space |
| `Drag Corner Points` | Resize sprite (maintains aspect ratio) |
| `Delete` / `Backspace` | Remove selected sprite |
| `Ctrl + S` / `Cmd + S` | Save active room layout |
| `Ctrl + D` / `Cmd + D` | Duplicate selected sprite |
| `Arrow Keys` | Nudge sprite by grid step |
| `Shift + Arrow Keys` | Nudge sprite by 16px |
| `Space + Drag` | Pan canvas workspace |
| `Right-Click Drag` | Pan canvas without keyboard |
| `V` / `H` | Toggle Select tool vs Pan tool |
| `Mouse Wheel` | Zoom in / out |
| `Escape` | Deselect current sprite |

