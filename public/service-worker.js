const CACHE_NAME = 'jumplogx-v202605090038'
const FONT_CACHE = 'jumplogx-fonts-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/', '/index.html', '/manifest.json'])
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== FONT_CACHE)
            .map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET') return
  if (url.hostname.includes('supabase')) return
  if (url.hostname.includes('open-meteo')) return

  // Fonty — cache first
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(res => {
            if (res.status === 200) cache.put(request, res.clone())
            return res
          }).catch(() => cached || new Response('', { status: 503 }))
        })
      )
    )
    return
  }

  // JS, CSS, obrazy — cache first (pliki z hashem nie zmieniają się)
  if (url.pathname.match(/\.(js|css|png|ico|woff2?|svg)$/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached
          return fetch(request).then(res => {
            if (res.status === 200) cache.put(request, res.clone())
            return res
          }).catch(() => new Response('', { status: 503 }))
        })
      )
    )
    return
  }

  // HTML i reszta — network first, fallback cache
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return res
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

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
