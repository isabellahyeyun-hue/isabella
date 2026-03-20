const CACHE_NAME = "hand-hygiene-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(ASSETS.map(async (url) => {
      try {
        await cache.add(new Request(url));
      } catch (error) {
      }
    }));
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if (cached) {
      return cached;
    }
    if (event.request.mode === "navigate") {
      const fallback = await cache.match("./index.html");
      if (fallback) {
        return fallback;
      }
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  })());
});
