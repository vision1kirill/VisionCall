/* ═══════════════════════════════════════════
   VisionCall — Theme System
   Themes: dark (default) · light · color
   Persisted in localStorage under "vc_theme"
═══════════════════════════════════════════ */

(function () {
  const THEMES = ["dark", "light", "color"];
  const STORAGE_KEY = "vc_theme";
  const META_COLORS  = { dark: "#08091a", light: "#f0f4ff", color: "#0c0820" };

  /* ── Read saved theme, default to dark ── */
  let current;
  try { current = localStorage.getItem(STORAGE_KEY); } catch (_) {}
  if (!THEMES.includes(current)) current = "dark";

  /* ── Apply theme immediately (before paint) ── */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    /* Update theme-color meta tag */
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", META_COLORS[theme] ?? META_COLORS.dark);
    current = theme;
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
    /* Sync all switcher buttons if they exist */
    document.querySelectorAll(".theme-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.theme === theme);
    });
  }

  /* Apply immediately so there's no flash */
  applyTheme(current);

  /* ── Build the theme switcher pill ── */
  function buildSwitcher() {
    const existing = document.getElementById("themeSwitcher");
    if (existing) return existing;

    const wrap = document.createElement("div");
    wrap.id = "themeSwitcher";
    wrap.setAttribute("aria-label", "Сменить тему");
    wrap.setAttribute("role", "group");

    const labels = {
      dark:  { icon: moonSVG(),  title: "Тёмная тема" },
      light: { icon: sunSVG(),   title: "Светлая тема" },
      color: { icon: starSVG(),  title: "Цветная тема" }
    };

    THEMES.forEach(theme => {
      const btn = document.createElement("button");
      btn.className = "theme-btn";
      btn.dataset.theme = theme;
      btn.title = labels[theme].title;
      btn.setAttribute("aria-label", labels[theme].title);
      btn.innerHTML = labels[theme].icon;
      btn.onclick = () => applyTheme(theme);
      if (theme === current) btn.classList.add("active");
      wrap.appendChild(btn);
    });

    return wrap;
  }

  /* ── Mount switcher into topbar or home card ── */
  function mountSwitcher() {
    const switcher = buildSwitcher();
    /* Room topbar → insert before last child (empty div) */
    const topbar = document.querySelector(".topbar");
    if (topbar) {
      topbar.insertBefore(switcher, topbar.lastElementChild);
      return;
    }
    /* Home / lobby → insert at top of card */
    const card = document.querySelector(".join-card, .lobby-card");
    if (card) {
      const header = card.querySelector(".logo-text, .lobby-header");
      if (header) {
        const after = header.closest(".lobby-header") ?? header;
        after.insertAdjacentElement("afterend", switcher);
      } else {
        card.insertBefore(switcher, card.firstChild);
      }
    }
  }

  /* ── Run after DOM ready ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountSwitcher);
  } else {
    mountSwitcher();
  }

  /* ── Expose globally for dynamic theme changes ── */
  window.vcTheme = { apply: applyTheme, current: () => current };

  /* ── SVG Icons ── */
  function moonSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
  function sunSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  }
  function starSVG() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  }
})();
