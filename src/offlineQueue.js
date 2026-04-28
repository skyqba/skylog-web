const QUEUE_KEY = 'offlineQueue'

export const isOnline = () => navigator.onLine

export const saveToQueue = (action) => {
  const queue = getQueue()
  queue.push({ ...action, timestamp: Date.now() })
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export const getQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}

export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY)
}

export const syncQueue = async (supabase) => {
  if (!isOnline()) return
  const queue = getQueue()
  if (queue.length === 0) return

  const failed = []
  for (const action of queue) {
    try {
      if (action.type === 'INSERT_JUMP') {
        await supabase.from('jumps').insert(action.payload)
      } else if (action.type === 'DELETE_JUMP') {
        await supabase.from('jumps').delete().eq('id', action.payload.id)
      } else if (action.type === 'UPDATE_JUMP') {
        await supabase.from('jumps').update(action.payload).eq('id', action.payload.id)
      }
    } catch {
      failed.push(action)
    }
  }

  if (failed.length > 0) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(failed))
  } else {
    clearQueue()
  }
}
