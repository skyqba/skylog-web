import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, is_admin')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setLoading(false)
    })
  }, [])

  return {
    profile,
    loading,
    isPremium: profile?.is_premium ?? false,
    isAdmin: profile?.is_admin ?? false,
  }
}