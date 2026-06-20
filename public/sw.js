/* global self, caches, fetch, URL */

const CACHE_NAME = "linx-archive-v4";

function sameScopePath(path) {
  return new URL(path, self.registration.scope).href;
}

const CORE_ASSETS = [
  sameScopePath("./"),
  sameScopePath("index.html"),
  sameScopePath("manifest.webmanifest"),
  sameScopePath("favicon.svg"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isSameScope = requestUrl.href.startsWith(self.registration.scope);
  const relativePath = isSameScope ? requestUrl.href.slice(self.registration.scope.length) : "";
  const isAppShell =
    event.request.mode === "navigate" ||
    relativePath === "" ||
    requestUrl.pathname.endsWith(".html") ||
    requestUrl.pathname.endsWith(".js") ||
    requestUrl.pathname.endsWith(".css");

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(sameScopePath("index.html")))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(sameScopePath("./")));
    }),
  );
});
