var CACHE = 'barbearia-v2-v1'
var ASSETS = [
  '/barbearia-v2/',
  '/barbearia-v2/index.html',
  '/barbearia-v2/landing.html',
  '/barbearia-v2/cliente.html',
  '/barbearia-v2/painel.html',
  '/barbearia-v2/cartaz.html',
  '/barbearia-v2/shared.css',
  '/barbearia-v2/shared.js',
  '/barbearia-v2/config.js',
  '/barbearia-v2/manifest.json'
]

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS).catch(function() {})
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE) return caches.delete(k)
      }))
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return
  
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetched = fetch(e.request).then(function(res) {
        if (res && res.status === 200) {
          var clone = res.clone()
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone) })
        }
        return res
      }).catch(function() {
        return cached || new Response('Offline', {status:503})
      })
      return cached || fetched
    })
  )
})
