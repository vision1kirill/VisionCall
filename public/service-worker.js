/* ═══════════════════════════════════════════════
   VisionCall Service Worker — v3
   Cache strategy:
   - Images / icons / manifest → cache-first (rarely change)
   - JS / CSS / HTML → network-first, NEVER served stale
   - API & socket.io → network-only (never intercepted)
═══════════════════════════════════════════════ */

const CACHE_NAME = "visioncall-v3";

/* Only pre-cache truly static binary assets */
const PRECACHE_URLS = [
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.json"
];

/* ── Install: pre-cache icons/manifest, skip waiting immediately ── */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  /* Take over immediately — don't wait for old tabs to close */
  self.skipWaiting();
});

/* ── Activate: purge ALL old caches, take control of all clients ── */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => {
        /* Tell every open tab to reload so they pick up the new code */
        return self.clients.matchAll({ includeUncontrolled: true, type: "window" });
      })
      .then(clients => {
        clients.forEach(client => client.postMessage({ type: "SW_UPDATED" }));
      })
  );
});

/* ── Fetch ── */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Never intercept socket.io, API calls, or cross-origin requests */
  if (
    url.pathname.startsWith("/socket.io") ||
    url.pathname.startsWith("/api/") ||
    url.origin !== self.location.origin
  ) {
    return; /* fall through to native network */
  }

  const ext = url.pathname.split(".").pop().toLowerCase();

  /* JS and CSS — ALWAYS fetch fresh, fall back to cache only on offline */
  if (ext === "js" || ext === "css") {
    event.respondWith(
      fetch(request)
        .then(res => {
          /* Update cache with the fresh response */
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request)) /* offline fallback */
    );
    return;
  }

  /* HTML pages — network-first so content is always fresh */
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  /* Images / icons / manifest — cache-first (these never change) */
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      });
    })
  );
});
