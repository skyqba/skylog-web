import { openDB } from 'idb'

const DB_NAME = 'skyjumplog'
const DB_VERSION = 1

export const getDB = () => openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('jumps')) {
      const jumpsStore = db.createObjectStore('jumps', { keyPath: 'id' })
      jumpsStore.createIndex('number', 'number')
      jumpsStore.createIndex('user_id', 'user_id')
    }
    if (!db.objectStoreNames.contains('profile'))
      db.createObjectStore('profile', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('rigs'))
      db.createObjectStore('rigs', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('quals'))
      db.createObjectStore('quals', { keyPath: 'user_id' })
    if (!db.objectStoreNames.contains('dropzones'))
      db.createObjectStore('dropzones', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('queue'))
      db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true })
  }
})

// ─── Jumps ───────────────────────────────────────────────────────────────────
export const dbGetJumps = async () => {
  const db = await getDB()
  const all = await db.getAll('jumps')
  return all.sort((a, b) => (b.number || 0) - (a.number || 0))
}

export const dbSetJumps = async (jumps) => {
  const db = await getDB()
  const tx = db.transaction('jumps', 'readwrite')
  await tx.store.clear()
  await Promise.all(jumps.map(j => tx.store.put(j)))
  await tx.done
}

export const dbAddJump = async (jump) => {
  const db = await getDB()
  await db.put('jumps', jump)
}

export const dbDeleteJump = async (id) => {
  const db = await getDB()
  await db.delete('jumps', id)
}

// ─── Profile ─────────────────────────────────────────────────────────────────
export const dbGetProfile = async () => {
  const db = await getDB()
  const all = await db.getAll('profile')
  return all[0] || null
}

export const dbSetProfile = async (profile) => {
  if (!profile) return
  const db = await getDB()
  await db.put('profile', profile)
}

// ─── Rigs ─────────────────────────────────────────────────────────────────────
export const dbGetRigs = async () => {
  const db = await getDB()
  return db.getAll('rigs')
}

export const dbSetRigs = async (rigs) => {
  const db = await getDB()
  const tx = db.transaction('rigs', 'readwrite')
  await tx.store.clear()
  await Promise.all(rigs.map(r => tx.store.put(r)))
  await tx.done
}

// ─── Quals ────────────────────────────────────────────────────────────────────
export const dbGetQuals = async () => {
  const db = await getDB()
  const all = await db.getAll('quals')
  return all[0] || null
}

export const dbSetQuals = async (quals) => {
  if (!quals) return
  const db = await getDB()
  await db.put('quals', quals)
}

// ─── Dropzones ────────────────────────────────────────────────────────────────
export const dbGetDropzones = async () => {
  const db = await getDB()
  return db.getAll('dropzones')
}

export const dbSetDropzones = async (dropzones) => {
  const db = await getDB()
  const tx = db.transaction('dropzones', 'readwrite')
  await tx.store.clear()
  await Promise.all(dropzones.map(d => tx.store.put(d)))
  await tx.done
}

// ─── Queue ────────────────────────────────────────────────────────────────────
export const dbGetQueue = async () => {
  const db = await getDB()
  return db.getAll('queue')
}

export const dbAddToQueue = async (action) => {
  const db = await getDB()
  await db.add('queue', { ...action, timestamp: Date.now() })
}

export const dbClearQueue = async () => {
  const db = await getDB()
  await db.clear('queue')
}

export const dbRemoveFromQueue = async (id) => {
  const db = await getDB()
  await db.delete('queue', id)
}
