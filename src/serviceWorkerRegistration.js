const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
)

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`
      if (isLocalhost) {
        checkValidServiceWorker(swUrl)
      } else {
        registerValidSW(swUrl)
      }
    })
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker.register(swUrl)
}

function checkValidServiceWorker(swUrl) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then(response => {
      if (response.status === 404) {
        navigator.serviceWorker.ready.then(registration => registration.unregister())
      } else {
        registerValidSW(swUrl)
      }
    })
    .catch(() => console.log('Brak połączenia. Aplikacja działa offline.'))
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => registration.unregister())
  }
}
