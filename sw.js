/* ============================================================
   MU6 – Service Worker (Cloudflare Pages compatible)
   ============================================================ */

const CACHE_NAME = "mu6-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/discover.html",
  "/artists.html",
  "/playlists.html",
  "/community.html",
  "/dashboard.html",
  "/css/style.css",
  "/js/data.js",
  "/js/app.js",
  "/js/discover.js",
];

/* ---- Install: pre-cache static assets ---- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ---- Activate: clean up old caches ---- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ---- Fetch: network-first for API, cache-first for assets ---- */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // API calls: network-first, no cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets: cache-first, fallback to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    }).catch(() => {
      // Offline fallback: serve index.html for navigation requests
      if (request.mode === "navigate") {
        return caches.match("/index.html");
      }
    })
  );
});
