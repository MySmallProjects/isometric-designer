# Isometric Room Designer (IsoRoom Studio)

A lightweight, responsive web application for creating isometric room scenes using isometric sprite graphics. Built with vanilla HTML5, CSS3, and modern JavaScript.

## Features

- **Sprite Library & Browser**:
  - Built-in isometric sprites: Wood Floor, Carpet, Stone Floor, Left Wall, Right Wall, Modern Sofa, Armchair, Wood Table, Workstation Desk, Bookshelf, Queen Bed, Retro TV, Monstera Plant, and Floor Lamp.
  - Search/filter sprites by name or tag.
  - Category tabs (`All`, `Floors`, `Walls`, `Furniture`, `Storage`, `Decor`, `Lighting`, `Custom`).
  - **Click to Add** or **Drag-and-Drop** directly onto the canvas workspace.
  - **Upload Custom Sprites**: Drag & drop or pick image files (PNG, SVG, JPG, WebP) directly into the library.

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

### Option 1: Running the Live Development Server (Recommended)
Run the built-in development server, which automatically detects newly added images in `assets/` and `assets/sprites/`:
```bash
python3 server.py
```
Then open `http://localhost:8000` in your browser. Whenever you add new `.png`, `.jpg`, `.jpeg`, `.gif`, or `.svg` files to `assets/` or `assets/sprites/`, simply click the ↻ **Refresh** button in the library header!

### Option 2: Direct File Mode (`file:///`)
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
| `Ctrl + D` / `Cmd + D` | Duplicate selected sprite |
| `Arrow Keys` | Nudge sprite by grid step |
| `Shift + Arrow Keys` | Nudge sprite by 16px |
| `Space + Drag` | Pan canvas workspace |
| `Right-Click Drag` | Pan canvas without keyboard |
| `V` / `H` | Toggle Select tool vs Pan tool |
| `Mouse Wheel` | Zoom in / out |
| `Escape` | Deselect current sprite |

