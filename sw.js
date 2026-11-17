const C = "s5b-v1";
self.addEventListener("install", e => e.waitUntil(
  caches.open(C).then(c => c.addAll(["./"])).catch(() => {}).then(() => self.skipWaiting())
));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // A propria pagina: tenta a rede (pega atualizacoes); sem internet, usa a copia guardada
    e.respondWith(
      fetch(r).then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => caches.match(r).then(m => m || caches.match("./")))
    );
  } else if (/jsdelivr\.net|storage\.googleapis\.com/.test(u.host)) {
    // Codigo e modelo do MediaPipe: guarda na primeira vez e depois usa sempre a copia
    e.respondWith(
      caches.match(r).then(m => m || fetch(r).then(res => {
        if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
        return res;
      }))
    );
  }
});
