#!/usr/bin/env python3
"""
Generates an extensive library of isometric sprites for IsoRoom Studio:
- Tileable Floors (Marble, Dark Wood, Checkerboard, Tatami, Terracotta, Cyber Grid, Grass)
- Rugs & Mats (Persian rug, Boho circular rug, Fluffy shag rug, Geometric runner, Bearskin)
- Tables & Desks (Glass coffee table, Large dining table, Bedside nightstand, Cafe bistro table, Battlestation gaming desk)
- Chairs & Seating (Modern wooden dining chair, Ergonomic swivel office chair, Racing gaming chair, Leather lounge chair & ottoman, Tall bar stool, Velvet loveseat)
- Storage & Shelving (3-Drawer Dresser, Tall Wardrobe with mirror, Office Filing Cabinet, Kitchen Counter with sink)
- Decor & Lighting (Potted Monstera plant, Book stack with coffee mug, Guitar on stand, Desk anglepoise lamp, Pendant light, Neon sign)
"""

import os
from update_manifest import main as update_manifest_files

SPRITES = {
    # ==========================================
    # TILEABLE FLOORING (128x64 standard 2:1 isometric diamond)
    # ==========================================
    'floor_marble.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="marbleBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="marbleVein" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#cbd5e1" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#64748b" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <!-- Diamond base -->
  <polygon points="64,2 126,32 64,62 2,32" fill="url(#marbleBase)" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Polished sheen highlight -->
  <polygon points="64,6 100,24 64,42 28,24" fill="#ffffff" opacity="0.4"/>
  <!-- Marble veins -->
  <path d="M25,25 Q45,28 60,20 T95,35 T115,28" fill="none" stroke="url(#marbleVein)" stroke-width="1.2"/>
  <path d="M40,40 Q55,32 75,42 T105,45" fill="none" stroke="url(#marbleVein)" stroke-width="0.8" opacity="0.6"/>
  <path d="M15,30 Q30,38 45,46" fill="none" stroke="url(#marbleVein)" stroke-width="0.7" opacity="0.5"/>
  <!-- Subtle diagonal bevel border -->
  <polyline points="2,32 64,2 126,32" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
  <polyline points="126,32 64,62 2,32" fill="none" stroke="#94a3b8" stroke-width="1.2" opacity="0.5"/>
</svg>''',

    'floor_dark_wood.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="dwood" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3d2314"/>
      <stop offset="50%" stop-color="#2c1810"/>
      <stop offset="100%" stop-color="#1f100a"/>
    </linearGradient>
    <linearGradient id="plankLight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5a3825" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#3d2314" stop-opacity="0.1"/>
    </linearGradient>
  </defs>
  <polygon points="64,2 126,32 64,62 2,32" fill="url(#dwood)" stroke="#1a0c06" stroke-width="1.5"/>
  <!-- Planks along iso axis -->
  <line x1="33" y1="17" x2="95" y2="47" stroke="#1a0c06" stroke-width="1.2"/>
  <line x1="48.5" y1="9.5" x2="110.5" y2="39.5" stroke="#1a0c06" stroke-width="1.2"/>
  <line x1="17.5" y1="24.5" x2="79.5" y2="54.5" stroke="#1a0c06" stroke-width="1.2"/>
  <!-- Wood grain sheen -->
  <polygon points="34,17 48,10 110,40 96,47" fill="url(#plankLight)"/>
  <!-- Grain streaks -->
  <line x1="22" y1="28" x2="70" y2="51" stroke="#52321e" stroke-width="0.8" opacity="0.5"/>
  <line x1="55" y1="14" x2="102" y2="37" stroke="#52321e" stroke-width="0.8" opacity="0.5"/>
  <!-- Staggered ends -->
  <line x1="52" y1="26" x2="59" y2="29.5" stroke="#100703" stroke-width="1.5"/>
  <line x1="82" y1="41" x2="89" y2="44.5" stroke="#100703" stroke-width="1.5"/>
  <line x1="72" y1="21" x2="79" y2="24.5" stroke="#100703" stroke-width="1.5"/>
</svg>''',

    'floor_checkerboard.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <!-- 2x2 checkerboard on isometric diamond -->
  <polygon points="64,2 126,32 64,62 2,32" fill="#0f172a" stroke="#020617" stroke-width="1.5"/>
  <!-- Top tile (White) -->
  <polygon points="64,2 95,17 64,32 33,17" fill="#f8fafc" stroke="#334155" stroke-width="1"/>
  <!-- Bottom tile (White) -->
  <polygon points="64,32 95,47 64,62 33,47" fill="#f8fafc" stroke="#334155" stroke-width="1"/>
  <!-- Left tile (Black/Slate) -->
  <polygon points="33,17 64,32 33,47 2,32" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
  <!-- Right tile (Black/Slate) -->
  <polygon points="95,17 126,32 95,47 64,32" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
  <!-- Polished glare -->
  <polygon points="64,6 80,14 64,22 48,14" fill="#ffffff" opacity="0.4"/>
</svg>''',

    'floor_tatami.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="tatamiStraw" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4cc9a"/>
      <stop offset="100%" stop-color="#b8ad74"/>
    </linearGradient>
  </defs>
  <!-- Mat base -->
  <polygon points="64,2 126,32 64,62 2,32" fill="url(#tatamiStraw)" stroke="#8f8552" stroke-width="1.5"/>
  <!-- Woven straw lines -->
  <line x1="33" y1="17" x2="95" y2="47" stroke="#a39861" stroke-width="0.8" stroke-dasharray="2,2"/>
  <line x1="48" y1="10" x2="110" y2="40" stroke="#a39861" stroke-width="0.8" stroke-dasharray="2,2"/>
  <line x1="18" y1="25" x2="80" y2="55" stroke="#a39861" stroke-width="0.8" stroke-dasharray="2,2"/>
  <!-- Dark cloth borders on left and right edges (heri) -->
  <polygon points="2,32 64,2 58,5 2,32" fill="#1b4332" opacity="0.9"/>
  <polygon points="64,62 126,32 120,29 64,59" fill="#1b4332" opacity="0.9"/>
</svg>''',

    'floor_terracotta.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="clay" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e07a5f"/>
      <stop offset="100%" stop-color="#b5533c"/>
    </linearGradient>
  </defs>
  <polygon points="64,2 126,32 64,62 2,32" fill="url(#clay)" stroke="#8d3d2a" stroke-width="1.5"/>
  <!-- 4 terracotta square quadrants with thick grout -->
  <line x1="33" y1="17" x2="95" y2="47" stroke="#f4f1de" stroke-width="2.5" opacity="0.85"/>
  <line x1="95" y1="17" x2="33" y2="47" stroke="#f4f1de" stroke-width="2.5" opacity="0.85"/>
  <!-- Warm highlight corners -->
  <circle cx="64" cy="18" r="1.5" fill="#f2cc8f" opacity="0.8"/>
  <circle cx="64" cy="46" r="1.5" fill="#f2cc8f" opacity="0.8"/>
  <circle cx="34" cy="32" r="1.5" fill="#f2cc8f" opacity="0.8"/>
  <circle cx="94" cy="32" r="1.5" fill="#f2cc8f" opacity="0.8"/>
</svg>''',

    'floor_grass.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="grassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#55a630"/>
      <stop offset="100%" stop-color="#2b7a0b"/>
    </linearGradient>
  </defs>
  <polygon points="64,2 126,32 64,62 2,32" fill="url(#grassGrad)" stroke="#1e5c06" stroke-width="1.5"/>
  <!-- Grass tufts and clover specks -->
  <path d="M40,25 l-2,-5 l4,2 l1,-4 l2,7" stroke="#80b918" stroke-width="1.2" fill="none"/>
  <path d="M80,35 l-2,-5 l4,2 l1,-4 l2,7" stroke="#80b918" stroke-width="1.2" fill="none"/>
  <path d="M60,45 l-2,-4 l3,2 l1,-3 l2,5" stroke="#aacc00" stroke-width="1.2" fill="none"/>
  <path d="M90,20 l-2,-4 l3,2 l1,-3 l2,5" stroke="#aacc00" stroke-width="1.2" fill="none"/>
  <path d="M30,38 l-2,-4 l3,2 l1,-3 l2,5" stroke="#80b918" stroke-width="1.2" fill="none"/>
  <!-- Tiny wildflowers -->
  <circle cx="72" cy="22" r="1.5" fill="#ffff3f"/>
  <circle cx="48" cy="36" r="1.5" fill="#ffffff"/>
  <circle cx="85" cy="48" r="1.5" fill="#ff70a6"/>
</svg>''',

    'floor_cyber_grid.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64" width="128" height="64">
  <defs>
    <linearGradient id="cyberBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090a0f"/>
      <stop offset="100%" stop-color="#141724"/>
    </linearGradient>
  </defs>
  <polygon points="64,2 126,32 64,62 2,32" fill="url(#cyberBase)" stroke="#06b6d4" stroke-width="1.5"/>
  <!-- Neon inner glowing diamond -->
  <polygon points="64,12 106,32 64,52 22,32" fill="none" stroke="#a855f7" stroke-width="1.2" opacity="0.7"/>
  <!-- Glowing cross lines -->
  <line x1="33" y1="17" x2="95" y2="47" stroke="#06b6d4" stroke-width="1" stroke-dasharray="4,2"/>
  <line x1="95" y1="17" x2="33" y2="47" stroke="#06b6d4" stroke-width="1" stroke-dasharray="4,2"/>
  <!-- Core glowing diode -->
  <circle cx="64" cy="32" r="2.5" fill="#06b6d4"/>
  <circle cx="64" cy="32" r="5" fill="none" stroke="#38bdf8" stroke-width="0.8" opacity="0.5"/>
</svg>''',

    # ==========================================
    # RUGS & CARPETS
    # ==========================================
    'rug_persian.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 76" width="140" height="76">
  <defs>
    <linearGradient id="rugRuby" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9e0031"/>
      <stop offset="50%" stop-color="#67001f"/>
      <stop offset="100%" stop-color="#470014"/>
    </linearGradient>
  </defs>
  <!-- Drop shadow -->
  <polygon points="70,9 135,41 70,73 5,41" fill="#000000" opacity="0.25"/>
  <!-- Main rug diamond -->
  <polygon points="70,6 132,37 70,68 8,37" fill="url(#rugRuby)" stroke="#fbbf24" stroke-width="1.8"/>
  <!-- Gold outer border band -->
  <polygon points="70,12 120,37 70,62 20,37" fill="#1e1b4b" stroke="#fbbf24" stroke-width="1.2"/>
  <!-- Intricate center medallion -->
  <polygon points="70,22 98,37 70,52 42,37" fill="#b91c1c" stroke="#fbbf24" stroke-width="1"/>
  <polygon points="70,27 88,37 70,47 52,37" fill="#fbbf24" opacity="0.8"/>
  <circle cx="70" cy="37" r="4" fill="#0284c7"/>
  <!-- White fringes on ends -->
  <line x1="8" y1="37" x2="4" y2="39" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="2,2"/>
  <line x1="132" y1="37" x2="136" y2="35" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="2,2"/>
</svg>''',

    'rug_boho_round.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 60" width="110" height="60">
  <defs>
    <radialGradient id="juteGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fefae0"/>
      <stop offset="60%" stop-color="#dda15e"/>
      <stop offset="100%" stop-color="#bc6c25"/>
    </radialGradient>
  </defs>
  <!-- Shadow -->
  <ellipse cx="55" cy="32" rx="50" ry="25" fill="#000000" opacity="0.2"/>
  <!-- Concentric woven rings -->
  <ellipse cx="55" cy="30" rx="48" ry="24" fill="url(#juteGrad)" stroke="#99582a" stroke-width="1.2"/>
  <ellipse cx="55" cy="30" rx="38" ry="19" fill="none" stroke="#283618" stroke-width="1.5" stroke-dasharray="4,3"/>
  <ellipse cx="55" cy="30" rx="26" ry="13" fill="#fefae0" stroke="#bc6c25" stroke-width="1"/>
  <ellipse cx="55" cy="30" rx="14" ry="7" fill="#606c38" stroke="#283618" stroke-width="1"/>
  <circle cx="55" cy="30" r="3" fill="#dda15e"/>
</svg>''',

    'rug_geometric.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 68" width="130" height="68">
  <!-- Scandinavian Modern Geometric Runner -->
  <polygon points="65,8 126,38 65,68 4,38" fill="#000000" opacity="0.2"/>
  <!-- Rug base -->
  <polygon points="65,4 122,33 65,62 8,33" fill="#f8fafc" stroke="#334155" stroke-width="1.5"/>
  <!-- Yellow and navy geo chevrons -->
  <polygon points="65,10 90,23 65,36 40,23" fill="#eab308"/>
  <polygon points="65,26 90,39 65,52 40,39" fill="#0284c7"/>
  <polygon points="35,20 60,33 35,46 10,33" fill="#0f172a"/>
  <polygon points="95,20 120,33 95,46 70,33" fill="#0f172a"/>
</svg>''',

    # ==========================================
    # CHAIRS & SEATING
    # ==========================================
    'chair_dining_wood.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 95" width="70" height="95">
  <defs>
    <linearGradient id="chairWood" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="chairCushion" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="35" cy="85" rx="18" ry="7" fill="#000000" opacity="0.25"/>
  <!-- Back legs -->
  <line x1="24" y1="52" x2="20" y2="82" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
  <line x1="46" y1="52" x2="50" y2="82" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
  <!-- High curved backrest -->
  <path d="M22,18 Q35,8 48,18 L48,50 Q35,42 22,50 Z" fill="url(#chairWood)" stroke="#451a03" stroke-width="1.5"/>
  <!-- Spindles in backrest -->
  <line x1="30" y1="20" x2="30" y2="44" stroke="#78350f" stroke-width="2"/>
  <line x1="35" y1="16" x2="35" y2="42" stroke="#78350f" stroke-width="2"/>
  <line x1="40" y1="20" x2="40" y2="44" stroke="#78350f" stroke-width="2"/>
  <!-- Front legs -->
  <line x1="16" y1="60" x2="14" y2="88" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="54" y1="60" x2="56" y2="88" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Padded seat diamond -->
  <polygon points="35,46 58,58 35,70 12,58" fill="url(#chairCushion)" stroke="#a16207" stroke-width="1.5"/>
  <!-- Seat thickness -->
  <polygon points="12,58 35,70 35,74 12,62" fill="#854d0e"/>
  <polygon points="35,70 58,58 58,62 35,74" fill="#a16207"/>
</svg>''',

    'chair_office_swivel.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110" width="80" height="110">
  <defs>
    <linearGradient id="meshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="chrome" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
  <!-- Caster wheels & 5-star base -->
  <ellipse cx="40" cy="98" rx="22" ry="8" fill="#000000" opacity="0.3"/>
  <line x1="40" y1="88" x2="22" y2="98" stroke="url(#chrome)" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="40" y1="88" x2="58" y2="98" stroke="url(#chrome)" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="40" y1="88" x2="40" y2="103" stroke="url(#chrome)" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="40" y1="88" x2="28" y2="86" stroke="url(#chrome)" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="40" y1="88" x2="52" y2="86" stroke="url(#chrome)" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Central pneumatic cylinder -->
  <rect x="38" y="70" width="4" height="18" fill="url(#chrome)"/>
  <!-- Seat cushion -->
  <polygon points="40,58 64,68 40,78 16,68" fill="url(#meshGrad)" stroke="#0f172a" stroke-width="1.5"/>
  <polygon points="16,68 40,78 40,82 16,72" fill="#020617"/>
  <polygon points="40,78 64,68 64,72 40,82" fill="#1e293b"/>
  <!-- Ergonomic curved mesh backrest -->
  <path d="M24,20 C24,10 56,10 56,20 L58,58 C58,62 22,62 22,58 Z" fill="url(#meshGrad)" stroke="#0284c7" stroke-width="1.8"/>
  <rect x="30" y="24" width="20" height="24" rx="4" fill="#1e293b" opacity="0.6"/>
  <!-- Armrests -->
  <path d="M14,54 L14,46 L24,44" fill="none" stroke="#475569" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M66,54 L66,46 L56,44" fill="none" stroke="#475569" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Lumbar support bar -->
  <line x1="26" y1="42" x2="54" y2="42" stroke="#0284c7" stroke-width="2"/>
</svg>''',

    'chair_lounge_leather.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95 105" width="95" height="105">
  <defs>
    <linearGradient id="richLeather" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9a3412"/>
      <stop offset="50%" stop-color="#7c2d12"/>
      <stop offset="100%" stop-color="#431407"/>
    </linearGradient>
    <linearGradient id="walnutShell" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5a2e17"/>
      <stop offset="100%" stop-color="#2d1307"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="48" cy="94" rx="30" ry="9" fill="#000000" opacity="0.3"/>
  <!-- Base legs (star base) -->
  <line x1="48" y1="84" x2="28" y2="95" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
  <line x1="48" y1="84" x2="68" y2="95" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
  <line x1="48" y1="84" x2="48" y2="99" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>
  <!-- Bent plywood outer shell -->
  <path d="M20,40 C14,20 80,12 80,36 L76,70 C76,80 20,80 20,68 Z" fill="url(#walnutShell)" stroke="#1a0c06" stroke-width="2"/>
  <!-- Padded tufted back cushion -->
  <rect x="26" y="22" width="46" height="34" rx="8" fill="url(#richLeather)" stroke="#2d1307" stroke-width="1.5"/>
  <!-- Button tufting -->
  <circle cx="38" cy="32" r="1.8" fill="#2d1307"/>
  <circle cx="60" cy="32" r="1.8" fill="#2d1307"/>
  <circle cx="49" cy="42" r="1.8" fill="#2d1307"/>
  <!-- Seat cushion -->
  <polygon points="48,58 78,70 48,84 18,70" fill="url(#richLeather)" stroke="#2d1307" stroke-width="1.8"/>
  <polygon points="18,70 48,84 48,88 18,74" fill="#431407"/>
  <polygon points="48,84 78,70 78,74 48,88" fill="#7c2d12"/>
  <!-- Padded armrests -->
  <rect x="14" y="52" width="10" height="18" rx="4" fill="url(#richLeather)" transform="rotate(-15 14 52)"/>
  <rect x="72" y="52" width="10" height="18" rx="4" fill="url(#richLeather)" transform="rotate(15 72 52)"/>
</svg>''',

    'chair_stool_bar.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 90" width="50" height="90">
  <defs>
    <linearGradient id="metalLeg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <ellipse cx="25" cy="84" rx="14" ry="5" fill="#000000" opacity="0.25"/>
  <!-- 4 tall metal legs -->
  <line x1="16" y1="36" x2="10" y2="84" stroke="url(#metalLeg)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="34" y1="36" x2="40" y2="84" stroke="url(#metalLeg)" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="22" y1="38" x2="18" y2="82" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
  <line x1="28" y1="38" x2="32" y2="82" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
  <!-- Footrest ring -->
  <ellipse cx="25" cy="64" rx="12" ry="4" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <!-- Round cushioned seat -->
  <ellipse cx="25" cy="34" rx="16" ry="8" fill="#0284c7" stroke="#0369a1" stroke-width="1.5"/>
  <!-- Seat rim -->
  <path d="M9,34 C9,40 41,40 41,34 L41,38 C41,44 9,44 9,38 Z" fill="#0369a1"/>
</svg>''',

    # ==========================================
    # TABLES & DESKS
    # ==========================================
    'table_dining_large.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 110" width="160" height="110">
  <defs>
    <linearGradient id="tableOak" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d4a373"/>
      <stop offset="50%" stop-color="#bc6c25"/>
      <stop offset="100%" stop-color="#99582a"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <polygon points="80,56 150,88 80,108 10,88" fill="#000000" opacity="0.25"/>
  <!-- 4 Sturdy Wooden Legs -->
  <polygon points="20,58 26,55 26,92 20,95" fill="#603813"/>
  <polygon points="134,58 140,55 140,92 134,95" fill="#7f4f24"/>
  <polygon points="76,82 82,79 82,106 76,109" fill="#603813"/>
  <polygon points="76,46 82,43 82,78 76,81" fill="#43281c"/>
  <!-- Thick Tabletop Diamond -->
  <polygon points="80,24 154,60 80,94 6,60" fill="url(#tableOak)" stroke="#7f4f24" stroke-width="2"/>
  <!-- Tabletop rim/bevel -->
  <polygon points="6,60 80,94 80,100 6,66" fill="#7f4f24"/>
  <polygon points="80,94 154,60 154,66 80,100" fill="#99582a"/>
  <!-- Wood plank grooves on tabletop -->
  <line x1="43" y1="42" x2="117" y2="77" stroke="#7f4f24" stroke-width="1.2" opacity="0.7"/>
  <line x1="62" y1="33" x2="135" y2="69" stroke="#7f4f24" stroke-width="1.2" opacity="0.7"/>
  <line x1="25" y1="51" x2="98" y2="86" stroke="#7f4f24" stroke-width="1.2" opacity="0.7"/>
  <!-- Table runner centerpiece -->
  <polygon points="80,36 108,50 80,64 52,50" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" opacity="0.9"/>
  <!-- Small flower vase on table -->
  <ellipse cx="80" cy="48" rx="4" ry="2" fill="#0284c7"/>
  <line x1="80" y1="48" x2="80" y2="40" stroke="#16a34a" stroke-width="1.5"/>
  <circle cx="80" cy="39" r="3" fill="#f43f5e"/>
</svg>''',

    'table_coffee_glass.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 65" width="90" height="65">
  <defs>
    <linearGradient id="glassTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <ellipse cx="45" cy="54" rx="30" ry="9" fill="#000000" opacity="0.2"/>
  <!-- Triangular Wooden Legs underneath -->
  <line x1="30" y1="28" x2="22" y2="52" stroke="#92400e" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="60" y1="28" x2="68" y2="52" stroke="#92400e" stroke-width="3.5" stroke-linecap="round"/>
  <line x1="45" y1="34" x2="45" y2="58" stroke="#78350f" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Circular Glass Top (isometric ellipse) -->
  <ellipse cx="45" cy="26" rx="36" ry="17" fill="url(#glassTop)" stroke="#0284c7" stroke-width="2"/>
  <!-- Beveled glass edge -->
  <ellipse cx="45" cy="27" rx="35" ry="16.5" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.8"/>
  <!-- Diagonal specular reflection slash -->
  <line x1="28" y1="20" x2="42" y2="28" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="46" y1="30" x2="52" y2="33" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
</svg>''',

    'table_nightstand.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 80" width="65" height="80">
  <defs>
    <linearGradient id="standWood" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>
  <!-- Shadow -->
  <polygon points="32,48 60,62 32,76 4,62" fill="#000000" opacity="0.25"/>
  <!-- 4 angled brass peg legs -->
  <line x1="10" y1="58" x2="6" y2="74" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="54" y1="58" x2="58" y2="74" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="68" x2="32" y2="78" stroke="#b45309" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Left Side Face -->
  <polygon points="6,34 32,47 32,64 6,51" fill="#64748b" stroke="#334155" stroke-width="1"/>
  <!-- Front Right Drawer Face -->
  <polygon points="32,47 58,34 58,51 32,64" fill="#cbd5e1" stroke="#334155" stroke-width="1"/>
  <!-- Drawer separation seam -->
  <line x1="32" y1="55" x2="58" y2="42" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Gold Drawer Knob Handles -->
  <circle cx="45" cy="51" r="2" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
  <circle cx="45" cy="60" r="2" fill="#f59e0b" stroke="#b45309" stroke-width="0.8"/>
  <!-- Top Surface Diamond -->
  <polygon points="32,20 58,34 32,47 6,34" fill="url(#standWood)" stroke="#475569" stroke-width="1.5"/>
  <!-- Small reading lamp on nightstand -->
  <ellipse cx="24" cy="34" rx="4" ry="2" fill="#f59e0b"/>
  <line x1="24" y1="34" x2="24" y2="18" stroke="#d97706" stroke-width="1.5"/>
  <polygon points="20,18 28,18 31,24 17,24" fill="#fbbf24" opacity="0.9"/>
</svg>''',

    'table_gaming_desk.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 115" width="130" height="115">
  <defs>
    <linearGradient id="carbonDesk" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <polygon points="65,65 124,94 65,114 6,94" fill="#000000" opacity="0.3"/>
  <!-- Z-shaped Gaming Desk Legs (Red & Black) -->
  <line x1="16" y1="68" x2="12" y2="102" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
  <line x1="114" y1="68" x2="118" y2="102" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/>
  <line x1="65" y1="88" x2="65" y2="110" stroke="#991b1b" stroke-width="4" stroke-linecap="round"/>
  <!-- RGB underglow line -->
  <polyline points="10,67 65,95 120,67" fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.8"/>
  <!-- Desktop Surface Diamond (Carbon fiber) -->
  <polygon points="65,36 124,65 65,95 6,65" fill="url(#carbonDesk)" stroke="#334155" stroke-width="2"/>
  <polygon points="6,65 65,95 65,99 6,69" fill="#020617"/>
  <polygon points="65,95 124,65 124,69 65,99" fill="#1e293b"/>
  <!-- XL Deskmat (Red & Black) -->
  <polygon points="65,48 105,68 65,88 25,68" fill="#450a0a" stroke="#dc2626" stroke-width="1.2"/>
  <!-- Mechanical Keyboard & Mouse -->
  <polygon points="62,63 76,70 68,74 54,67" fill="#0f172a" stroke="#06b6d4" stroke-width="1"/>
  <ellipse cx="85" cy="74" rx="3" ry="2" fill="#0f172a" stroke="#ec4899" stroke-width="0.8"/>
  <!-- Dual Gaming Monitors -->
  <!-- Monitor 1 (Main) -->
  <polygon points="45,22 75,37 75,54 45,39" fill="#0284c7" stroke="#0f172a" stroke-width="2"/>
  <line x1="60" y1="46" x2="60" y2="56" stroke="#475569" stroke-width="3"/>
  <!-- Monitor 2 (Angled) -->
  <polygon points="76,37 98,44 98,60 76,53" fill="#a855f7" stroke="#0f172a" stroke-width="2"/>
  <!-- PC Tower with glass RGB panel -->
  <polygon points="102,52 114,58 114,80 102,74" fill="#06b6d4" stroke="#0f172a" stroke-width="1.5" opacity="0.85"/>
  <polygon points="102,52 114,58 110,54 98,48" fill="#1e293b"/>
</svg>''',

    # ==========================================
    # STORAGE & WARDROBES
    # ==========================================
    'storage_wardrobe.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 150" width="100" height="150">
  <defs>
    <linearGradient id="wardrobeFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="mirror" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#93c5fd"/>
    </linearGradient>
  </defs>
  <!-- Floor Shadow -->
  <polygon points="50,116 95,138 50,148 5,138" fill="#000000" opacity="0.3"/>
  <!-- Left Side Panel -->
  <polygon points="8,35 50,56 50,136 8,115" fill="#334155" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Front Right Door Panels -->
  <polygon points="50,56 92,35 92,115 50,136" fill="url(#wardrobeFace)" stroke="#0f172a" stroke-width="1.5"/>
  <!-- Double door seam line -->
  <line x1="71" y1="45" x2="71" y2="125" stroke="#0f172a" stroke-width="2"/>
  <!-- Full-length tall mirror on right door -->
  <polygon points="74,51 88,44 88,106 74,113" fill="url(#mirror)" stroke="#0f172a" stroke-width="1.2"/>
  <line x1="76" y1="58" x2="86" y2="53" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  <!-- Sleek metal door pull handles -->
  <line x1="68" y1="80" x2="68" y2="92" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
  <!-- Top Roof Diamond -->
  <polygon points="50,15 92,35 50,56 8,35" fill="#64748b" stroke="#0f172a" stroke-width="2"/>
  <!-- Base feet -->
  <rect x="18" y="126" width="6" height="8" fill="#0f172a"/>
  <rect x="76" y="126" width="6" height="8" fill="#0f172a"/>
</svg>''',

    'storage_dresser.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 95" width="110" height="95">
  <defs>
    <linearGradient id="dresserWood" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>
  <!-- Floor shadow -->
  <polygon points="55,62 104,86 55,94 6,86" fill="#000000" opacity="0.25"/>
  <!-- 4 tapered mid-century legs -->
  <line x1="16" y1="72" x2="12" y2="88" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
  <line x1="94" y1="72" x2="98" y2="88" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
  <line x1="55" y1="80" x2="55" y2="92" stroke="#451a03" stroke-width="3" stroke-linecap="round"/>
  <!-- Left Side Face -->
  <polygon points="10,34 55,56 55,80 10,58" fill="#92400e" stroke="#451a03" stroke-width="1.5"/>
  <!-- Front Right Drawer Faces -->
  <polygon points="55,56 100,34 100,58 55,80" fill="url(#dresserWood)" stroke="#451a03" stroke-width="1.5"/>
  <!-- 3 Drawer horizontal seams -->
  <line x1="55" y1="64" x2="100" y2="42" stroke="#78350f" stroke-width="1.5"/>
  <line x1="55" y1="72" x2="100" y2="50" stroke="#78350f" stroke-width="1.5"/>
  <!-- Minimalist Brass Knobs -->
  <circle cx="72" cy="48" r="1.8" fill="#fef08a"/>
  <circle cx="83" cy="43" r="1.8" fill="#fef08a"/>
  <circle cx="72" cy="56" r="1.8" fill="#fef08a"/>
  <circle cx="83" cy="51" r="1.8" fill="#fef08a"/>
  <circle cx="72" cy="64" r="1.8" fill="#fef08a"/>
  <circle cx="83" cy="59" r="1.8" fill="#fef08a"/>
  <!-- Top Surface (White Marble Top) -->
  <polygon points="55,12 100,34 55,56 10,34" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Small Potted Succulent on top -->
  <polygon points="36,32 44,36 44,42 36,38" fill="#e07a5f"/>
  <circle cx="40" cy="31" r="3" fill="#16a34a"/>
</svg>''',

    # ==========================================
    # DECOR & ACCESSORIES
    # ==========================================
    'decor_monstera_plant.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" width="80" height="100">
  <defs>
    <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
  </defs>
  <!-- Shadow -->
  <ellipse cx="40" cy="92" rx="18" ry="6" fill="#000000" opacity="0.3"/>
  <!-- Ceramic Terracotta Planter Pot -->
  <polygon points="28,68 52,68 47,92 33,92" fill="#c2410c" stroke="#9a3412" stroke-width="1.5"/>
  <ellipse cx="40" cy="68" rx="12" ry="5" fill="#78350f" stroke="#9a3412" stroke-width="1.2"/>
  <!-- Arching monstera stems -->
  <path d="M40,68 Q30,40 18,32" stroke="#15803d" stroke-width="2.5" fill="none"/>
  <path d="M40,68 Q42,30 40,16" stroke="#15803d" stroke-width="2.5" fill="none"/>
  <path d="M40,68 Q52,44 64,30" stroke="#15803d" stroke-width="2.5" fill="none"/>
  <path d="M40,68 Q48,52 60,56" stroke="#15803d" stroke-width="2" fill="none"/>
  <!-- Big Fenestrated Leaves -->
  <!-- Left Leaf -->
  <path d="M18,32 C6,24 8,42 16,46 C24,50 30,38 18,32 Z" fill="url(#leafGrad)" stroke="#14532d" stroke-width="1.2"/>
  <!-- Center Top Leaf -->
  <path d="M40,16 C30,6 50,6 48,26 C44,34 32,28 40,16 Z" fill="url(#leafGrad)" stroke="#14532d" stroke-width="1.2"/>
  <!-- Right Leaf -->
  <path d="M64,30 C74,22 74,40 66,46 C58,52 54,38 64,30 Z" fill="url(#leafGrad)" stroke="#14532d" stroke-width="1.2"/>
  <!-- Lower Leaf -->
  <path d="M60,56 C70,52 68,66 58,68 C52,68 54,58 60,56 Z" fill="url(#leafGrad)" stroke="#14532d" stroke-width="1"/>
</svg>''',

    'decor_books_stack.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 55" width="70" height="55">
  <!-- Shadow -->
  <ellipse cx="35" cy="46" rx="24" ry="7" fill="#000000" opacity="0.25"/>
  <!-- Book 1 (Bottom, Blue) -->
  <polygon points="35,32 58,43 35,54 12,43" fill="#0284c7" stroke="#0369a1" stroke-width="1.2"/>
  <polygon points="12,43 35,54 35,58 12,47" fill="#075985"/>
  <polygon points="35,54 58,43 58,47 35,58" fill="#f8fafc"/>
  <!-- Book 2 (Middle, Red, rotated slightly) -->
  <polygon points="38,24 60,35 38,46 16,35" fill="#dc2626" stroke="#b91c1c" stroke-width="1.2"/>
  <polygon points="16,35 38,46 38,50 16,39" fill="#991b1b"/>
  <polygon points="38,46 60,35 60,39 38,50" fill="#f8fafc"/>
  <!-- Book 3 (Top, Gold) -->
  <polygon points="35,17 56,27 35,37 14,27" fill="#f59e0b" stroke="#d97706" stroke-width="1.2"/>
  <polygon points="14,27 35,37 35,40 14,30" fill="#b45309"/>
  <!-- Coffee Mug on Top of Books -->
  <ellipse cx="35" cy="18" rx="6" ry="3" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <path d="M29,18 L29,26 C29,29 41,29 41,26 L41,18 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <ellipse cx="35" cy="18" rx="4.5" ry="2" fill="#78350f"/>
  <!-- Handle -->
  <path d="M41,20 C45,20 45,25 41,25" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>
</svg>''',

    # ==========================================
    # LIGHTING
    # ==========================================
    'lamp_desk_pixar.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80" width="60" height="80">
  <defs>
    <linearGradient id="pixarMetal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
  </defs>
  <!-- Base Shadow -->
  <ellipse cx="30" cy="74" rx="14" ry="5" fill="#000000" opacity="0.3"/>
  <!-- Heavy Circular Cast Iron Base -->
  <ellipse cx="30" cy="70" rx="12" ry="5" fill="url(#pixarMetal)" stroke="#334155" stroke-width="1.5"/>
  <path d="M18,70 C18,74 42,74 42,70 L42,72 C42,76 18,76 18,72 Z" fill="#334155"/>
  <!-- Articulated Lower Arm with springs -->
  <line x1="28" y1="68" x2="18" y2="44" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="32" y1="68" x2="22" y2="44" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Middle Elbow Joint -->
  <circle cx="20" cy="44" r="3.5" fill="#0f172a" stroke="#94a3b8" stroke-width="1"/>
  <!-- Upper Arm -->
  <line x1="20" y1="44" x2="40" y2="24" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Head Joint -->
  <circle cx="40" cy="24" r="3" fill="#0f172a"/>
  <!-- Conical Lamp Shade -->
  <polygon points="38,22 46,18 56,36 42,42" fill="url(#pixarMetal)" stroke="#334155" stroke-width="1.5"/>
  <!-- Glowing bulb aperture -->
  <ellipse cx="49" cy="39" rx="7" ry="3.5" fill="#fef08a" stroke="#eab308" stroke-width="1"/>
  <!-- Light cone glow -->
  <polygon points="49,39 20,72 65,72" fill="#fef08a" opacity="0.15"/>
</svg>''',

    'lamp_ceiling_pendant.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 110" width="50" height="110">
  <!-- Ceiling mount cord -->
  <line x1="25" y1="0" x2="25" y2="60" stroke="#0f172a" stroke-width="2"/>
  <!-- Brass socket fitting -->
  <rect x="22" y="60" width="6" height="8" fill="#d97706" rx="1"/>
  <!-- Modern Geometric Metal Cage Shade -->
  <polygon points="25,68 44,82 25,98 6,82" fill="none" stroke="#1e293b" stroke-width="2"/>
  <line x1="25" y1="68" x2="25" y2="98" stroke="#1e293b" stroke-width="1.5"/>
  <line x1="6" y1="82" x2="44" y2="82" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Glowing Edison Filament Bulb Inside -->
  <circle cx="25" cy="82" r="6" fill="#fef08a" stroke="#f59e0b" stroke-width="1"/>
  <circle cx="25" cy="82" r="10" fill="#fef08a" opacity="0.25"/>
</svg>'''
}

def main():
    target_dir = os.path.join('assets', 'sprites')
    os.makedirs(target_dir, exist_ok=True)
    
    count = 0
    for filename, svg_content in SPRITES.items():
        filepath = os.path.join(target_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(svg_content.strip())
        print(f"Generated: {filepath}")
        count += 1
        
    print(f"\nSuccessfully created {count} new isometric library sprites.")
    print("Updating manifest.js and manifest.json...")
    update_manifest_files()

if __name__ == '__main__':
    main()

