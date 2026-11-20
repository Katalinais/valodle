// Service worker mínimo.
// - Páginas: red primero (siempre el reto del día si hay conexión), caché como respaldo offline.
// - Estáticos de Next con hash en el nombre: caché primero (nunca cambian de contenido).
// - Imágenes de /img/: se sirven de caché y se revalidan en segundo plano (pueden regenerarse
//   con el mismo nombre al ejecutar `npm run images`).
// Todo lo demás (p. ej. chunks sin hash de `next dev`) va directo a la red.
const CACHE = "valorantdle-v2";
const HASHED = /^\/_next\/static\/((.*[/.-])?[0-9a-f]{12,}\.(js|css|woff2?)$|media\/)/;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function put(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((c) => c.put(request, copy));
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (HASHED.test(url.pathname)) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((r) => put(request, r))));
  } else if (url.pathname.startsWith("/img/")) {
    event.respondWith(
      caches.match(request).then((hit) => {
        const fresh = fetch(request)
          .then((r) => put(request, r))
          .catch(() => hit);
        return hit || fresh;
      }),
    );
  } else if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((r) => put(request, r))
        .catch(() => caches.match(request).then((hit) => hit || Response.error())),
    );
  }
});
