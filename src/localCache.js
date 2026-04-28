const JUMPS_KEY = 'cache_jumps'
const PROFILE_KEY = 'cache_profile'
const RIGS_KEY = 'cache_rigs'
const QUALS_KEY = 'cache_quals'

// Skoki
export const getCachedJumps = () => {
  try { return JSON.parse(localStorage.getItem(JUMPS_KEY) || '[]') } catch { return [] }
}
export const setCachedJumps = (jumps) => {
  localStorage.setItem(JUMPS_KEY, JSON.stringify(jumps))
}
export const addCachedJump = (jump) => {
  const jumps = getCachedJumps()
  const updated = [jump, ...jumps.filter(j => j.id !== jump.id)]
  setCachedJumps(updated)
}
export const removeCachedJump = (id) => {
  const jumps = getCachedJumps()
  setCachedJumps(jumps.filter(j => j.id !== id))
}

// Profil
export const getCachedProfile = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null') } catch { return null }
}
export const setCachedProfile = (profile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

// Rigi
export const getCachedRigs = () => {
  try { return JSON.parse(localStorage.getItem(RIGS_KEY) || '[]') } catch { return [] }
}
export const setCachedRigs = (rigs) => {
  localStorage.setItem(RIGS_KEY, JSON.stringify(rigs))
}

// Uprawnienia
export const getCachedQuals = () => {
  try { return JSON.parse(localStorage.getItem(QUALS_KEY) || 'null') } catch { return null }
}
export const setCachedQuals = (quals) => {
  localStorage.setItem(QUALS_KEY, JSON.stringify(quals))
}
