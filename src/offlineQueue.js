import { dbGetQueue, dbAddToQueue, dbClearQueue, dbRemoveFromQueue } from './db'

export const isOnline = () => navigator.onLine

export const saveToQueue = async (action) => {
  await dbAddToQueue(action)
}

export const syncQueue = async (supabase) => {
  if (!isOnline()) return
  const queue = await dbGetQueue()
  if (queue.length === 0) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  for (const action of queue) {
    try {
      if (action.type === 'INSERT_JUMP') {
        await supabase.from('jumps').insert({ ...action.payload, user_id: user.id })
      } else if (action.type === 'DELETE_JUMP') {
        await supabase.from('jumps').delete().eq('id', action.payload.id)
      } else if (action.type === 'UPDATE_JUMP') {
        await supabase.from('jumps').update(action.payload).eq('id', action.payload.id)
      }
      await dbRemoveFromQueue(action.id)
    } catch (err) {
      console.error('Sync error:', err)
    }
  }
}
