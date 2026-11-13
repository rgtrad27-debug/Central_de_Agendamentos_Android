const CACHE = "central-agendamentos-pwa-1.4.18";
const ASSETS = ["./", "./index.html", "./app.js", "./manifest.webmanifest", "./backup_inicial_para_importar.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-512-maskable.png"];
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", event => { if (event.request.method !== "GET") return; event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy=response.clone(); caches.open(CACHE).then(cache=>cache.put(event.request,copy)); return response; }).catch(()=>caches.match("./index.html")))); });
