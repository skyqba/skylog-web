const CURRENT_DB_VERSION = '4'
const DB_VERSION_KEY = 'jumplogx_db_version'

export const clearOldCacheIfNeeded = async () => {
  const savedVersion = localStorage.getItem(DB_VERSION_KEY)
  
  if (savedVersion !== CURRENT_DB_VERSION) {
    console.log('Nowa wersja DB — czyszczę stary cache...')
    try {
      await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase('skyjumplog')
        req.onsuccess = resolve
        req.onerror = reject
        req.onblocked = resolve
      })
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION)
      console.log('Cache wyczyszczony — przeładowuję...')
      window.location.reload()
    } catch (e) {
      console.error('Błąd czyszczenia cache:', e)
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION)
    }
  }
}
