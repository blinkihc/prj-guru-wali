// Service Worker for Guru Wali PWA
// Created: 2025-11-06
// Provides offline support and caching

const CACHE_NAME = "guru-wali-v2.0.0";
const RUNTIME_CACHE = "guru-wali-runtime";

// Assets to cache on install
const PRECACHE_ASSETS = [
  "/",
  "/login",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching essential assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests (always fetch fresh)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Network first strategy for HTML pages
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page if available
            return caches.match("/");
          });
        }),
    );
    return;
  }

  // Cache first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok && request.method === "GET") {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    }),
  );
});

// Message event - handle skip waiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Push notification support (future feature)
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  const options = {
    body: event.data ? event.data.text() : "Notifikasi baru dari Guru Wali",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    vibrate: [200, 100, 200],
    tag: "guru-wali-notification",
  };

  event.waitUntil(self.registration.showNotification("Guru Wali", options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");

  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});
