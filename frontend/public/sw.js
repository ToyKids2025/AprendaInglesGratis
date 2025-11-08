// Service Worker for PWA
// Enables offline functionality and caching

const CACHE_VERSION = 'v3'
const CACHE_NAME = `english-flow-static-${CACHE_VERSION}`
const API_CACHE_NAME = `english-flow-api-${CACHE_VERSION}`
const IMAGE_CACHE_NAME = `english-flow-images-${CACHE_VERSION}`
const FONT_CACHE_NAME = `english-flow-fonts-${CACHE_VERSION}`

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-192.png',
  '/logo-512.png',
  '/offline.html',
]

// Cache size limits
const MAX_API_CACHE_SIZE = 50
const MAX_IMAGE_CACHE_SIZE = 60

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache opened')
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, API_CACHE_NAME, IMAGE_CACHE_NAME, FONT_CACHE_NAME]

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  if (keys.length > maxItems) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxItems)
    await Promise.all(keysToDelete.map(key => cache.delete(key)))
  }
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests (except for images/fonts)
  if (url.origin !== self.location.origin) {
    // Cache external images and fonts
    if (request.destination === 'image' || request.destination === 'font') {
      event.respondWith(cacheFirstStrategy(request,
        request.destination === 'image' ? IMAGE_CACHE_NAME : FONT_CACHE_NAME
      ))
    }
    return
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME))
    return
  }

  // Images - cache first with limit
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE_NAME))
    return
  }

  // Fonts - cache first
  if (request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request, FONT_CACHE_NAME))
    return
  }

  // HTML pages - network first, show offline page on failure
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseToCache))
          }
          return response
        })
        .catch(() => {
          // Try cache first
          return caches.match(request).then((cachedResponse) => {
            // If found in cache, return it
            if (cachedResponse) {
              return cachedResponse
            }
            // Otherwise return offline page
            return caches.match('/offline.html')
          })
        })
    )
    return
  }

  // Static assets - cache first, network fallback
  event.respondWith(cacheFirstStrategy(request, CACHE_NAME))
})

// Strategy: Cache first, network fallback
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())

      // Limit cache size for images
      if (cacheName === IMAGE_CACHE_NAME) {
        limitCacheSize(cacheName, MAX_IMAGE_CACHE_SIZE)
      }
    }

    return networkResponse
  } catch (error) {
    // Network failed and no cache, return offline response
    return new Response('Offline', { status: 503, statusText: 'Offline' })
  }
}

// Strategy: Network first, cache fallback
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    // Only cache successful GET requests
    if (networkResponse.status === 200 && request.method === 'GET') {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())

      // Limit API cache size
      limitCacheSize(cacheName, MAX_API_CACHE_SIZE)
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // No cache available, return offline error
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Você está offline. Verifique sua conexão.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgressData())
  }
})

async function syncProgressData() {
  try {
    // Get pending progress updates from IndexedDB
    // Send to server when online
    console.log('Syncing offline progress...')
    // Implementation would go here
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Agora',
        icon: '/icon-192.png',
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icon-192.png',
      },
    ],
  }

  event.waitUntil(self.registration.showNotification('English Flow', options))
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'))
  }
})
