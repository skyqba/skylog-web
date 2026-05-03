import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useProfile } from '../useProfile'
import { useNavigate } from 'react-router-dom'

export default function AdminPanel() {
  const { isAdmin, loading } = useProfile()
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/')
  }, [isAdmin, loading, navigate])

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, is_premium')
      .then(({ data }) => setUsers(data || []))
  }, [])

  const togglePremium = async (userId, current) => {
    await supabase
      .from('profiles')
      .update({ is_premium: !current })
      .eq('id', userId)
    setUsers(u =>
      u.map(x => x.id === userId ? { ...x, is_premium: !current } : x)
    )
  }

  if (loading) return <div>Ładowanie...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
      <h2>Panel Admina</h2>
      {users.map(u => (
        <div key={u.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem', marginBottom:'0.5rem', border:'1px solid var(--border)', borderRadius:'var(--r)' }}>
          <span style={{ fontSize:'0.85rem', color:'var(--muted)' }}>{u.id}</span>
          <button
            onClick={() => togglePremium(u.id, u.is_premium)}
            style={{ background: u.is_premium ? 'var(--accent2)' : 'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'0.4rem 0.9rem', cursor:'pointer', color:'var(--text)' }}
          >
            {u.is_premium ? '⭐ Premium' : 'Zwykły'}
          </button>
        </div>
      ))}
    </div>
  )
}