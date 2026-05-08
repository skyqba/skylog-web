import { useState, useEffect } from 'react'
import { dbGetAvatar } from './db'
import { supabase } from './supabase'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!navigator.onLine) {
        const { dbGetProfile: getProf } = await import('./db')
        const [prof, avatarData] = await Promise.all([getProf(), dbGetAvatar()])
        if (!cancelled && prof) {
          setProfile({ ...prof, avatar_url: avatarData || prof.avatar_url })
          setLoading(false)
        }
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!cancelled) setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, is_admin, perm_export, perm_import, perm_stats, perm_language, perm_weather, perm_pro_theme, avatar_url, name, surname')
        .eq('id', user.id)
        .single()
      if (!cancelled) {
        setProfile(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return {
    profile,
    loading,
    isPremium:   profile?.is_premium   ?? false,
    isAdmin:     profile?.is_admin     ?? false,
    canExport:   profile?.is_premium ? (profile?.perm_export   ?? true)  : (profile?.perm_export   ?? false),
    canImport:   profile?.is_premium ? (profile?.perm_import   ?? true)  : (profile?.perm_import   ?? false),
    canStats:    profile?.is_premium ? (profile?.perm_stats    ?? true)  : (profile?.perm_stats    ?? false),
    canLanguage: profile?.is_premium ? (profile?.perm_language ?? false) : (profile?.perm_language ?? false),
    canWeather:  profile?.is_premium ? (profile?.perm_weather  ?? false) : (profile?.perm_weather  ?? false),
    canProTheme: profile?.is_premium ? (profile?.perm_pro_theme ?? false) : (profile?.perm_pro_theme ?? false),
  }
}