const CACHE_NAME = "query-app-v1";
const RUNTIME_CACHE = "query-app-runtime-v1";

// Assets to cache on install
const PRECACHE_ASSETS = ["/", "/index.html", "/manifest.json"];

// Install event - cache essential assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching essential assets");
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network first, falling back to cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API requests - always fetch fresh
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/sanctum/")
  ) {
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache, try precache
            return caches.match(request);
          });
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("Background sync:", event.tag);
  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Implement your sync logic here
  console.log("Syncing offline messages...");
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Notification";
  const options = {
    body: data.body || "You have a new update",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    vibrate: [200, 100, 200],
    data: data.url || "/",
    actions: [
      { action: "open", title: "Open" },
      { action: "close", title: "Close" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open") {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
