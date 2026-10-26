#!/usr/bin/env python3
import os

os.makedirs('assets/sprites', exist_ok=True)

sprites = {
    'floor_wood.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="wood1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4a373"/>
      <stop offset="100%" stop-color="#bc6c25"/>
    </linearGradient>
    <linearGradient id="woodEdge" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#99582a"/>
      <stop offset="100%" stop-color="#6f3e1a"/>
    </linearGradient>
  </defs>
  <!-- Base diamond -->
  <polygon points="64,2 126,32 64,62 2,32" fill="url(#wood1)" stroke="#8d4925" stroke-width="1.5"/>
  <!-- Wood planks -->
  <line x1="33" y1="17" x2="95" y2="47" stroke="#9c6644" stroke-width="1.5" stroke-opacity="0.6"/>
  <line x1="48.5" y1="9.5" x2="110.5" y2="39.5" stroke="#9c6644" stroke-width="1.5" stroke-opacity="0.6"/>
  <line x1="17.5" y1="24.5" x2="79.5" y2="54.5" stroke="#9c6644" stroke-width="1.5" stroke-opacity="0.6"/>
  <!-- Plank seams -->
  <line x1="50" y1="25" x2="57" y2="28.5" stroke="#7f4f24" stroke-width="1.5"/>
  <line x1="78" y1="39" x2="85" y2="42.5" stroke="#7f4f24" stroke-width="1.5"/>
  <line x1="40" y1="35" x2="47" y2="38.5" stroke="#7f4f24" stroke-width="1.5"/>
  <line x1="85" y1="27" x2="92" y2="30.5" stroke="#7f4f24" stroke-width="1.5"/>
</svg>''',

    'floor_carpet.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="carpetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#48bfe3"/>
      <stop offset="100%" stop-color="#0077b6"/>
    </linearGradient>
  </defs>
  <polygon points="64,2 126,32 64,62 2,32" fill="url(#carpetGrad)" stroke="#023e8a" stroke-width="1.5"/>
  <polygon points="64,8 114,32 64,56 14,32" fill="none" stroke="#caf0f8" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.8"/>
  <polygon points="64,16 98,32 64,48 30,32" fill="#0096c7" stroke="#caf0f8" stroke-width="1" opacity="0.5"/>
  <circle cx="64" cy="32" r="3" fill="#caf0f8"/>
</svg>''',

    'floor_stone.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <polygon points="64,2 126,32 64,62 2,32" fill="#adb5bd" stroke="#495057" stroke-width="1.5"/>
  <!-- 4 sub-tiles -->
  <line x1="33" y1="17" x2="95" y2="47" stroke="#6c757d" stroke-width="1.5"/>
  <line x1="95" y1="17" x2="33" y2="47" stroke="#6c757d" stroke-width="1.5"/>
  <!-- Highlight edges -->
  <polyline points="64,4 123,32 64,60" fill="none" stroke="#dee2e6" stroke-width="1" opacity="0.6"/>
</svg>''',

    'wall_left.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 160" width="128" height="160">
  <defs>
    <linearGradient id="wallLGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e9ecef"/>
      <stop offset="100%" stop-color="#ced4da"/>
    </linearGradient>
  </defs>
  <!-- Wall face -->
  <polygon points="64,2 2,33 2,129 64,98" fill="url(#wallLGrad)" stroke="#6c757d" stroke-width="1.5"/>
  <!-- Top trim -->
  <polygon points="64,2 2,33 2,38 64,7" fill="#dee2e6" stroke="#adb5bd" stroke-width="1"/>
  <!-- Baseboard -->
  <polygon points="2,120 64,89 64,98 2,129" fill="#495057"/>
  <polygon points="2,120 64,89 64,86 2,117" fill="#6c757d"/>
  <!-- Brick or panel pattern lines -->
  <line x1="2" y1="62" x2="64" y2="31" stroke="#adb5bd" stroke-width="1" stroke-dasharray="10,5"/>
  <line x1="2" y1="91" x2="64" y2="60" stroke="#adb5bd" stroke-width="1" stroke-dasharray="10,5"/>
  <!-- Art frame on wall -->
  <polygon points="18,65 48,50 48,78 18,93" fill="#ffb703" stroke="#fb8500" stroke-width="1.5"/>
  <polygon points="22,68 44,57 44,75 22,86" fill="#023047"/>
  <circle cx="33" cy="71" r="4" fill="#8ecae6"/>
</svg>''',

    'wall_right.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 160" width="128" height="160">
  <defs>
    <linearGradient id="wallRGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ced4da"/>
      <stop offset="100%" stop-color="#adb5bd"/>
    </linearGradient>
  </defs>
  <!-- Wall face -->
  <polygon points="64,2 126,33 126,129 64,98" fill="url(#wallRGrad)" stroke="#495057" stroke-width="1.5"/>
  <!-- Top trim -->
  <polygon points="64,2 126,33 126,38 64,7" fill="#adb5bd" stroke="#6c757d" stroke-width="1"/>
  <!-- Baseboard -->
  <polygon points="64,89 126,120 126,129 64,98" fill="#343a40"/>
  <polygon points="64,86 126,117 126,120 64,89" fill="#495057"/>
  <!-- Window -->
  <polygon points="80,50 112,66 112,96 80,80" fill="#a2d2ff" stroke="#3d5a80" stroke-width="2"/>
  <polygon points="83,53 109,66 109,93 83,80" fill="#caf0f8"/>
  <line x1="96" y1="58" x2="96" y2="88" stroke="#3d5a80" stroke-width="1.5"/>
  <line x1="83" y1="67" x2="109" y2="80" stroke="#3d5a80" stroke-width="1.5"/>
</svg>''',

    'sofa_isometric.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 110" width="130" height="110">
  <defs>
    <linearGradient id="sofaBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3a86ff"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="sofaDark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#172554"/>
    </linearGradient>
  </defs>
  <!-- Shadow -->
  <ellipse cx="65" cy="98" rx="55" ry="10" fill="#000" opacity="0.18"/>
  <!-- Backrest -->
  <polygon points="20,35 60,15 110,40 70,60" fill="#60a5fa" stroke="#1e40af" stroke-width="1.5"/>
  <polygon points="20,35 70,60 70,72 20,47" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>
  <polygon points="70,60 110,40 110,52 70,72" fill="#1d4ed8" stroke="#1e40af" stroke-width="1.5"/>
  <!-- Left armrest -->
  <polygon points="12,50 32,40 44,46 24,56" fill="#93c5fd" stroke="#1e40af" stroke-width="1.5"/>
  <polygon points="12,50 24,56 24,84 12,78" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>
  <polygon points="24,56 44,46 44,74 24,84" fill="#1d4ed8" stroke="#1e40af" stroke-width="1.5"/>
  <!-- Right armrest -->
  <polygon points="86,77 106,67 118,73 98,83" fill="#93c5fd" stroke="#1e40af" stroke-width="1.5"/>
  <polygon points="86,77 98,83 98,101 86,95" fill="#3b82f6" stroke="#1e40af" stroke-width="1.5"/>
  <polygon points="98,83 118,73 118,91 98,101" fill="#1d4ed8" stroke="#1e40af" stroke-width="1.5"/>
  <!-- Seat cushions -->
  <polygon points="24,62 68,40 98,55 54,77" fill="#60a5fa" stroke="#1e40af" stroke-width="1.5"/>
  <polygon points="24,62 54,77 54,86 24,71" fill="#2563eb" stroke="#1e40af" stroke-width="1.5"/>
  <polygon points="54,77 98,55 98,64 54,86" fill="#1e40af" stroke="#1e40af" stroke-width="1.5"/>
  <!-- Accent throw pillows -->
  <polygon points="32,54 44,48 48,58 36,64" fill="#fbbf24" stroke="#d97706" stroke-width="1"/>
  <polygon points="76,46 88,40 92,50 80,56" fill="#f43f5e" stroke="#be123c" stroke-width="1"/>
</svg>''',

    'table_isometric.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90" width="120" height="90">
  <defs>
    <linearGradient id="woodTable" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
  </defs>
  <!-- Shadow -->
  <ellipse cx="60" cy="80" rx="42" ry="8" fill="#000" opacity="0.18"/>
  <!-- Legs -->
  <polygon points="20,40 24,42 24,74 20,72" fill="#451a03"/>
  <polygon points="60,60 64,62 64,84 60,82" fill="#451a03"/>
  <polygon points="96,42 100,40 100,72 96,74" fill="#451a03"/>
  <polygon points="58,22 62,20 62,50 58,52" fill="#311302"/>
  <!-- Table Top Thickness -->
  <polygon points="12,32 60,56 60,63 12,39" fill="#92400e" stroke="#451a03" stroke-width="1"/>
  <polygon points="60,56 108,32 108,39 60,63" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <!-- Table Top Surface -->
  <polygon points="60,8 108,32 60,56 12,32" fill="#d97706" stroke="#78350f" stroke-width="1.5"/>
  <!-- Decorative centerpiece (bowl with fruit) -->
  <ellipse cx="60" cy="32" rx="10" ry="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1"/>
  <circle cx="58" cy="30" r="3" fill="#ef4444"/>
  <circle cx="63" cy="29" r="2.5" fill="#22c55e"/>
</svg>''',

    'armchair.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90" width="90" height="90">
  <!-- Shadow -->
  <ellipse cx="45" cy="82" rx="32" ry="6" fill="#000" opacity="0.18"/>
  <!-- Backrest -->
  <polygon points="20,32 45,19 70,32 45,45" fill="#f97316" stroke="#c2410c" stroke-width="1.5"/>
  <polygon points="20,32 45,45 45,55 20,42" fill="#ea580c" stroke="#c2410c" stroke-width="1.5"/>
  <polygon points="45,45 70,32 70,42 45,55" fill="#c2410c" stroke="#9a3412" stroke-width="1.5"/>
  <!-- Seat Cushion -->
  <polygon points="24,46 45,35 66,46 45,57" fill="#fb923c" stroke="#c2410c" stroke-width="1.5"/>
  <polygon points="24,46 45,57 45,66 24,55" fill="#ea580c" stroke="#c2410c" stroke-width="1.5"/>
  <polygon points="45,57 66,46 66,55 45,66" fill="#9a3412" stroke="#7c2d12" stroke-width="1.5"/>
  <!-- Legs -->
  <line x1="28" y1="62" x2="28" y2="78" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="62" x2="62" y2="78" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
  <line x1="45" y1="66" x2="45" y2="82" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
</svg>''',

    'indoor_plant.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110" width="80" height="110">
  <defs>
    <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f5ebe0"/>
      <stop offset="60%" stop-color="#e3d5ca"/>
      <stop offset="100%" stop-color="#d5bdaf"/>
    </linearGradient>
  </defs>
  <!-- Shadow -->
  <ellipse cx="40" cy="102" rx="22" ry="6" fill="#000" opacity="0.18"/>
  <!-- Plant Pot -->
  <path d="M25,72 L55,72 L50,100 L30,100 Z" fill="url(#potGrad)" stroke="#b08968" stroke-width="1.5"/>
  <ellipse cx="40" cy="72" rx="15" ry="5" fill="#6f4e37" stroke="#b08968" stroke-width="1.5"/>
  <!-- Stems & Big Monstera Leaves -->
  <path d="M40,72 Q35,50 20,40 Q15,48 25,60" fill="#2d6a4f" stroke="#1b4332" stroke-width="1"/>
  <path d="M40,72 Q45,45 62,35 Q65,45 50,58" fill="#40916c" stroke="#1b4332" stroke-width="1"/>
  <path d="M40,70 Q40,30 35,15 Q48,18 45,40" fill="#52b788" stroke="#1b4332" stroke-width="1"/>
  <path d="M40,72 Q50,55 60,65 Q50,75 42,72" fill="#74c69d" stroke="#1b4332" stroke-width="1"/>
  <path d="M40,72 Q25,58 18,65 Q25,75 38,72" fill="#40916c" stroke="#1b4332" stroke-width="1"/>
</svg>''',

    'bookshelf.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 150" width="90" height="150">
  <!-- Shadow -->
  <ellipse cx="45" cy="144" rx="35" ry="5" fill="#000" opacity="0.18"/>
  <!-- Bookshelf outer frame -->
  <polygon points="45,4 75,19 75,130 45,115" fill="#4a2810" stroke="#2c1404" stroke-width="1.5"/>
  <polygon points="45,4 15,19 15,130 45,115" fill="#6a3818" stroke="#2c1404" stroke-width="1.5"/>
  <polygon points="45,4 75,19 45,34 15,19" fill="#8b4a22" stroke="#2c1404" stroke-width="1.5"/>
  <!-- Shelves -->
  <polygon points="18,48 45,35 72,48 45,61" fill="#753d1b"/>
  <polygon points="18,78 45,65 72,78 45,91" fill="#753d1b"/>
  <polygon points="18,108 45,95 72,108 45,121" fill="#753d1b"/>
  <!-- Books on shelves (isometric blocks) -->
  <!-- Shelf 1 books -->
  <polygon points="24,40 28,38 28,47 24,49" fill="#e63946"/>
  <polygon points="29,37 34,35 34,46 29,48" fill="#457b9d"/>
  <polygon points="35,34 38,33 38,44 35,45" fill="#e9c46a"/>
  <polygon points="50,42 56,45 56,54 50,51" fill="#2a9d8f"/>
  <polygon points="58,46 64,49 64,56 58,53" fill="#f4a261"/>
  <!-- Shelf 2 books -->
  <polygon points="22,70 30,66 30,76 22,80" fill="#3a86ff"/>
  <polygon points="31,65 37,62 37,74 31,77" fill="#ff006e"/>
  <polygon points="52,72 60,76 60,86 52,82" fill="#8338ec"/>
  <polygon points="62,77 67,80 67,88 62,85" fill="#ffbe0b"/>
</svg>''',

    'work_desk.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 115" width="130" height="115">
  <!-- Shadow -->
  <ellipse cx="65" cy="106" rx="50" ry="8" fill="#000" opacity="0.18"/>
  <!-- Legs (metal black) -->
  <rect x="22" y="55" width="4" height="42" fill="#1e293b"/>
  <rect x="104" y="55" width="4" height="42" fill="#1e293b"/>
  <rect x="56" y="70" width="4" height="38" fill="#0f172a"/>
  <!-- Desktop Slab -->
  <polygon points="65,18 118,44 65,70 12,44" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="12,44 65,70 65,76 12,50" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1"/>
  <polygon points="65,70 118,44 118,50 65,76" fill="#94a3b8" stroke="#64748b" stroke-width="1"/>
  <!-- Laptop on desk -->
  <!-- Base -->
  <polygon points="60,40 76,48 64,54 48,46" fill="#475569"/>
  <!-- Screen -->
  <polygon points="60,40 76,48 76,32 60,24" fill="#0284c7" stroke="#334155" stroke-width="1"/>
  <polygon points="62,39 74,45 74,33 62,27" fill="#38bdf8"/>
  <!-- Desk Lamp -->
  <circle cx="95" cy="35" r="4" fill="#e2e8f0" stroke="#64748b"/>
  <line x1="95" y1="35" x2="92" y2="18" stroke="#64748b" stroke-width="2"/>
  <line x1="92" y1="18" x2="84" y2="22" stroke="#64748b" stroke-width="2"/>
  <polygon points="82,20 86,24 78,28" fill="#f59e0b"/>
  <!-- Coffee Mug -->
  <ellipse cx="38" cy="46" rx="3" ry="2" fill="#ef4444"/>
  <rect x="35" y="46" width="6" height="6" rx="1" fill="#dc2626"/>
</svg>''',

    'floor_lamp.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 130" width="60" height="130">
  <!-- Shadow -->
  <ellipse cx="30" cy="124" rx="18" ry="4" fill="#000" opacity="0.2"/>
  <!-- Base -->
  <ellipse cx="30" cy="122" rx="14" ry="5" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Pole -->
  <line x1="30" y1="122" x2="30" y2="38" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
  <!-- Lamp shade glow -->
  <ellipse cx="30" cy="40" rx="20" ry="10" fill="#fef08a" opacity="0.4"/>
  <!-- Lamp Shade -->
  <polygon points="20,42 40,42 46,20 14,20" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
  <ellipse cx="30" cy="20" rx="16" ry="5" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
  <ellipse cx="30" cy="42" rx="10" ry="3" fill="#fde047" stroke="#ca8a04" stroke-width="1"/>
</svg>''',

    'bed_queen.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 120" width="140" height="120">
  <!-- Shadow -->
  <ellipse cx="70" cy="108" rx="55" ry="9" fill="#000" opacity="0.2"/>
  <!-- Headboard -->
  <polygon points="25,40 60,22 80,32 45,50" fill="#582f0e" stroke="#331800" stroke-width="1.5"/>
  <polygon points="25,40 45,50 45,72 25,62" fill="#7f4f24" stroke="#331800" stroke-width="1.5"/>
  <polygon points="45,50 80,32 80,54 45,72" fill="#331800" stroke="#331800" stroke-width="1.5"/>
  <!-- Mattress / Bed Base -->
  <polygon points="42,50 96,23 124,37 70,64" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Pillows -->
  <polygon points="50,44 65,36 72,40 57,48" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <polygon points="68,35 83,27 90,31 75,39" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
  <!-- Duvet / Blanket -->
  <polygon points="52,58 84,42 118,59 86,75" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
  <polygon points="52,58 86,75 86,92 52,75" fill="#0369a1" stroke="#075985" stroke-width="1.5"/>
  <polygon points="86,75 118,59 118,76 86,92" fill="#075985" stroke="#0c4a6e" stroke-width="1.5"/>
  <!-- Folded top duvet sheet -->
  <polygon points="50,54 82,38 88,41 56,57" fill="#38bdf8" stroke="#0284c7" stroke-width="1"/>
</svg>''',

    'retro_tv.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 95" width="110" height="95">
  <!-- Shadow -->
  <ellipse cx="55" cy="88" rx="40" ry="6" fill="#000" opacity="0.2"/>
  <!-- Media Unit Table -->
  <polygon points="55,38 95,58 55,78 15,58" fill="#b45309" stroke="#78350f" stroke-width="1.5"/>
  <polygon points="15,58 55,78 55,85 15,65" fill="#92400e" stroke="#78350f" stroke-width="1"/>
  <polygon points="55,78 95,58 95,65 55,85" fill="#78350f" stroke="#451a03" stroke-width="1"/>
  <!-- Table legs -->
  <line x1="20" y1="65" x2="20" y2="84" stroke="#451a03" stroke-width="2.5"/>
  <line x1="55" y1="85" x2="55" y2="92" stroke="#451a03" stroke-width="2.5"/>
  <line x1="90" y1="65" x2="90" y2="84" stroke="#451a03" stroke-width="2.5"/>
  <!-- TV Cabinet -->
  <polygon points="35,32 65,17 80,24 50,40" fill="#475569" stroke="#1e293b" stroke-width="1.5"/>
  <polygon points="35,32 50,40 50,60 35,52" fill="#334155" stroke="#1e293b" stroke-width="1.5"/>
  <polygon points="50,40 80,24 80,44 50,60" fill="#1e293b" stroke="#0f172a" stroke-width="1.5"/>
  <!-- TV Screen -->
  <polygon points="52,41 77,28 77,43 52,56" fill="#22d3ee" stroke="#0891b2" stroke-width="1"/>
  <!-- Antenna -->
  <line x1="55" y1="22" x2="48" y2="8" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="55" y1="22" x2="65" y2="6" stroke="#94a3b8" stroke-width="1.5"/>
</svg>'''
}

for name, svg in sprites.items():
    with open(os.path.join('assets/sprites', name), 'w', encoding='utf-8') as f:
        f.write(svg.strip())

print(f"Generated {len(sprites)} isometric sprites successfully!")

