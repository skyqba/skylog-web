import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!cancelled) setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, is_admin, perm_export, perm_import, perm_stats, perm_language')
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
    canExport:   (profile?.is_premium || profile?.perm_export)   ?? false,
    canImport:   (profile?.is_premium || profile?.perm_import)   ?? false,
    canStats:    (profile?.is_premium || profile?.perm_stats)    ?? false,
    canLanguage: (profile?.is_premium || profile?.perm_language) ?? false,
  }
}