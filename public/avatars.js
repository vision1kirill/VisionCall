/* ═══════════════════════════════════════════════════════════════
   SVG AVATARS — VisionCall  (v2 — accurate character likenesses)
   viewBox 60×60, flat-vector style optimised for 40–80 px display
═══════════════════════════════════════════════════════════════ */

window.AVATAR_LABELS = {
    po:          "По (Кунг-фу панда)",
    jesse:       "Джесси Пинкман",
    optimus:     "Оптимус Прайм",
    demogorgon:  "Демогоргон",
    sasha:       "Саша (Универ)",
    wednesday:   "Уэнздей",
    cheburashka: "Чебурашка",
    ghostface:   "Призрачное лицо",
    peacemaker:  "Миротворец",
    vaultboy:    "Волт-бой",
    mrmonopoly:  "Мистер Монополия",
    happymeal:   "Хэппи Мил"
};

window.AVATARS = {

/* ─────────────────────────────────────────────────────────────
   ПО  (Kung Fu Panda)
   Key: giant panda eye-patches · white face · black round ears
        · jade-green dragon-warrior robe
───────────────────────────────────────────────────────────── */
po: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Red kung-fu robe -->
  <path d="M4 62 Q6 46 30 42 Q54 46 56 62Z" fill="#c73e28"/>
  <path d="M4 46 Q30 40 56 46 L56 51 Q30 45 4 51Z" fill="#9e2e1a"/>
  <!-- Gold collar trim -->
  <path d="M20 44 Q30 41 40 44" stroke="#d4a520" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <!-- Black ears -->
  <circle cx="13" cy="13" r="11" fill="#111"/>
  <circle cx="47" cy="13" r="11" fill="#111"/>
  <!-- White face -->
  <circle cx="30" cy="33" r="22" fill="#f5f5f0"/>
  <!-- Large panda eye-patches (the defining feature) -->
  <ellipse cx="19" cy="26.5" rx="9.5" ry="8.5" fill="#111"/>
  <ellipse cx="41" cy="26.5" rx="9.5" ry="8.5" fill="#111"/>
  <!-- White eye area inside patch -->
  <circle cx="19" cy="27.5" r="5.5" fill="#f5f5f0"/>
  <circle cx="41" cy="27.5" r="5.5" fill="#f5f5f0"/>
  <!-- Pupils -->
  <circle cx="20" cy="28" r="3.2" fill="#111"/>
  <circle cx="42" cy="28" r="3.2" fill="#111"/>
  <!-- Eye shine -->
  <circle cx="21.4" cy="26.4" r="1.4" fill="#fff"/>
  <circle cx="43.4" cy="26.4" r="1.4" fill="#fff"/>
  <!-- Muzzle (slightly lighter circle for nose area) -->
  <ellipse cx="30" cy="37" rx="7" ry="5.5" fill="#e8e2db"/>
  <!-- Nose -->
  <ellipse cx="30" cy="34.8" rx="3.5" ry="2.6" fill="#1a1a1a"/>
  <ellipse cx="28.7" cy="35.5" rx="1.1" ry="0.8" fill="#111"/>
  <ellipse cx="31.3" cy="35.5" rx="1.1" ry="0.8" fill="#111"/>
  <!-- Big happy grin -->
  <path d="M21 41.5 Q30 49 39 41.5" stroke="#2d2d2d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   ДЖЕССИ ПИНКМАН  (Breaking Bad)
   Key: yellow skull hoodie · backwards cap · light blue eyes
        · short stubble · pale skin · street-wear attitude
───────────────────────────────────────────────────────────── */
jesse: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Yellow hoodie body -->
  <path d="M2 62 Q5 45 30 41 Q55 45 58 62Z" fill="#d97706"/>
  <!-- Hood pulled up, framing face -->
  <ellipse cx="30" cy="44" rx="25" ry="9" fill="#d97706"/>
  <!-- Skull print on chest (simplified but recognisable) -->
  <ellipse cx="30" cy="53" rx="6" ry="5" fill="#c26e04" opacity="0.85"/>
  <circle cx="28" cy="51.5" r="1.6" fill="#92400e"/>
  <circle cx="32" cy="51.5" r="1.6" fill="#92400e"/>
  <path d="M27 54.5 Q30 56.5 33 54.5" stroke="#92400e" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <!-- Backwards cap (dark, brim pointing back) -->
  <rect x="10" y="13" width="40" height="7" rx="3.5" fill="#222"/>
  <rect x="8"  y="17" width="44" height="5" rx="2.5" fill="#333"/>
  <!-- Small logo on cap -->
  <rect x="26" y="14" width="8" height="3" rx="1" fill="#444"/>
  <!-- Hair visible under cap (dark, short) -->
  <rect x="10" y="18" width="40" height="5" rx="3" fill="#3d2b1a"/>
  <!-- Face (fair, angular) -->
  <ellipse cx="30" cy="30" rx="17" ry="18" fill="#e8c29a"/>
  <!-- Jawline shadow / stubble area -->
  <ellipse cx="30" cy="41" rx="12" ry="5" fill="#d4a876" opacity="0.45"/>
  <!-- Stubble dots (simplified) -->
  <circle cx="22" cy="39" r="0.8" fill="#b08060" opacity="0.6"/>
  <circle cx="26" cy="40.5" r="0.8" fill="#b08060" opacity="0.6"/>
  <circle cx="30" cy="41" r="0.8" fill="#b08060" opacity="0.6"/>
  <circle cx="34" cy="40.5" r="0.8" fill="#b08060" opacity="0.6"/>
  <circle cx="38" cy="39" r="0.8" fill="#b08060" opacity="0.6"/>
  <!-- Ears -->
  <ellipse cx="13" cy="30" rx="4" ry="5" fill="#e0b890"/>
  <ellipse cx="47" cy="30" rx="4" ry="5" fill="#e0b890"/>
  <!-- Eyebrows (dark, slightly furrowed — troubled look) -->
  <path d="M18.5 22 Q22.5 20.5 26 21.5" stroke="#3d2b1a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M34 21.5 Q37.5 20.5 41.5 22" stroke="#3d2b1a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Eyes (light blue-grey — Aaron Paul's eyes) -->
  <ellipse cx="22.5" cy="27" rx="3.8" ry="4.2" fill="#fff"/>
  <ellipse cx="37.5" cy="27" rx="3.8" ry="4.2" fill="#fff"/>
  <circle cx="22.5" cy="27.5" r="2.5" fill="#7ba8c0"/>
  <circle cx="37.5" cy="27.5" r="2.5" fill="#7ba8c0"/>
  <circle cx="22.5" cy="27.5" r="1.4" fill="#1a1a1a"/>
  <circle cx="37.5" cy="27.5" r="1.4" fill="#1a1a1a"/>
  <circle cx="23.3" cy="26.2" r="0.75" fill="#fff"/>
  <circle cx="38.3" cy="26.2" r="0.75" fill="#fff"/>
  <!-- Nose -->
  <path d="M27.5 32 Q30 35.5 32.5 32" stroke="#c0906a" stroke-width="1.8" fill="none"/>
  <!-- Characteristic Jesse smirk -->
  <path d="M24 37 Q27.5 39.5 34 37" stroke="#b07050" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   ОПТИМУС ПРАЙМ  (Transformers G1)
   Key: blue rectangular helmet · red face plate · silver chin-guard
        · bright blue glowing rectangular eyes · side antennas
───────────────────────────────────────────────────────────── */
optimus: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Red chest/body at bottom -->
  <path d="M4 62 Q5 49 30 45 Q55 49 56 62Z" fill="#c62828"/>
  <!-- Neck (blue) -->
  <rect x="23" y="43" width="14" height="8" rx="2" fill="#1565c0"/>
  <!-- Main blue helmet block -->
  <rect x="8" y="12" width="44" height="34" rx="5" fill="#1565c0"/>
  <!-- Red forehead crest / upper face panel -->
  <rect x="8" y="12" width="44" height="17" rx="5" fill="#c62828"/>
  <!-- Blue overlap to square off bottom of red area -->
  <rect x="8" y="22" width="44" height="7" fill="#c62828"/>
  <!-- Silver mouthplate / face guard (lower half) -->
  <rect x="13" y="29" width="34" height="16" rx="3" fill="#9e9e9e"/>
  <!-- Grill lines on mouthplate -->
  <line x1="16" y1="33" x2="44" y2="33" stroke="#bdbdbd" stroke-width="1.3"/>
  <line x1="16" y1="37" x2="44" y2="37" stroke="#bdbdbd" stroke-width="1.3"/>
  <line x1="16" y1="41" x2="44" y2="41" stroke="#bdbdbd" stroke-width="1.3"/>
  <!-- Blue visor band across face -->
  <rect x="11" y="22" width="38" height="11" rx="2" fill="#0d47a1"/>
  <!-- Glowing bright-blue eyes (rectangular — G1 style) -->
  <rect x="15" y="24" width="12" height="7" rx="2" fill="#29b6f6"/>
  <rect x="33" y="24" width="12" height="7" rx="2" fill="#29b6f6"/>
  <!-- Inner eye glow (lighter centre) -->
  <rect x="16" y="25" width="6" height="3" rx="1" fill="#81d4fa" opacity="0.9"/>
  <rect x="34" y="25" width="6" height="3" rx="1" fill="#81d4fa" opacity="0.9"/>
  <!-- Left antenna -->
  <rect x="8"  y="4" width="7" height="12" rx="3" fill="#1565c0"/>
  <!-- Right antenna -->
  <rect x="45" y="4" width="7" height="12" rx="3" fill="#1565c0"/>
  <!-- Autobot symbol on forehead (simplified red/grey shape) -->
  <polygon points="30,14 33,19 37,19 34.5,22 35.5,27 30,24 24.5,27 25.5,22 23,19 27,19" fill="#e53935" opacity="0.75"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   ДЕМОГОРГОН  (Stranger Things)
   Key: NO eyes or nose — entirely defined by the flower-petal
        mouth with concentric rings of inward-pointing teeth
        on a dark, sinewy, eyeless skull-like body
───────────────────────────────────────────────────────────── */
demogorgon: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark body / background -->
  <circle cx="30" cy="30" r="30" fill="#0e0804"/>
  <!-- 8 flesh petals radiating outward (the opened flower-face) -->
  <ellipse cx="30" cy="9"  rx="6.5" ry="12" fill="#3d1a0a" transform="rotate(0   30 30)"/>
  <ellipse cx="30" cy="9"  rx="6.5" ry="12" fill="#3d1a0a" transform="rotate(45  30 30)"/>
  <ellipse cx="30" cy="9"  rx="6.5" ry="12" fill="#3d1a0a" transform="rotate(90  30 30)"/>
  <ellipse cx="30" cy="9"  rx="6.5" ry="12" fill="#3d1a0a" transform="rotate(135 30 30)"/>
  <ellipse cx="30" cy="9"  rx="6.5" ry="12" fill="#3d1a0a" transform="rotate(180 30 30)"/>
  <ellipse cx="30" cy="9"  rx="6.5" ry="12" fill="#3d1a0a" transform="rotate(225 30 30)"/>
  <ellipse cx="30" cy="9"  rx="6.5" ry="12" fill="#3d1a0a" transform="rotate(270 30 30)"/>
  <ellipse cx="30" cy="9"  rx="6.5" ry="12" fill="#3d1a0a" transform="rotate(315 30 30)"/>
  <!-- Petal vein lines -->
  <line x1="30" y1="10" x2="30" y2="19" stroke="#1a0805" stroke-width="1.2" transform="rotate(0   30 30)" opacity="0.7"/>
  <line x1="30" y1="10" x2="30" y2="19" stroke="#1a0805" stroke-width="1.2" transform="rotate(45  30 30)" opacity="0.7"/>
  <line x1="30" y1="10" x2="30" y2="19" stroke="#1a0805" stroke-width="1.2" transform="rotate(90  30 30)" opacity="0.7"/>
  <line x1="30" y1="10" x2="30" y2="19" stroke="#1a0805" stroke-width="1.2" transform="rotate(135 30 30)" opacity="0.7"/>
  <line x1="30" y1="10" x2="30" y2="19" stroke="#1a0805" stroke-width="1.2" transform="rotate(180 30 30)" opacity="0.7"/>
  <line x1="30" y1="10" x2="30" y2="19" stroke="#1a0805" stroke-width="1.2" transform="rotate(225 30 30)" opacity="0.7"/>
  <line x1="30" y1="10" x2="30" y2="19" stroke="#1a0805" stroke-width="1.2" transform="rotate(270 30 30)" opacity="0.7"/>
  <line x1="30" y1="10" x2="30" y2="19" stroke="#1a0805" stroke-width="1.2" transform="rotate(315 30 30)" opacity="0.7"/>
  <!-- Outer fleshy ring -->
  <circle cx="30" cy="30" r="17" fill="#5a200a"/>
  <!-- Outer ring of 8 teeth (pointing inward) -->
  <polygon points="30,13 27.5,19 32.5,19" fill="#ddd9c4" transform="rotate(0   30 30)"/>
  <polygon points="30,13 27.5,19 32.5,19" fill="#ddd9c4" transform="rotate(45  30 30)"/>
  <polygon points="30,13 27.5,19 32.5,19" fill="#ddd9c4" transform="rotate(90  30 30)"/>
  <polygon points="30,13 27.5,19 32.5,19" fill="#ddd9c4" transform="rotate(135 30 30)"/>
  <polygon points="30,13 27.5,19 32.5,19" fill="#ddd9c4" transform="rotate(180 30 30)"/>
  <polygon points="30,13 27.5,19 32.5,19" fill="#ddd9c4" transform="rotate(225 30 30)"/>
  <polygon points="30,13 27.5,19 32.5,19" fill="#ddd9c4" transform="rotate(270 30 30)"/>
  <polygon points="30,13 27.5,19 32.5,19" fill="#ddd9c4" transform="rotate(315 30 30)"/>
  <!-- Inner gum ring -->
  <circle cx="30" cy="30" r="11" fill="#7a2a0a"/>
  <!-- Inner ring of 8 smaller teeth -->
  <polygon points="30,19 28.5,24 31.5,24" fill="#ddd9c4" transform="rotate(0   30 30)"/>
  <polygon points="30,19 28.5,24 31.5,24" fill="#ddd9c4" transform="rotate(45  30 30)"/>
  <polygon points="30,19 28.5,24 31.5,24" fill="#ddd9c4" transform="rotate(90  30 30)"/>
  <polygon points="30,19 28.5,24 31.5,24" fill="#ddd9c4" transform="rotate(135 30 30)"/>
  <polygon points="30,19 28.5,24 31.5,24" fill="#ddd9c4" transform="rotate(180 30 30)"/>
  <polygon points="30,19 28.5,24 31.5,24" fill="#ddd9c4" transform="rotate(225 30 30)"/>
  <polygon points="30,19 28.5,24 31.5,24" fill="#ddd9c4" transform="rotate(270 30 30)"/>
  <polygon points="30,19 28.5,24 31.5,24" fill="#ddd9c4" transform="rotate(315 30 30)"/>
  <!-- Deepest void -->
  <circle cx="30" cy="30" r="7" fill="#030101"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   САША  (Универ / Jenna-Ortega's Wednesday)
   Key: very prominent THICK dark glasses · dark hair ·
        friendly student face · blue sweater
───────────────────────────────────────────────────────────── */
sasha: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Blue student sweater -->
  <path d="M4 62 Q7 45 30 42 Q53 45 56 62Z" fill="#2563eb"/>
  <!-- Neck -->
  <rect x="25" y="38" width="10" height="8" fill="#fde0b8"/>
  <!-- Ears -->
  <ellipse cx="12" cy="30" rx="5" ry="6" fill="#fde0b8"/>
  <ellipse cx="48" cy="30" rx="5" ry="6" fill="#fde0b8"/>
  <!-- Face -->
  <ellipse cx="30" cy="28" rx="18" ry="20" fill="#fde0b8"/>
  <!-- Dark hair — slightly messy student style -->
  <path d="M12 20 Q30 9 48 20 L48 26 Q40 18 30 22 Q20 18 12 26Z" fill="#2d1a0a"/>
  <rect x="12" y="18" width="36" height="9" fill="#2d1a0a"/>
  <ellipse cx="12" cy="23" rx="5.5" ry="8" fill="#2d1a0a"/>
  <ellipse cx="48" cy="23" rx="5.5" ry="8" fill="#2d1a0a"/>
  <!-- THICK DARK GLASSES — the signature feature (very prominent frames) -->
  <!-- Left lens outer frame -->
  <rect x="9"  y="24" width="18" height="13" rx="4.5" fill="#1a1a1a"/>
  <!-- Left lens glass -->
  <rect x="11" y="26" width="14" height="9"  rx="3"   fill="#d0e0f8" opacity="0.35"/>
  <!-- Right lens outer frame -->
  <rect x="33" y="24" width="18" height="13" rx="4.5" fill="#1a1a1a"/>
  <!-- Right lens glass -->
  <rect x="35" y="26" width="14" height="9"  rx="3"   fill="#d0e0f8" opacity="0.35"/>
  <!-- Nose bridge -->
  <rect x="27" y="28" width="6" height="3" rx="1.5" fill="#1a1a1a"/>
  <!-- Temple arms -->
  <line x1="9"  y1="29" x2="4"  y2="28" stroke="#1a1a1a" stroke-width="2.8" stroke-linecap="round"/>
  <line x1="51" y1="29" x2="56" y2="28" stroke="#1a1a1a" stroke-width="2.8" stroke-linecap="round"/>
  <!-- Eyes behind glasses -->
  <circle cx="18" cy="30.5" r="3.5" fill="#5c3a18"/>
  <circle cx="42" cy="30.5" r="3.5" fill="#5c3a18"/>
  <circle cx="18" cy="30.5" r="2"   fill="#1a0d06"/>
  <circle cx="42" cy="30.5" r="2"   fill="#1a0d06"/>
  <circle cx="19" cy="29.3" r="1"   fill="#fff"/>
  <circle cx="43" cy="29.3" r="1"   fill="#fff"/>
  <!-- Nose -->
  <path d="M28 37 Q30 40 32 37" stroke="#c8896b" stroke-width="1.6" fill="none"/>
  <!-- Warm goofy smile -->
  <path d="M22 42 Q30 48 38 42" stroke="#c08060" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   УЭНЗДЕЙ  (Wednesday — Netflix)
   Key: porcelain pale skin · jet-black center-parted double
        braids · white lace collar · black dress · flat deadpan
        expression · large dark heavy-lidded eyes
───────────────────────────────────────────────────────────── */
wednesday: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Black dress -->
  <path d="M4 62 Q7 46 30 43 Q53 46 56 62Z" fill="#0d0d0d"/>
  <!-- White lace collar (Peter Pan collar style) -->
  <path d="M17 46 Q30 41 43 46 L41 51 Q30 47 19 51Z" fill="#f0f0f0"/>
  <!-- Lace collar detail -->
  <path d="M17 46 Q30 41 43 46" stroke="#ddd" stroke-width="1.2" fill="none" stroke-dasharray="3,2"/>
  <!-- Neck -->
  <rect x="25.5" y="39" width="9" height="8" fill="#f0ede6"/>
  <!-- Ears -->
  <ellipse cx="12" cy="30" rx="4.5" ry="5.5" fill="#f0ede6"/>
  <ellipse cx="48" cy="30" rx="4.5" ry="5.5" fill="#f0ede6"/>
  <!-- Face — porcelain pale -->
  <ellipse cx="30" cy="28" rx="17" ry="20" fill="#f0ede6"/>
  <!-- Hair: black, center-parted, going straight down into braids -->
  <path d="M13 19 Q30 8 47 19 L47 25 Q38 18 30 22 Q22 18 13 25Z" fill="#0d0d0d"/>
  <!-- Left braid column -->
  <rect x="10" y="23" width="7.5" height="28" rx="3.8" fill="#0d0d0d"/>
  <!-- Braid cross-hatching left -->
  <line x1="10.5" y1="28" x2="17" y2="28" stroke="#222" stroke-width="2"/>
  <line x1="10.5" y1="33" x2="17" y2="33" stroke="#222" stroke-width="2"/>
  <line x1="10.5" y1="38" x2="17" y2="38" stroke="#222" stroke-width="2"/>
  <line x1="10.5" y1="43" x2="17" y2="43" stroke="#222" stroke-width="2"/>
  <!-- Right braid column -->
  <rect x="42.5" y="23" width="7.5" height="28" rx="3.8" fill="#0d0d0d"/>
  <!-- Braid cross-hatching right -->
  <line x1="43" y1="28" x2="49.5" y2="28" stroke="#222" stroke-width="2"/>
  <line x1="43" y1="33" x2="49.5" y2="33" stroke="#222" stroke-width="2"/>
  <line x1="43" y1="38" x2="49.5" y2="38" stroke="#222" stroke-width="2"/>
  <line x1="43" y1="43" x2="49.5" y2="43" stroke="#222" stroke-width="2"/>
  <!-- Eyebrows: thin, very straight, slightly elevated — the signature Wednesday look -->
  <line x1="17" y1="21" x2="27" y2="21" stroke="#0d0d0d" stroke-width="2.3" stroke-linecap="round"/>
  <line x1="33" y1="21" x2="43" y2="21" stroke="#0d0d0d" stroke-width="2.3" stroke-linecap="round"/>
  <!-- Large dark heavy-lidded eyes -->
  <ellipse cx="22" cy="27.5" rx="5"   ry="5.5"  fill="#fff"/>
  <ellipse cx="38" cy="27.5" rx="5"   ry="5.5"  fill="#fff"/>
  <!-- Dark irises -->
  <circle  cx="22" cy="28"   r="4"              fill="#1a0d0d"/>
  <circle  cx="38" cy="28"   r="4"              fill="#1a0d0d"/>
  <circle  cx="22" cy="28"   r="2.4"            fill="#0d0d0d"/>
  <circle  cx="38" cy="28"   r="2.4"            fill="#0d0d0d"/>
  <!-- Eye shine -->
  <circle  cx="22.9" cy="26.3" r="1.1"          fill="#fff"/>
  <circle  cx="38.9" cy="26.3" r="1.1"          fill="#fff"/>
  <!-- Nose (small, delicate) -->
  <path d="M28.5 34 Q30 36.5 31.5 34" stroke="#ccc5ba" stroke-width="1.4" fill="none"/>
  <!-- DEADPAN flat mouth — no emotion -->
  <line x1="25" y1="38.5" x2="35" y2="38.5" stroke="#c0b8ae" stroke-width="1.9" stroke-linecap="round"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   ЧЕБУРАШКА  (Soviet cartoon)
   Key: ENORMOUS round ears on the sides (as big as the head) ·
        huge black eyes with big white reflections · warm medium-
        brown fur · lighter muzzle area · tiny gentle mouth
───────────────────────────────────────────────────────────── */
cheburashka: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Body / torso suggestion -->
  <ellipse cx="30" cy="57" rx="15" ry="8" fill="#c47a3a"/>
  <!-- HUGE ears — the defining feature (large circles on sides) -->
  <!-- Left ear outer -->
  <circle cx="7"  cy="27" r="13" fill="#c47a3a"/>
  <circle cx="7"  cy="27" r="9"  fill="#da9050"/>
  <circle cx="7"  cy="27" r="5"  fill="#c47a3a"/>
  <!-- Right ear outer -->
  <circle cx="53" cy="27" r="13" fill="#c47a3a"/>
  <circle cx="53" cy="27" r="9"  fill="#da9050"/>
  <circle cx="53" cy="27" r="5"  fill="#c47a3a"/>
  <!-- Head (round) -->
  <circle cx="30" cy="30" r="21" fill="#c47a3a"/>
  <!-- Lighter face/muzzle zone -->
  <ellipse cx="30" cy="35" rx="14" ry="11" fill="#da9050"/>
  <!-- HUGE eyes (dominant feature — nearly 1/3 of face width each) -->
  <!-- Left eye whites -->
  <circle cx="19.5" cy="25.5" r="10.5" fill="#fff"/>
  <!-- Left iris -->
  <circle cx="19.5" cy="26"   r="7"    fill="#1a0d06"/>
  <!-- Left pupil -->
  <circle cx="19.5" cy="26"   r="4"    fill="#0a0603"/>
  <!-- Left eye shine (large — key to Cheburashka's cuteness) -->
  <circle cx="17.5" cy="23"   r="3"    fill="#fff"/>
  <!-- Right eye whites -->
  <circle cx="40.5" cy="25.5" r="10.5" fill="#fff"/>
  <circle cx="40.5" cy="26"   r="7"    fill="#1a0d06"/>
  <circle cx="40.5" cy="26"   r="4"    fill="#0a0603"/>
  <circle cx="38.5" cy="23"   r="3"    fill="#fff"/>
  <!-- Nose (small button) -->
  <ellipse cx="30" cy="33" rx="3" ry="2.5" fill="#7b3a12"/>
  <!-- Tiny gentle smile -->
  <path d="M25 38.5 Q30 43 35 38.5" stroke="#7b3a12" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   ПРИЗРАЧНОЕ ЛИЦО / GHOSTFACE  (Scream)
   Key: iconic white elongated ghost/teardrop mask · two black
        almond eye-holes · open screaming O-shaped mouth ·
        billowing black hood / robe
───────────────────────────────────────────────────────────── */
ghostface: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Black robe / hood filling canvas -->
  <circle cx="30" cy="30" r="30" fill="#111"/>
  <ellipse cx="30" cy="18" rx="28" ry="26" fill="#0d0d0d"/>
  <!-- THE MASK — elongated teardrop ghost shape (Edvard Munch inspired) -->
  <path d="M30 4
           Q43 6  46 21
           Q49 35 43 45
           Q39 54 30 57
           Q21 54 17 45
           Q11 35 14 21
           Q17 6  30 4Z" fill="#f4f4f0"/>
  <!-- Mask surface texture / highlight -->
  <path d="M30 5 Q39 8 42 18" stroke="#e0e0dc" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.6"/>
  <!-- Shadow on right side -->
  <path d="M43 24 Q46 32 43 44" stroke="#ddd" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.15"/>
  <!-- Left eye-hole (black oval, slightly tilted) -->
  <ellipse cx="22.5" cy="23" rx="5.5" ry="7.5" fill="#0d0d0d"/>
  <!-- Right eye-hole -->
  <ellipse cx="37.5" cy="23" rx="5.5" ry="7.5" fill="#0d0d0d"/>
  <!-- Nose area (subtle shadow — mask has no nose-hole) -->
  <ellipse cx="30" cy="34" rx="3.5" ry="5" fill="#e8e8e4" opacity="0.5"/>
  <!-- SCREAMING MOUTH — wide open, inspired by The Scream painting -->
  <path d="M21 41
           Q24 37.5 27.5 39.5
           Q29 36.5 30.5 39.5
           Q34 37.5 39 41
           Q38 49 30 52
           Q22 49 21 41Z" fill="#0d0d0d"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   МИРОТВОРЕЦ  (Peacemaker — HBO)
   Key: COMICALLY OVERSIZED chrome dome helmet · white peace
        symbol (dove / circle-and-lines) on front · red suit ·
        strong jaw barely visible below the dome
───────────────────────────────────────────────────────────── */
peacemaker: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Red suit at bottom -->
  <path d="M4 62 Q7 49 30 47 Q53 49 56 62Z" fill="#c62828"/>
  <!-- White stripes on suit (DC costume detail) -->
  <path d="M4 53 Q7 51 30 50 Q53 51 56 53 L56 56 Q53 54 30 53 Q7 54 4 56Z" fill="#fff" opacity="0.5"/>
  <!-- Skin at jaw / chin (barely visible below helmet) -->
  <ellipse cx="30" cy="48" rx="11" ry="5" fill="#d4a574"/>
  <!-- THE HELMET — large chrome dome (the main visual) -->
  <ellipse cx="30" cy="25" rx="26" ry="30" fill="#bdbdbd"/>
  <!-- Chrome sheen highlights -->
  <ellipse cx="21" cy="12" rx="9" ry="5.5" fill="#e8e8e8" opacity="0.75" transform="rotate(-25 21 12)"/>
  <ellipse cx="17" cy="18" rx="5" ry="3"   fill="#f5f5f5" opacity="0.55" transform="rotate(-30 17 18)"/>
  <!-- Bottom shadow of helmet -->
  <ellipse cx="30" cy="52" rx="24" ry="4"  fill="#9e9e9e" opacity="0.35"/>
  <!-- Helmet visor / eye slot -->
  <rect x="12" y="27" width="36" height="12" rx="4" fill="#263238"/>
  <!-- Visor glow -->
  <rect x="14" y="29" width="14" height="8" rx="2.5" fill="#1565c0" opacity="0.7"/>
  <rect x="32" y="29" width="14" height="8" rx="2.5" fill="#1565c0" opacity="0.7"/>
  <!-- ★ PEACE SYMBOL — the single most recognisable Peacemaker element ★ -->
  <!-- Peace symbol circle -->
  <circle cx="30" cy="15" r="10" fill="none" stroke="#f5f5f5" stroke-width="2.5"/>
  <!-- Vertical stem -->
  <line x1="30" y1="5"  x2="30" y2="25" stroke="#f5f5f5" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Left branch (Y fork — left diagonal) -->
  <line x1="30" y1="25" x2="22.9" y2="20" stroke="#f5f5f5" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Right branch (Y fork — right diagonal) -->
  <line x1="30" y1="25" x2="37.1" y2="20" stroke="#f5f5f5" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   ВОЛТ-БОЙ  (Fallout)
   Key: 1950s retro cartoon style · golden blonde hair combed
        to side · blue vault suit (Vault 101) with yellow stripe
        · enormous white-teeth grin · big round blue eyes ·
        thumbs-up hand gesture
───────────────────────────────────────────────────────────── */
vaultboy: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Blue vault jumpsuit body -->
  <path d="M4 62 Q7 44 30 41 Q53 44 56 62Z" fill="#1a5276"/>
  <!-- Yellow horizontal stripe on suit (signature Vault-Tec detail) -->
  <path d="M4 52 Q7 50 30 49 Q53 50 56 52 L56 57 Q53 55 30 54 Q7 55 4 57Z" fill="#f4d03f"/>
  <!-- "101" number patch -->
  <rect x="19" y="48" width="22" height="7" rx="2" fill="#f4d03f"/>
  <text x="30" y="54" text-anchor="middle" font-size="5.5" font-weight="bold" fill="#1a5276" font-family="monospace">101</text>
  <!-- Neck -->
  <rect x="25" y="37" width="10" height="8" fill="#f0c8a0"/>
  <!-- Big round cartoon head -->
  <circle cx="30" cy="25" r="21" fill="#f0c8a0"/>
  <!-- Blonde 1950s-style hair combed to side with retro wave -->
  <ellipse cx="30" cy="7" rx="19" ry="9" fill="#ffd700"/>
  <rect x="11" y="7"  width="38" height="9" fill="#ffd700"/>
  <!-- Side hair coming down slightly -->
  <ellipse cx="12" cy="16" rx="5" ry="7" fill="#ffd700"/>
  <!-- Hair wave / direction detail -->
  <path d="M13 9 Q22 5 36 8 Q44 10 47 14" stroke="#c8a800" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Large round cartoon eyes (Vault Boy style) -->
  <circle cx="20.5" cy="23" r="7.5" fill="#fff"/>
  <circle cx="39.5" cy="23" r="7.5" fill="#fff"/>
  <!-- Blue irises -->
  <circle cx="21"   cy="23.5" r="5"   fill="#1565c0"/>
  <circle cx="40"   cy="23.5" r="5"   fill="#1565c0"/>
  <!-- Pupils -->
  <circle cx="21"   cy="23.5" r="2.8" fill="#0d0d0d"/>
  <circle cx="40"   cy="23.5" r="2.8" fill="#0d0d0d"/>
  <!-- Eye shines (big — cartoon style) -->
  <circle cx="19.5" cy="21.5" r="2" fill="#fff"/>
  <circle cx="38.5" cy="21.5" r="2" fill="#fff"/>
  <!-- SIGNATURE HUGE GRIN with visible teeth -->
  <path d="M14 34 Q30 48 46 34 Q45 40 30 43 Q15 40 14 34Z" fill="#fff"/>
  <path d="M14 34 Q30 48 46 34" stroke="#c8956b" stroke-width="1.5" fill="none"/>
  <!-- Tooth separators -->
  <line x1="19" y1="34.5" x2="19" y2="41"  stroke="#c8956b" stroke-width="1.2"/>
  <line x1="23" y1="35.5" x2="23" y2="42"  stroke="#c8956b" stroke-width="1.2"/>
  <line x1="27" y1="36"   x2="27" y2="42.5" stroke="#c8956b" stroke-width="1.2"/>
  <line x1="30" y1="36.5" x2="30" y2="43"  stroke="#c8956b" stroke-width="1.2"/>
  <line x1="33" y1="36"   x2="33" y2="42.5" stroke="#c8956b" stroke-width="1.2"/>
  <line x1="37" y1="35.5" x2="37" y2="42"  stroke="#c8956b" stroke-width="1.2"/>
  <line x1="41" y1="34.5" x2="41" y2="41"  stroke="#c8956b" stroke-width="1.2"/>
  <!-- THUMBS UP (right side — the iconic Vault Boy pose) -->
  <rect  x="48" y="34" width="9"  height="12" rx="4.5" fill="#f0c8a0"/>
  <ellipse cx="47.5" cy="31" rx="4.5" ry="6" fill="#f0c8a0" transform="rotate(-15 47.5 31)"/>
  <!-- White glove cuff -->
  <rect  x="47" y="40" width="11" height="4"  rx="2"   fill="#f5f5f5"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   МИСТЕР МОНОПОЛИЯ / Milburn Pennybags
   Key: tall black top hat · large white handlebar moustache ·
        gold monocle with chain · red bow-tie · black tuxedo ·
        rosy cheeks on portly dignified face
───────────────────────────────────────────────────────────── */
mrmonopoly: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Black tuxedo -->
  <path d="M4 62 Q8 46 30 43 Q52 46 56 62Z" fill="#1a1a1a"/>
  <!-- White shirt front / waistcoat -->
  <path d="M25 48 L30 44 L35 48 L33 62 L27 62Z" fill="#f5f5f5"/>
  <!-- Red bow tie (very distinctive) -->
  <path d="M26 47 L30 44 L34 47 L30 49.5Z" fill="#c62828"/>
  <!-- White collar -->
  <path d="M21 47 Q25 44 30 43 Q35 44 39 47 L37 49 Q30 46.5 23 49Z" fill="#f5f5f5"/>
  <!-- Neck -->
  <rect x="25.5" y="39" width="9" height="7" fill="#d4a574"/>
  <!-- Face — portly elderly gentleman -->
  <ellipse cx="30" cy="27" rx="17.5" ry="19" fill="#d4a574"/>
  <!-- White hair on temples (distinguished older man) -->
  <ellipse cx="12" cy="27" rx="5.5" ry="7.5" fill="#e8e0d0"/>
  <ellipse cx="48" cy="27" rx="5.5" ry="7.5" fill="#e8e0d0"/>
  <!-- ★ TOP HAT — the single most iconic feature ★ -->
  <!-- Wide brim -->
  <rect x="7"  y="16" width="46" height="6"  rx="3"   fill="#1a1a1a"/>
  <!-- Tall crown -->
  <rect x="16" y="2"  width="28" height="16" rx="2.5" fill="#1a1a1a"/>
  <!-- Hat band (subtle detail) -->
  <rect x="16" y="13" width="28" height="3.5" fill="#2a2a2a"/>
  <!-- Rosy cheeks -->
  <circle cx="17" cy="30" r="5.5" fill="#e87878" opacity="0.5"/>
  <circle cx="43" cy="30" r="5.5" fill="#e87878" opacity="0.5"/>
  <!-- Eyebrows (grey, bushy) -->
  <path d="M18.5 22.5 Q22.5 21 26.5 22" stroke="#a0a090" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M33.5 22 Q37.5 21 41.5 22.5" stroke="#a0a090" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Left eye -->
  <circle cx="23" cy="26" r="4" fill="#fff"/>
  <circle cx="23" cy="26.5" r="2.5" fill="#2a2a2a"/>
  <circle cx="24" cy="25.2" r="1.1" fill="#fff"/>
  <!-- Right eye -->
  <circle cx="37" cy="26" r="4" fill="#fff"/>
  <circle cx="37" cy="26.5" r="2.5" fill="#2a2a2a"/>
  <circle cx="38" cy="25.2" r="1.1" fill="#fff"/>
  <!-- ★ MONOCLE on right eye (gold, with chain) ★ -->
  <circle cx="37" cy="26" r="6.5" fill="none" stroke="#c8a820" stroke-width="2.2"/>
  <line x1="42.5" y1="31"  x2="45" y2="36" stroke="#c8a820" stroke-width="1.8" stroke-linecap="round"/>
  <!-- ★ BIG WHITE HANDLEBAR MOUSTACHE (very distinctive) ★ -->
  <path d="M18 33 Q22 38 30 35 Q38 38 42 33 Q38 30 30 33 Q22 30 18 33Z" fill="#e8e0d0"/>
  <!-- Moustache curl tips (handlebar ends curl up) -->
  <path d="M18 33 Q16 29.5 17.5 27.5" stroke="#e0d8c8" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M42 33 Q44 29.5 42.5 27.5" stroke="#e0d8c8" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <!-- Smile visible below moustache -->
  <path d="M23 38 Q30 43 37 38" stroke="#c0906a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`,

/* ─────────────────────────────────────────────────────────────
   ХЭППИ МИЛ с глазками  (McDonald's retro mascot)
   Key: red square Happy Meal box as the face/head · golden M
        arches logo · large cartoon eyes with eyelashes ·
        big red smile · carrying handle on top
───────────────────────────────────────────────────────────── */
happymeal: `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
  <!-- Handle tabs at top -->
  <path d="M22 4 Q30 0 38 4 L37 9 Q30 6 23 9Z" fill="#c53030"/>
  <!-- Main red box body (this IS the character) -->
  <rect x="6"  y="8"  width="48" height="50" rx="4" fill="#e53e3e"/>
  <!-- Side shadow for depth -->
  <rect x="6"  y="8"  width="7"  height="50" rx="2" fill="#c53030"/>
  <rect x="47" y="8"  width="7"  height="50" rx="2" fill="#c53030"/>
  <!-- Top fold crease -->
  <rect x="6"  y="8"  width="48" height="7"  rx="3" fill="#d03535"/>
  <!-- ★ GOLDEN ARCHES M logo (iconic McDonald's branding) ★ -->
  <path d="M17 36 Q17 25 23 25 Q28 25 28 31 Q28 25 33 25 Q38 25 38 36"
        fill="none" stroke="#fbbf24" stroke-width="5.5" stroke-linecap="round"/>
  <!-- Big cartoon EYES (above the arches) -->
  <!-- Left eye white -->
  <circle cx="19" cy="47" r="8"   fill="#fff"/>
  <!-- Left iris -->
  <circle cx="20" cy="48" r="5"   fill="#1565c0"/>
  <!-- Left pupil -->
  <circle cx="20" cy="48" r="2.8" fill="#0d0d0d"/>
  <!-- Left shine -->
  <circle cx="18.5" cy="46" r="1.8" fill="#fff"/>
  <!-- Right eye white -->
  <circle cx="41" cy="47" r="8"   fill="#fff"/>
  <circle cx="42" cy="48" r="5"   fill="#1565c0"/>
  <circle cx="42" cy="48" r="2.8" fill="#0d0d0d"/>
  <circle cx="40.5" cy="46" r="1.8" fill="#fff"/>
  <!-- Eyelashes left (3 lashes — gives the retro mascot personality) -->
  <line x1="12.5" y1="41.5" x2="10"  y2="37.5" stroke="#0d0d0d" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="18"   y1="40"   x2="17"  y2="36.5" stroke="#0d0d0d" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="23.5" y1="41"   x2="26"  y2="37.5" stroke="#0d0d0d" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Eyelashes right -->
  <line x1="36.5" y1="41"   x2="34"  y2="37.5" stroke="#0d0d0d" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="42"   y1="40"   x2="42"  y2="36.5" stroke="#0d0d0d" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="47.5" y1="41.5" x2="50"  y2="37.5" stroke="#0d0d0d" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Big smile on the box -->
  <path d="M21 56 Q30 62 39 56" stroke="#c53030" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`

}; /* end window.AVATARS */
