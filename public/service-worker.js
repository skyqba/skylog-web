const CACHE_NAME = 'jumplogx-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Pomijaj żądania do Supabase i zewnętrznych API
  if (url.hostname.includes('supabase') || 
      url.hostname.includes('open-meteo') ||
      url.hostname.includes('googleapis') ||
      request.method !== 'GET') {
    return
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Zapisz do cache
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline — zwróć z cache
        return caches.match(request).then(cached => {
          if (cached) return cached
          // Dla nawigacji — zwróć index.html
          if (request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})
