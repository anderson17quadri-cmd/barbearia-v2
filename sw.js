var CACHE = 'agendado-v2'
var ASSETS = [
  '/',
  '/index.html',
  '/landing.html',
  '/cliente.html',
  '/painel.html',
  '/cartaz.html',
  '/shared.css',
  '/pro.css',
  '/shared.js',
  '/config.js',
  '/manifest.json'
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

// NETWORK-FIRST: busca sempre a versao nova; usa cache so se estiver offline
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return
  e.respondWith(
    fetch(e.request).then(function(res) {
      if (res && res.status === 200) {
        var clone = res.clone()
        caches.open(CACHE).then(function(cache) { cache.put(e.request, clone) })
      }
      return res
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || new Response('Offline', { status: 503 })
      })
    })
  )
})
