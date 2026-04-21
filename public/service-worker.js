/* ═══════════════════════════════════════════════
   VisionCall Service Worker — PWA offline support
   Cache strategy:
   - Static assets → cache-first
   - API & socket.io → network-only
   - HTML pages → network-first (always fresh)
═══════════════════════════════════════════════ */

const CACHE_NAME = "visioncall-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/style.css",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.json"
];

/* ── Install: pre-cache static shell ── */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

/* ── Activate: purge old caches ── */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
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
    return; /* fall through to network */
  }

  /* HTML pages → network-first so content stays fresh */
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

  /* JS / CSS / images → cache-first */
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
