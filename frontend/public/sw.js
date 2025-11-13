// Service Worker for offline support
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('english-flow-v1').then((cache) => {
      return cache.addAll(['/','/ index.html', '/offline.html'])
    })
  )
})
