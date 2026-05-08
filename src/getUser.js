import { supabase } from './supabase'

let cachedUser = null

export const getUser = async () => {
  if (!navigator.onLine) return cachedUser
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) cachedUser = user
    return user
  } catch {
    return cachedUser
  }
}

// Cache user przy logowaniu
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) cachedUser = session.user
})
