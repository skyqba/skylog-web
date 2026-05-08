const CACHE_NAME = 'jumplogx-v2'

// Instalacja — cache index.html
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(['/', '/index.html', '/manifest.json'])
    )
  )
  self.skipWaiting()
})

// Aktywacja — usuń stare cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — cache all, network first
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Pomijaj zewnętrzne API
  if (
    url.hostname.includes('supabase') ||
    url.hostname.includes('open-meteo') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    request.method !== 'GET'
  ) return

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then(cached => {
          if (cached) return cached
          if (request.mode === 'navigate') return caches.match('/index.html')
          return new Response('Offline', { status: 503 })
        })
      )
  )
})

// Wymuś update gdy dostępna nowa wersja
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
