// Marvel Avengers Avatars v4
window.AVATAR_LABELS = {
  ironman:      "Железный человек",
  cap:          "Капитан Америка",
  thor:         "Тор",
  hulk:         "Халк",
  spiderman:    "Человек-паук",
  blackwidow:   "Чёрная вдова",
  hawkeye:      "Соколиный глаз",
  gwenspider:   "Гвен-паук",
  miles:        "Майлз Моралес",
  blackpanther: "Чёрная пантера",
  vision:       "Вижн",
  scarletwitch: "Алая ведьма",
  groot:        "Грут",
  rocket:       "Ракета",
  gamora:       "Гамора",
  starlord:     "Звёздный лорд",
  drax:         "Дракс"
};

window.AVATARS = {

/* ── IRON MAN ── */
ironman: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- neck -->
  <rect x="24" y="44" width="12" height="6" rx="2" fill="#b22222"/>
  <!-- helmet body -->
  <rect x="14" y="18" width="32" height="28" rx="8" fill="#cc2200"/>
  <!-- gold face-plate bottom -->
  <rect x="16" y="34" width="28" height="10" rx="4" fill="#d4a017"/>
  <!-- gold chin -->
  <ellipse cx="30" cy="44" rx="8" ry="4" fill="#d4a017"/>
  <!-- eye slits -->
  <rect x="17" y="26" width="10" height="5" rx="2" fill="#00cfff" opacity="0.95"/>
  <rect x="33" y="26" width="10" height="5" rx="2" fill="#00cfff" opacity="0.95"/>
  <!-- eye glow -->
  <rect x="17" y="26" width="10" height="5" rx="2" fill="white" opacity="0.35"/>
  <rect x="33" y="26" width="10" height="5" rx="2" fill="white" opacity="0.35"/>
  <!-- top helmet ridge -->
  <rect x="22" y="14" width="16" height="6" rx="3" fill="#cc2200"/>
  <rect x="26" y="12" width="8" height="5" rx="2" fill="#b22222"/>
  <!-- side panels -->
  <rect x="14" y="24" width="5" height="12" rx="2" fill="#a01800"/>
  <rect x="41" y="24" width="5" height="12" rx="2" fill="#a01800"/>
  <!-- arc reactor chest hint -->
  <circle cx="30" cy="52" r="3" fill="#00cfff" opacity="0.8"/>
  <circle cx="30" cy="52" r="1.5" fill="white" opacity="0.7"/>
  <!-- cheek lines -->
  <line x1="19" y1="33" x2="24" y2="33" stroke="#a01800" stroke-width="1.2"/>
  <line x1="36" y1="33" x2="41" y2="33" stroke="#a01800" stroke-width="1.2"/>
</svg>`,

/* ── CAPTAIN AMERICA ── */
cap: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- neck -->
  <rect x="24" y="44" width="12" height="6" rx="2" fill="#f5c9a0"/>
  <!-- helmet -->
  <ellipse cx="30" cy="28" rx="17" ry="18" fill="#1a3a8c"/>
  <!-- face opening -->
  <ellipse cx="30" cy="32" rx="11" ry="13" fill="#f5c9a0"/>
  <!-- chin strap -->
  <path d="M19 36 Q30 46 41 36" stroke="#1a3a8c" stroke-width="2.5" fill="none"/>
  <!-- helmet top ridge A -->
  <polygon points="30,11 26,19 34,19" fill="white"/>
  <!-- wing left -->
  <path d="M13 25 Q8 22 9 30 Q13 28 15 30" fill="white"/>
  <!-- wing right -->
  <path d="M47 25 Q52 22 51 30 Q47 28 45 30" fill="white"/>
  <!-- eyes -->
  <ellipse cx="24" cy="30" rx="3.5" ry="3" fill="white"/>
  <ellipse cx="36" cy="30" rx="3.5" ry="3" fill="white"/>
  <circle cx="24" cy="30" r="2" fill="#2a2a5c"/>
  <circle cx="36" cy="30" r="2" fill="#2a2a5c"/>
  <circle cx="25" cy="29" r="0.7" fill="white"/>
  <circle cx="37" cy="29" r="0.7" fill="white"/>
  <!-- nose -->
  <ellipse cx="30" cy="35" rx="1.5" ry="1" fill="#e0a070"/>
  <!-- mouth -->
  <path d="M26 39 Q30 42 34 39" stroke="#c07850" stroke-width="1.3" fill="none"/>
  <!-- shield on chest -->
  <circle cx="30" cy="53" r="5" fill="#cc1111"/>
  <circle cx="30" cy="53" r="3.5" fill="white"/>
  <circle cx="30" cy="53" r="2" fill="#1a3a8c"/>
  <polygon points="30,51 29,54 31,54" fill="white"/>
</svg>`,

/* ── THOR ── */
thor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- long blonde hair back -->
  <ellipse cx="30" cy="36" rx="18" ry="16" fill="#e8c040"/>
  <!-- neck -->
  <rect x="24" y="44" width="12" height="7" rx="2" fill="#f5c9a0"/>
  <!-- face -->
  <ellipse cx="30" cy="30" rx="14" ry="16" fill="#f5c9a0"/>
  <!-- winged helmet -->
  <path d="M16 22 Q30 10 44 22 Q40 16 30 14 Q20 16 16 22Z" fill="#c0c0c0"/>
  <!-- helmet band -->
  <rect x="15" y="20" width="30" height="5" rx="2" fill="#a8a8a8"/>
  <!-- left wing -->
  <path d="M15 22 Q6 18 7 26 Q11 24 15 26Z" fill="#c8c8c8"/>
  <!-- right wing -->
  <path d="M45 22 Q54 18 53 26 Q49 24 45 26Z" fill="#c8c8c8"/>
  <!-- eyes -->
  <ellipse cx="24" cy="30" rx="3.5" ry="3" fill="white"/>
  <ellipse cx="36" cy="30" rx="3.5" ry="3" fill="white"/>
  <circle cx="24" cy="30" r="2" fill="#1e5fa0"/>
  <circle cx="36" cy="30" r="2" fill="#1e5fa0"/>
  <circle cx="25" cy="29" r="0.7" fill="white"/>
  <circle cx="37" cy="29" r="0.7" fill="white"/>
  <!-- eyebrows strong -->
  <path d="M20 26 Q24 24 28 26" stroke="#c08030" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M32 26 Q36 24 40 26" stroke="#c08030" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <!-- nose -->
  <ellipse cx="30" cy="34" rx="1.5" ry="1.2" fill="#e0a070"/>
  <!-- beard stubble -->
  <path d="M23 40 Q30 44 37 40" stroke="#c08030" stroke-width="1.5" fill="none"/>
  <!-- mouth -->
  <path d="M26 38 Q30 41 34 38" stroke="#b07040" stroke-width="1.2" fill="none"/>
  <!-- red cape hint -->
  <path d="M12 45 Q30 50 48 45 L48 55 Q30 60 12 55Z" fill="#cc1111"/>
  <!-- lightning bolt emblem -->
  <path d="M28 48 L32 51 L29 51 L33 56 L29 53 L31 53Z" fill="#ffe040" stroke="#c0a000" stroke-width="0.5"/>
</svg>`,

/* ── HULK ── */
hulk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- massive shoulders -->
  <ellipse cx="30" cy="54" rx="22" ry="8" fill="#4a7c3f"/>
  <!-- neck thick -->
  <rect x="21" y="42" width="18" height="10" rx="4" fill="#4a7c3f"/>
  <!-- huge face -->
  <ellipse cx="30" cy="28" rx="19" ry="20" fill="#5a9e4a"/>
  <!-- dark hair messy -->
  <ellipse cx="30" cy="14" rx="16" ry="8" fill="#1a1a1a"/>
  <path d="M14 18 Q10 12 16 10 Q20 8 18 16Z" fill="#1a1a1a"/>
  <path d="M46 18 Q50 12 44 10 Q40 8 42 16Z" fill="#1a1a1a"/>
  <path d="M22 10 Q24 6 28 8 Q26 10 24 12Z" fill="#1a1a1a"/>
  <path d="M38 10 Q36 6 32 8 Q34 10 36 12Z" fill="#1a1a1a"/>
  <!-- brow ridge angry -->
  <path d="M12 24 Q21 18 28 22" stroke="#2a5a20" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M48 24 Q39 18 32 22" stroke="#2a5a20" stroke-width="4" fill="none" stroke-linecap="round"/>
  <!-- eyes angry -->
  <ellipse cx="22" cy="26" rx="4" ry="3.5" fill="#228B22"/>
  <ellipse cx="38" cy="26" rx="4" ry="3.5" fill="#228B22"/>
  <circle cx="22" cy="26" r="2.5" fill="#006600"/>
  <circle cx="38" cy="26" r="2.5" fill="#006600"/>
  <circle cx="23" cy="25" r="0.8" fill="white"/>
  <circle cx="39" cy="25" r="0.8" fill="white"/>
  <!-- nose wide -->
  <ellipse cx="30" cy="33" rx="3" ry="2.5" fill="#3a7a30"/>
  <circle cx="28" cy="34" r="1.5" fill="#2a6020"/>
  <circle cx="32" cy="34" r="1.5" fill="#2a6020"/>
  <!-- mouth growling -->
  <path d="M20 40 Q30 36 40 40" stroke="#2a5a20" stroke-width="2" fill="none"/>
  <path d="M22 40 Q30 45 38 40" fill="#1a1a1a"/>
  <!-- teeth -->
  <rect x="25" y="40" width="4" height="4" rx="1" fill="white"/>
  <rect x="31" y="40" width="4" height="4" rx="1" fill="white"/>
  <!-- purple shorts hint -->
  <rect x="18" y="52" width="24" height="8" rx="3" fill="#6a3fa0"/>
</svg>`,

/* ── SPIDER-MAN (Peter) ── */
spiderman: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- body blue -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#1a3fa0"/>
  <!-- red torso top -->
  <rect x="16" y="44" width="28" height="10" rx="4" fill="#cc1111"/>
  <!-- red head mask -->
  <ellipse cx="30" cy="28" rx="17" ry="19" fill="#cc1111"/>
  <!-- black web lines on mask -->
  <line x1="30" y1="9" x2="30" y2="47" stroke="#111" stroke-width="0.8"/>
  <line x1="13" y1="18" x2="47" y2="38" stroke="#111" stroke-width="0.8"/>
  <line x1="47" y1="18" x2="13" y2="38" stroke="#111" stroke-width="0.8"/>
  <line x1="13" y1="28" x2="47" y2="28" stroke="#111" stroke-width="0.8"/>
  <!-- horizontal web arcs -->
  <ellipse cx="30" cy="20" rx="8" ry="4" fill="none" stroke="#111" stroke-width="0.7"/>
  <ellipse cx="30" cy="28" rx="14" ry="7" fill="none" stroke="#111" stroke-width="0.7"/>
  <ellipse cx="30" cy="36" rx="16" ry="7" fill="none" stroke="#111" stroke-width="0.7"/>
  <!-- large white eyes -->
  <ellipse cx="22" cy="27" rx="6.5" ry="5" fill="white"/>
  <ellipse cx="38" cy="27" rx="6.5" ry="5" fill="white"/>
  <!-- eye inner sheen -->
  <ellipse cx="22" cy="27" rx="5" ry="3.8" fill="#e0e0e0"/>
  <ellipse cx="38" cy="27" rx="5" ry="3.8" fill="#e0e0e0"/>
  <!-- eye white highlight -->
  <ellipse cx="21" cy="25.5" rx="2" ry="1.5" fill="white" opacity="0.6"/>
  <ellipse cx="37" cy="25.5" rx="2" ry="1.5" fill="white" opacity="0.6"/>
  <!-- spider symbol on chest -->
  <ellipse cx="30" cy="49" rx="4" ry="2.5" fill="#111"/>
  <line x1="26" y1="49" x2="24" y2="52" stroke="#111" stroke-width="1.2"/>
  <line x1="26" y1="49" x2="23" y2="47" stroke="#111" stroke-width="1.2"/>
  <line x1="34" y1="49" x2="36" y2="52" stroke="#111" stroke-width="1.2"/>
  <line x1="34" y1="49" x2="37" y2="47" stroke="#111" stroke-width="1.2"/>
</svg>`,

/* ── BLACK WIDOW ── */
blackwidow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- black suit body -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#1a1a1a"/>
  <!-- belt with hourglass -->
  <rect x="18" y="44" width="24" height="5" rx="2" fill="#333"/>
  <ellipse cx="30" cy="46.5" rx="4" ry="2.5" fill="#cc1111"/>
  <!-- neck -->
  <rect x="24" y="41" width="12" height="5" rx="2" fill="#f0c090"/>
  <!-- face -->
  <ellipse cx="30" cy="28" rx="14" ry="16" fill="#f0c090"/>
  <!-- auburn hair -->
  <ellipse cx="30" cy="20" rx="15" ry="12" fill="#8b2500"/>
  <!-- hair sides flowing -->
  <path d="M16 24 Q10 30 12 40 Q16 38 18 34 Q16 28 18 24Z" fill="#8b2500"/>
  <path d="M44 24 Q50 30 48 40 Q44 38 42 34 Q44 28 42 24Z" fill="#8b2500"/>
  <!-- hair highlights -->
  <path d="M22 14 Q26 10 30 12 Q28 16 24 16Z" fill="#b03010"/>
  <!-- eyes -->
  <ellipse cx="24" cy="30" rx="3.5" ry="3" fill="white"/>
  <ellipse cx="36" cy="30" rx="3.5" ry="3" fill="white"/>
  <circle cx="24" cy="30" r="2.2" fill="#2a6030"/>
  <circle cx="36" cy="30" r="2.2" fill="#2a6030"/>
  <circle cx="25" cy="29" r="0.8" fill="white"/>
  <circle cx="37" cy="29" r="0.8" fill="white"/>
  <!-- eye lashes -->
  <path d="M20.5 27 Q24 25.5 27.5 27" stroke="#111" stroke-width="1.3" fill="none"/>
  <path d="M32.5 27 Q36 25.5 39.5 27" stroke="#111" stroke-width="1.3" fill="none"/>
  <!-- nose -->
  <ellipse cx="30" cy="34" rx="1.5" ry="1" fill="#d09060"/>
  <!-- lips -->
  <path d="M26 38 Q30 40 34 38" stroke="#cc2222" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <path d="M27 38 Q30 37 33 38" stroke="#aa1111" stroke-width="1" fill="none"/>
</svg>`,

/* ── HAWKEYE ── */
hawkeye: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- purple suit -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#4a1a7a"/>
  <!-- neck -->
  <rect x="24" y="43" width="12" height="6" rx="2" fill="#f5c090"/>
  <!-- face -->
  <ellipse cx="30" cy="28" rx="14" ry="16" fill="#f5c090"/>
  <!-- dark brown hair -->
  <ellipse cx="30" cy="18" rx="13" ry="8" fill="#3a2010"/>
  <path d="M17 22 Q15 16 19 14 Q22 12 20 20Z" fill="#3a2010"/>
  <path d="M43 22 Q45 16 41 14 Q38 12 40 20Z" fill="#3a2010"/>
  <!-- purple half-mask over eyes -->
  <rect x="16" y="24" width="28" height="10" rx="5" fill="#5a2090"/>
  <!-- eye holes -->
  <ellipse cx="24" cy="29" rx="3.5" ry="3" fill="white"/>
  <ellipse cx="36" cy="29" rx="3.5" ry="3" fill="white"/>
  <circle cx="24" cy="29" r="2.2" fill="#4040a0"/>
  <circle cx="36" cy="29" r="2.2" fill="#4040a0"/>
  <circle cx="25" cy="28" r="0.8" fill="white"/>
  <circle cx="37" cy="28" r="0.8" fill="white"/>
  <!-- nose -->
  <ellipse cx="30" cy="36" rx="1.5" ry="1" fill="#d09060"/>
  <!-- mouth determined -->
  <path d="M26 40 Q30 42 34 40" stroke="#b07040" stroke-width="1.3" fill="none"/>
  <!-- bow -->
  <path d="M48 10 Q58 25 48 50" stroke="#5a3010" stroke-width="2.5" fill="none"/>
  <!-- bow string -->
  <line x1="48" y1="10" x2="48" y2="50" stroke="#c0a060" stroke-width="1"/>
  <!-- arrow nocked -->
  <line x1="36" y1="30" x2="55" y2="25" stroke="#c0a060" stroke-width="1.5"/>
  <polygon points="55,25 51,23 52,27" fill="#c0a060"/>
  <!-- H emblem on chest -->
  <text x="30" y="52" font-family="Arial" font-weight="bold" font-size="7" fill="#a040f0" text-anchor="middle">H</text>
</svg>`,

/* ── SPIDER-GWEN ── */
gwenspider: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- body white/pink -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#e0e0e0"/>
  <rect x="16" y="44" width="28" height="10" rx="4" fill="#cc66aa"/>
  <!-- white/grey mask -->
  <ellipse cx="30" cy="28" rx="17" ry="19" fill="#f0f0f0"/>
  <!-- pink hood outer -->
  <path d="M13 22 Q30 5 47 22 Q44 16 30 12 Q16 16 13 22Z" fill="#cc66aa"/>
  <!-- hood sides -->
  <path d="M13 22 Q8 28 10 38 Q14 36 16 30 Q14 26 16 22Z" fill="#cc66aa"/>
  <path d="M47 22 Q52 28 50 38 Q46 36 44 30 Q46 26 44 22Z" fill="#cc66aa"/>
  <!-- black web lines -->
  <line x1="30" y1="9" x2="30" y2="47" stroke="#222" stroke-width="0.8"/>
  <line x1="13" y1="18" x2="47" y2="38" stroke="#222" stroke-width="0.8"/>
  <line x1="47" y1="18" x2="13" y2="38" stroke="#222" stroke-width="0.8"/>
  <line x1="13" y1="28" x2="47" y2="28" stroke="#222" stroke-width="0.8"/>
  <ellipse cx="30" cy="20" rx="8" ry="4" fill="none" stroke="#222" stroke-width="0.7"/>
  <ellipse cx="30" cy="28" rx="14" ry="7" fill="none" stroke="#222" stroke-width="0.7"/>
  <ellipse cx="30" cy="36" rx="16" ry="7" fill="none" stroke="#222" stroke-width="0.7"/>
  <!-- angular white eyes -->
  <path d="M15 26 L24 22 L27 30 L15 30Z" fill="white"/>
  <path d="M45 26 L36 22 L33 30 L45 30Z" fill="white"/>
  <!-- eye inner -->
  <path d="M16.5 27 L23 23.5 L25.5 29 L16.5 29Z" fill="#ddd" opacity="0.7"/>
  <path d="M43.5 27 L37 23.5 L34.5 29 L43.5 29Z" fill="#ddd" opacity="0.7"/>
  <!-- pink spider on chest -->
  <ellipse cx="30" cy="49" rx="4" ry="2.5" fill="#cc66aa"/>
  <line x1="26" y1="49" x2="24" y2="52" stroke="#cc66aa" stroke-width="1.2"/>
  <line x1="26" y1="49" x2="23" y2="47" stroke="#cc66aa" stroke-width="1.2"/>
  <line x1="34" y1="49" x2="36" y2="52" stroke="#cc66aa" stroke-width="1.2"/>
  <line x1="34" y1="49" x2="37" y2="47" stroke="#cc66aa" stroke-width="1.2"/>
</svg>`,

/* ── MILES MORALES ── */
miles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- body black -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#111"/>
  <rect x="16" y="44" width="28" height="10" rx="4" fill="#111"/>
  <!-- all-black mask -->
  <ellipse cx="30" cy="28" rx="17" ry="19" fill="#111"/>
  <!-- subtle web lines dark grey -->
  <line x1="30" y1="9" x2="30" y2="47" stroke="#2a2a2a" stroke-width="0.8"/>
  <line x1="13" y1="18" x2="47" y2="38" stroke="#2a2a2a" stroke-width="0.8"/>
  <line x1="47" y1="18" x2="13" y2="38" stroke="#2a2a2a" stroke-width="0.8"/>
  <line x1="13" y1="28" x2="47" y2="28" stroke="#2a2a2a" stroke-width="0.8"/>
  <ellipse cx="30" cy="20" rx="8" ry="4" fill="none" stroke="#2a2a2a" stroke-width="0.7"/>
  <ellipse cx="30" cy="28" rx="14" ry="7" fill="none" stroke="#2a2a2a" stroke-width="0.7"/>
  <ellipse cx="30" cy="36" rx="16" ry="7" fill="none" stroke="#2a2a2a" stroke-width="0.7"/>
  <!-- RED glowing eyes -->
  <ellipse cx="22" cy="27" rx="6.5" ry="5" fill="#cc1111"/>
  <ellipse cx="38" cy="27" rx="6.5" ry="5" fill="#cc1111"/>
  <!-- eye glow -->
  <ellipse cx="22" cy="27" rx="4" ry="3.2" fill="#ff3333"/>
  <ellipse cx="38" cy="27" rx="4" ry="3.2" fill="#ff3333"/>
  <ellipse cx="21" cy="26" rx="2" ry="1.5" fill="white" opacity="0.4"/>
  <ellipse cx="37" cy="26" rx="2" ry="1.5" fill="white" opacity="0.4"/>
  <!-- red spider on chest -->
  <ellipse cx="30" cy="49" rx="4" ry="2.5" fill="#cc1111"/>
  <line x1="26" y1="49" x2="24" y2="52" stroke="#cc1111" stroke-width="1.2"/>
  <line x1="26" y1="49" x2="23" y2="47" stroke="#cc1111" stroke-width="1.2"/>
  <line x1="34" y1="49" x2="36" y2="52" stroke="#cc1111" stroke-width="1.2"/>
  <line x1="34" y1="49" x2="37" y2="47" stroke="#cc1111" stroke-width="1.2"/>
  <!-- bioelectric glow edges -->
  <ellipse cx="30" cy="28" rx="17" ry="19" fill="none" stroke="#3344ff" stroke-width="1.5" opacity="0.5"/>
</svg>`,

/* ── BLACK PANTHER ── */
blackpanther: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- vibranium body hint -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#1a1a2a"/>
  <!-- neck -->
  <rect x="24" y="43" width="12" height="6" rx="2" fill="#1a1a2a"/>
  <!-- black mask head -->
  <ellipse cx="30" cy="28" rx="17" ry="19" fill="#111"/>
  <!-- cat ears -->
  <polygon points="18,14 14,5 22,12" fill="#111"/>
  <polygon points="42,14 46,5 38,12" fill="#111"/>
  <!-- inner ear purple -->
  <polygon points="18,13 16,7 21,11" fill="#6633aa"/>
  <polygon points="42,13 44,7 39,11" fill="#6633aa"/>
  <!-- silver/vibranium outline -->
  <ellipse cx="30" cy="28" rx="17" ry="19" fill="none" stroke="#8888cc" stroke-width="1.5"/>
  <!-- stylized silver mask lines -->
  <path d="M20 22 Q30 18 40 22" stroke="#8888cc" stroke-width="1.2" fill="none"/>
  <path d="M18 30 Q30 26 42 30" stroke="#8888cc" stroke-width="1" fill="none"/>
  <!-- cat eyes glowing -->
  <ellipse cx="23" cy="28" rx="4" ry="3" fill="#6633aa"/>
  <ellipse cx="37" cy="28" rx="4" ry="3" fill="#6633aa"/>
  <ellipse cx="23" cy="28" rx="2.5" ry="2" fill="#9955dd"/>
  <ellipse cx="37" cy="28" rx="2.5" ry="2" fill="#9955dd"/>
  <!-- cat slit pupils -->
  <rect x="22.5" y="26" width="1" height="4" rx="0.5" fill="#1a0030"/>
  <rect x="36.5" y="26" width="1" height="4" rx="0.5" fill="#1a0030"/>
  <!-- cat nose -->
  <path d="M28 34 L30 36 L32 34" stroke="#666" stroke-width="1" fill="none"/>
  <!-- whisker lines -->
  <line x1="16" y1="34" x2="26" y2="35" stroke="#666" stroke-width="0.8"/>
  <line x1="16" y1="36" x2="26" y2="36.5" stroke="#666" stroke-width="0.8"/>
  <line x1="44" y1="34" x2="34" y2="35" stroke="#666" stroke-width="0.8"/>
  <line x1="44" y1="36" x2="34" y2="36.5" stroke="#666" stroke-width="0.8"/>
  <!-- vibranium necklace -->
  <path d="M18 44 Q30 50 42 44" stroke="#8888cc" stroke-width="2" fill="none"/>
  <circle cx="30" cy="48" r="2.5" fill="#6633aa"/>
</svg>`,

/* ── VISION ── */
vision: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- cape red hint -->
  <path d="M12 46 Q30 52 48 46 L48 58 Q30 62 12 58Z" fill="#cc2222"/>
  <!-- neck -->
  <rect x="24" y="43" width="12" height="6" rx="2" fill="#4a6a30"/>
  <!-- head green/gold android -->
  <ellipse cx="30" cy="28" rx="16" ry="18" fill="#4a6a30"/>
  <!-- android forehead -->
  <rect x="20" y="14" width="20" height="8" rx="3" fill="#3a5a20"/>
  <!-- Mind Stone gem -->
  <ellipse cx="30" cy="17" rx="5" ry="4" fill="#ffe040"/>
  <ellipse cx="30" cy="17" rx="3.5" ry="2.8" fill="#ffee80"/>
  <ellipse cx="29" cy="16" rx="1.5" ry="1" fill="white" opacity="0.7"/>
  <!-- face seam lines android -->
  <line x1="30" y1="22" x2="30" y2="46" stroke="#3a5a20" stroke-width="1.2"/>
  <line x1="14" y1="28" x2="46" y2="28" stroke="#3a5a20" stroke-width="0.8"/>
  <!-- eyes yellow glowing -->
  <ellipse cx="23" cy="29" rx="4" ry="3.5" fill="#ffe040"/>
  <ellipse cx="37" cy="29" rx="4" ry="3.5" fill="#ffe040"/>
  <ellipse cx="23" cy="29" rx="2.5" ry="2" fill="#fff0a0"/>
  <ellipse cx="37" cy="29" rx="2.5" ry="2" fill="#fff0a0"/>
  <!-- pupil slit -->
  <rect x="22.5" y="27.5" width="1" height="3" rx="0.5" fill="#c08000"/>
  <rect x="36.5" y="27.5" width="1" height="3" rx="0.5" fill="#c08000"/>
  <!-- cheek panel lines -->
  <path d="M16 32 Q20 34 24 33" stroke="#3a5a20" stroke-width="1" fill="none"/>
  <path d="M44 32 Q40 34 36 33" stroke="#3a5a20" stroke-width="1" fill="none"/>
  <!-- nose/mouth subtle -->
  <ellipse cx="30" cy="36" rx="1.5" ry="1" fill="#3a5a20"/>
  <path d="M26 40 Q30 42 34 40" stroke="#3a5a20" stroke-width="1.3" fill="none"/>
  <!-- yellow triangle chest emblem -->
  <polygon points="30,46 26,52 34,52" fill="#ffe040"/>
</svg>`,

/* ── SCARLET WITCH ── */
scarletwitch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- magic red energy glow at bottom -->
  <ellipse cx="30" cy="56" rx="20" ry="6" fill="#ff2200" opacity="0.3"/>
  <!-- dark red outfit -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#7a0000"/>
  <!-- neck -->
  <rect x="24" y="43" width="12" height="6" rx="2" fill="#f0c090"/>
  <!-- face -->
  <ellipse cx="30" cy="29" rx="14" ry="16" fill="#f0c090"/>
  <!-- dark wavy hair -->
  <ellipse cx="30" cy="20" rx="16" ry="12" fill="#1a0a0a"/>
  <!-- hair waves -->
  <path d="M14 24 Q8 28 10 38 Q14 36 16 32 Q14 26 16 24Z" fill="#1a0a0a"/>
  <path d="M46 24 Q52 28 50 38 Q46 36 44 32 Q46 26 44 24Z" fill="#1a0a0a"/>
  <path d="M14 30 Q10 36 14 42 Q18 40 17 35Z" fill="#2a0808"/>
  <path d="M46 30 Q50 36 46 42 Q42 40 43 35Z" fill="#2a0808"/>
  <!-- red crown headpiece -->
  <rect x="20" y="16" width="20" height="5" rx="2" fill="#cc1111"/>
  <polygon points="30,10 27,16 33,16" fill="#cc1111"/>
  <polygon points="22,13 20,16 24,16" fill="#cc1111"/>
  <polygon points="38,13 40,16 36,16" fill="#cc1111"/>
  <!-- eyes -->
  <ellipse cx="24" cy="31" rx="3.5" ry="3" fill="white"/>
  <ellipse cx="36" cy="31" rx="3.5" ry="3" fill="white"/>
  <circle cx="24" cy="31" r="2.2" fill="#8b0000"/>
  <circle cx="36" cy="31" r="2.2" fill="#8b0000"/>
  <circle cx="25" cy="30" r="0.8" fill="white"/>
  <circle cx="37" cy="30" r="0.8" fill="white"/>
  <!-- lashes -->
  <path d="M20.5 28 Q24 26.5 27.5 28" stroke="#1a0a0a" stroke-width="1.4" fill="none"/>
  <path d="M32.5 28 Q36 26.5 39.5 28" stroke="#1a0a0a" stroke-width="1.4" fill="none"/>
  <!-- nose -->
  <ellipse cx="30" cy="36" rx="1.5" ry="1" fill="#d09060"/>
  <!-- lips red -->
  <path d="M26 40 Q30 43 34 40" stroke="#cc1111" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- red magic hands glow -->
  <circle cx="12" cy="46" r="5" fill="#ff2200" opacity="0.6"/>
  <circle cx="12" cy="46" r="3" fill="#ff6644" opacity="0.8"/>
  <circle cx="48" cy="46" r="5" fill="#ff2200" opacity="0.6"/>
  <circle cx="48" cy="46" r="3" fill="#ff6644" opacity="0.8"/>
</svg>`,

/* ── GROOT ── */
groot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- bark body -->
  <ellipse cx="30" cy="54" rx="18" ry="8" fill="#5a3a1a"/>
  <!-- neck bark -->
  <rect x="22" y="43" width="16" height="8" rx="4" fill="#5a3a1a"/>
  <!-- bark texture body lines -->
  <line x1="25" y1="43" x2="23" y2="55" stroke="#3a2008" stroke-width="1"/>
  <line x1="30" y1="43" x2="30" y2="57" stroke="#3a2008" stroke-width="1"/>
  <line x1="35" y1="43" x2="37" y2="55" stroke="#3a2008" stroke-width="1"/>
  <!-- main head bark -->
  <ellipse cx="30" cy="28" rx="16" ry="18" fill="#6a4520"/>
  <!-- bark texture lines face -->
  <line x1="20" y1="22" x2="18" y2="40" stroke="#4a2a10" stroke-width="1.2"/>
  <line x1="40" y1="22" x2="42" y2="40" stroke="#4a2a10" stroke-width="1.2"/>
  <line x1="26" y1="18" x2="25" y2="35" stroke="#4a2a10" stroke-width="0.8"/>
  <line x1="34" y1="18" x2="35" y2="35" stroke="#4a2a10" stroke-width="0.8"/>
  <!-- twig hair top -->
  <line x1="30" y1="10" x2="28" y2="4" stroke="#4a2a10" stroke-width="2" stroke-linecap="round"/>
  <line x1="30" y1="10" x2="33" y2="3" stroke="#4a2a10" stroke-width="2" stroke-linecap="round"/>
  <line x1="30" y1="10" x2="30" y2="2" stroke="#4a2a10" stroke-width="2" stroke-linecap="round"/>
  <!-- green buds -->
  <circle cx="28" cy="4" r="2.5" fill="#3a8a20"/>
  <circle cx="33" cy="3" r="2" fill="#4a9a30"/>
  <circle cx="30" cy="2" r="2" fill="#3a8a20"/>
  <!-- big round eyes -->
  <ellipse cx="23" cy="28" rx="5" ry="5.5" fill="white"/>
  <ellipse cx="37" cy="28" rx="5" ry="5.5" fill="white"/>
  <!-- iris brown -->
  <circle cx="23" cy="28" r="3.5" fill="#6a4010"/>
  <circle cx="37" cy="28" r="3.5" fill="#6a4010"/>
  <!-- pupil -->
  <circle cx="23" cy="28" r="2" fill="#1a0800"/>
  <circle cx="37" cy="28" r="2" fill="#1a0800"/>
  <!-- white reflection double -->
  <circle cx="24" cy="26.5" r="1" fill="white"/>
  <circle cx="22.5" cy="28.5" r="0.5" fill="white" opacity="0.7"/>
  <circle cx="38" cy="26.5" r="1" fill="white"/>
  <circle cx="36.5" cy="28.5" r="0.5" fill="white" opacity="0.7"/>
  <!-- bark brow ridge -->
  <path d="M17 22 Q23 19 29 21" stroke="#3a2008" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M43 22 Q37 19 31 21" stroke="#3a2008" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- mouth bark line smile -->
  <path d="M22 38 Q30 43 38 38" stroke="#3a2008" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- small leaf ear left -->
  <ellipse cx="14" cy="28" rx="4" ry="6" fill="#5a8a2a" transform="rotate(-20,14,28)"/>
  <!-- small leaf ear right -->
  <ellipse cx="46" cy="28" rx="4" ry="6" fill="#5a8a2a" transform="rotate(20,46,28)"/>
</svg>`,

/* ── ROCKET RACCOON ── */
rocket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- outfit dark -->
  <ellipse cx="30" cy="54" rx="14" ry="7" fill="#2a2a2a"/>
  <!-- neck/fur -->
  <rect x="24" y="43" width="12" height="6" rx="2" fill="#8a7060"/>
  <!-- raccoon face fur - grey base -->
  <ellipse cx="30" cy="28" rx="16" ry="18" fill="#a09080"/>
  <!-- dark mask around eyes (raccoon) -->
  <ellipse cx="23" cy="28" rx="6" ry="5" fill="#2a2020"/>
  <ellipse cx="37" cy="28" rx="6" ry="5" fill="#2a2020"/>
  <!-- white stripe top head -->
  <ellipse cx="30" cy="16" rx="8" ry="5" fill="#e0d8d0"/>
  <!-- pointed ears -->
  <path d="M18 18 Q14 8 20 12Z" fill="#a09080"/>
  <path d="M18 18 Q16 10 21 13Z" fill="#e0d8d0"/>
  <path d="M42 18 Q46 8 40 12Z" fill="#a09080"/>
  <path d="M42 18 Q44 10 39 13Z" fill="#e0d8d0"/>
  <!-- eyes dark red/brown -->
  <ellipse cx="23" cy="28" rx="3.5" ry="3" fill="#cc4422"/>
  <ellipse cx="37" cy="28" rx="3.5" ry="3" fill="#cc4422"/>
  <circle cx="23" cy="28" r="2" fill="#8b2200"/>
  <circle cx="37" cy="28" r="2" fill="#8b2200"/>
  <circle cx="24" cy="27" r="0.8" fill="white"/>
  <circle cx="38" cy="27" r="0.8" fill="white"/>
  <!-- snout -->
  <ellipse cx="30" cy="34" rx="5" ry="4" fill="#e0d8d0"/>
  <!-- nose black -->
  <ellipse cx="30" cy="33" rx="2.5" ry="1.8" fill="#111"/>
  <!-- mouth -->
  <path d="M27 36 Q30 38 33 36" stroke="#666" stroke-width="1.2" fill="none"/>
  <!-- white face stripe middle -->
  <rect x="28" y="34" width="4" height="8" rx="1" fill="#e0d8d0"/>
  <!-- whiskers -->
  <line x1="16" y1="33" x2="25" y2="34" stroke="#888" stroke-width="0.8"/>
  <line x1="16" y1="35" x2="25" y2="35.5" stroke="#888" stroke-width="0.8"/>
  <line x1="44" y1="33" x2="35" y2="34" stroke="#888" stroke-width="0.8"/>
  <line x1="44" y1="35" x2="35" y2="35.5" stroke="#888" stroke-width="0.8"/>
  <!-- big gun hint -->
  <rect x="42" y="44" width="14" height="5" rx="2" fill="#445566"/>
  <rect x="50" y="40" width="6" height="5" rx="1" fill="#334455"/>
</svg>`,

/* ── GAMORA ── */
gamora: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- black outfit -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#1a1a1a"/>
  <!-- neck -->
  <rect x="24" y="43" width="12" height="6" rx="2" fill="#3a8a50"/>
  <!-- green face -->
  <ellipse cx="30" cy="29" rx="14" ry="16" fill="#3a9a60"/>
  <!-- black hair -->
  <ellipse cx="30" cy="20" rx="15" ry="10" fill="#111"/>
  <path d="M15 24 Q8 30 10 42 Q15 40 17 34 Q15 27 17 24Z" fill="#111"/>
  <path d="M45 24 Q52 30 50 42 Q45 40 43 34 Q45 27 43 24Z" fill="#111"/>
  <!-- purple face markings -->
  <path d="M22 24 Q24 22 26 24 Q24 28 22 24Z" fill="#7733aa"/>
  <path d="M38 24 Q36 22 34 24 Q36 28 38 24Z" fill="#7733aa"/>
  <line x1="24" y1="22" x2="22" y2="16" stroke="#7733aa" stroke-width="1.5"/>
  <line x1="26" y1="21" x2="26" y2="15" stroke="#7733aa" stroke-width="1.5"/>
  <line x1="36" y1="22" x2="38" y2="16" stroke="#7733aa" stroke-width="1.5"/>
  <line x1="34" y1="21" x2="34" y2="15" stroke="#7733aa" stroke-width="1.5"/>
  <!-- eyes -->
  <ellipse cx="24" cy="30" rx="3.5" ry="3" fill="white"/>
  <ellipse cx="36" cy="30" rx="3.5" ry="3" fill="white"/>
  <circle cx="24" cy="30" r="2.2" fill="#5a2a8a"/>
  <circle cx="36" cy="30" r="2.2" fill="#5a2a8a"/>
  <circle cx="25" cy="29" r="0.8" fill="white"/>
  <circle cx="37" cy="29" r="0.8" fill="white"/>
  <!-- nose -->
  <ellipse cx="30" cy="35" rx="1.5" ry="1" fill="#2a7a48"/>
  <!-- lips full -->
  <path d="M26 39 Q30 42 34 39" stroke="#cc4488" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  <!-- sword hint -->
  <line x1="46" y1="10" x2="52" y2="50" stroke="#c0c0c0" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M44 12 L48 8 L50 14Z" fill="#c0c0c0"/>
</svg>`,

/* ── STAR-LORD ── */
starlord: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- red jacket -->
  <ellipse cx="30" cy="54" rx="16" ry="8" fill="#aa2222"/>
  <!-- neck -->
  <rect x="24" y="43" width="12" height="6" rx="2" fill="#aa2222"/>
  <!-- chrome helmet -->
  <ellipse cx="30" cy="28" rx="17" ry="19" fill="#3a3a4a"/>
  <!-- helmet metallic sheen -->
  <path d="M14 22 Q30 10 46 22 Q44 16 30 13 Q16 16 14 22Z" fill="#5a5a6a"/>
  <path d="M14 22 Q12 26 14 32 Q16 30 16 26Z" fill="#5a5a6a"/>
  <path d="M46 22 Q48 26 46 32 Q44 30 44 26Z" fill="#5a5a6a"/>
  <!-- orange-red visor glow -->
  <rect x="14" y="26" width="32" height="10" rx="5" fill="#cc4400"/>
  <!-- visor inner glow -->
  <rect x="15" y="27" width="30" height="8" rx="4" fill="#ff6600" opacity="0.8"/>
  <rect x="16" y="28" width="28" height="6" rx="3" fill="#ff8c00" opacity="0.6"/>
  <!-- wing fin accents on helmet sides -->
  <path d="M14 26 Q8 22 9 30 Q12 30 14 32Z" fill="#222233"/>
  <path d="M46 26 Q52 22 51 30 Q48 30 46 32Z" fill="#222233"/>
  <!-- helmet center ridge -->
  <line x1="30" y1="10" x2="30" y2="26" stroke="#5a5a6a" stroke-width="2"/>
  <!-- helmet cross lines -->
  <line x1="14" y1="26" x2="46" y2="26" stroke="#5a5a6a" stroke-width="1"/>
  <!-- dual blasters hint on belt -->
  <rect x="18" y="46" width="8" height="4" rx="2" fill="#444"/>
  <rect x="34" y="46" width="8" height="4" rx="2" fill="#444"/>
  <!-- star on chest -->
  <text x="30" y="43" font-family="Arial" font-size="8" fill="#cc8800" text-anchor="middle">&#9733;</text>
</svg>`,

/* ── DRAX ── */
drax: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
  <!-- massive chest/shoulders blue-grey -->
  <ellipse cx="30" cy="54" rx="22" ry="8" fill="#5a7a8a"/>
  <!-- neck thick -->
  <rect x="21" y="42" width="18" height="10" rx="3" fill="#5a7a8a"/>
  <!-- big bald head blue-grey skin -->
  <ellipse cx="30" cy="27" rx="18" ry="19" fill="#6a8a9a"/>
  <!-- red/dark tattoo markings on face -->
  <path d="M22 16 Q26 14 30 15 Q34 14 38 16" stroke="#8b1a1a" stroke-width="2" fill="none"/>
  <line x1="30" y1="14" x2="30" y2="20" stroke="#8b1a1a" stroke-width="1.5"/>
  <!-- cheek tattoos -->
  <path d="M15 26 Q18 24 20 28 Q18 30 15 28Z" fill="#8b1a1a"/>
  <path d="M45 26 Q42 24 40 28 Q42 30 45 28Z" fill="#8b1a1a"/>
  <line x1="16" y1="32" x2="22" y2="30" stroke="#8b1a1a" stroke-width="1.5"/>
  <line x1="44" y1="32" x2="38" y2="30" stroke="#8b1a1a" stroke-width="1.5"/>
  <!-- jaw tattoo lines -->
  <line x1="22" y1="40" x2="26" y2="42" stroke="#8b1a1a" stroke-width="1.5"/>
  <line x1="38" y1="40" x2="34" y2="42" stroke="#8b1a1a" stroke-width="1.5"/>
  <path d="M25 42 Q30 44 35 42" stroke="#8b1a1a" stroke-width="1.5" fill="none"/>
  <!-- brow heavy -->
  <path d="M14 23 Q22 19 28 22" stroke="#3a5a6a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M46 23 Q38 19 32 22" stroke="#3a5a6a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <!-- intense eyes dark red -->
  <ellipse cx="23" cy="27" rx="4" ry="3.5" fill="#cc2200"/>
  <ellipse cx="37" cy="27" rx="4" ry="3.5" fill="#cc2200"/>
  <circle cx="23" cy="27" r="2.5" fill="#8b1a00"/>
  <circle cx="37" cy="27" r="2.5" fill="#8b1a00"/>
  <circle cx="24" cy="26" r="0.9" fill="white"/>
  <circle cx="38" cy="26" r="0.9" fill="white"/>
  <!-- nose broad -->
  <ellipse cx="30" cy="33" rx="3" ry="2.5" fill="#507080"/>
  <circle cx="28" cy="34" r="1.5" fill="#3a6070"/>
  <circle cx="32" cy="34" r="1.5" fill="#3a6070"/>
  <!-- mouth grim -->
  <path d="M24 39 Q30 37 36 39" stroke="#3a5060" stroke-width="2" fill="none"/>
  <!-- body tattoo hint -->
  <path d="M18 50 Q20 47 22 50" stroke="#8b1a1a" stroke-width="1.5" fill="none"/>
  <path d="M38 50 Q40 47 42 50" stroke="#8b1a1a" stroke-width="1.5" fill="none"/>
</svg>`

};
