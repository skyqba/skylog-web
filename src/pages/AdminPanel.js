import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useProfile } from '../useProfile'
import { useNavigate } from 'react-router-dom'

export default function AdminPanel() {
  const { isAdmin, loading } = useProfile()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!isAdmin) {
      navigate('/')
      return
    }
    supabase
      .from('profiles_with_email')
      .select('id, email, is_premium, is_admin')
      .then(({ data, error }) => {
        console.log('USERS:', data, error)
        setUsers(data || [])
        setLoadingUsers(false)
      })
  }, [isAdmin, loading, navigate])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)' }}>
      Ładowanie...
    </div>
  )

  if (loadingUsers) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)' }}>
      Ładowanie użytkowników...
    </div>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.5rem', fontWeight:900, margin:0 }}>
            🛡 Panel Admina
          </h2>
          <div style={{ color:'var(--muted)', fontSize:'0.8rem', marginTop:'0.25rem' }}>
            {users.length} użytkowników w systemie
          </div>
        </div>
        <button onClick={() => navigate('/')}
          style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>
          ← Wróć
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {users.map(u => (
          <div key={u.id} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r)' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background: u.is_premium ? 'rgba(108,99,255,0.15)' : 'var(--bg3)', border:`1px solid ${u.is_premium ? 'var(--accent)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
              {u.is_admin ? '🛡' : u.is_premium ? '⭐' : '👤'}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {u.email || 'Brak emaila'}
              </div>
              <div style={{ fontSize:'0.7rem', color:'var(--muted)', fontFamily:'var(--mono)', marginTop:'0.15rem' }}>
                {u.id.slice(0, 8)}...
                {u.is_admin && <span style={{ marginLeft:'0.5rem', color:'var(--accent2)', fontWeight:600 }}>ADMIN</span>}
              </div>
            </div>
            {!u.is_admin && (
              <button
                onClick={async () => {
                  await supabase.from('profiles').update({ is_premium: !u.is_premium }).eq('id', u.id)
                  setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_premium: !u.is_premium } : x))
                }}
                style={{ background: u.is_premium ? 'rgba(108,99,255,0.15)' : 'transparent', border:`1px solid ${u.is_premium ? 'var(--accent)' : 'var(--border)'}`, borderRadius:8, padding:'0.4rem 0.9rem', cursor:'pointer', color: u.is_premium ? 'var(--accent2)' : 'var(--muted)', fontFamily:'var(--font)', fontSize:'0.82rem', fontWeight:600, flexShrink:0 }}>
                {u.is_premium ? '⭐ Premium' : '+ Nadaj Premium'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}