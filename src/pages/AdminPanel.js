import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useProfile } from '../useProfile'
import { useNavigate } from 'react-router-dom'

const PERMISSIONS = [
  { key: 'perm_export',   label: 'Eksport',   icon: '📄' },
  { key: 'perm_import',   label: 'Import',    icon: '📂' },
  { key: 'perm_stats',    label: 'Statystyki',icon: '📊' },
  { key: 'perm_language', label: 'Język',     icon: '🌐' },
]

export default function AdminPanel() {
  const { isAdmin, loading } = useProfile()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!isAdmin) { navigate('/'); return }
    supabase
      .from('profiles_with_email')
      .select('id, email, is_premium, is_admin, perm_export, perm_import, perm_stats, perm_language')
      .then(({ data }) => {
        setUsers(data || [])
        setLoadingUsers(false)
      })
  }, [isAdmin, loading, navigate])

  const togglePremium = async (u) => {
    const next = !u.is_premium
    await supabase.from('profiles').update({ is_premium: next }).eq('id', u.id)
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_premium: next } : x))
  }

  const togglePerm = async (u, key) => {
    const next = !u[key]
    await supabase.from('profiles').update({ [key]: next }).eq('id', u.id)
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, [key]: next } : x))
  }

  if (loading || loadingUsers) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)' }}>
      Ładowanie...
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Nagłówek */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.5rem', fontWeight:900, margin:0 }}>🛡 Panel Admina</h2>
          <div style={{ color:'var(--muted)', fontSize:'0.8rem', marginTop:'0.25rem' }}>{users.length} użytkowników w systemie</div>
        </div>
        <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>
          ← Wróć
        </button>
      </div>

      {/* Lista użytkowników */}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        {users.map(u => (
          <div key={u.id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r2)', overflow:'hidden' }}>

            {/* Wiersz główny */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem' }}>
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
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexShrink:0 }}>
                  {/* Przycisk premium */}
                  <button onClick={() => togglePremium(u)}
                    style={{ background: u.is_premium ? 'rgba(108,99,255,0.15)' : 'transparent', border:`1px solid ${u.is_premium ? 'var(--accent)' : 'var(--border)'}`, borderRadius:8, padding:'0.4rem 0.9rem', cursor:'pointer', color: u.is_premium ? 'var(--accent2)' : 'var(--muted)', fontFamily:'var(--font)', fontSize:'0.82rem', fontWeight:600 }}>
                    {u.is_premium ? '⭐ Premium' : '+ Premium'}
                  </button>
                  {/* Przycisk rozwinięcia */}
                  <button onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                    style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'0.4rem 0.6rem', cursor:'pointer', color:'var(--muted)', fontSize:'0.8rem' }}>
                    {expanded === u.id ? '▲' : '▼'}
                  </button>
                </div>
              )}
            </div>

            {/* Rozwinięte uprawnienia */}
            {expanded === u.id && !u.is_admin && (
              <div style={{ borderTop:'1px solid var(--border)', padding:'1rem', background:'var(--bg3)' }}>
                <div style={{ fontSize:'0.75rem', color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.75rem' }}>
                  Indywidualne uprawnienia
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem' }}>
                  {PERMISSIONS.map(perm => (
                    <div key={perm.key} onClick={() => togglePerm(u, perm.key)}
                      style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.65rem 0.85rem', background: u[perm.key] ? 'rgba(108,99,255,0.08)' : 'var(--bg2)', border:`1px solid ${u[perm.key] ? 'rgba(108,99,255,0.35)' : 'var(--border)'}`, borderRadius:'var(--r)', cursor:'pointer', transition:'all 0.15s' }}>
                      <span style={{ fontSize:16 }}>{perm.icon}</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:600, color: u[perm.key] ? 'var(--accent2)' : 'var(--muted)', flex:1 }}>{perm.label}</span>
                      <div style={{ width:32, height:18, borderRadius:9, background: u[perm.key] ? 'var(--accent)' : 'var(--bg3)', border:`2px solid ${u[perm.key] ? 'var(--accent)' : 'var(--border2)'}`, position:'relative', transition:'all 0.2s', flexShrink:0 }}>
                        <div style={{ position:'absolute', top:1, left: u[perm.key] ? 13 : 1, width:12, height:12, borderRadius:'50%', background: u[perm.key] ? '#fff' : 'var(--muted)', transition:'left 0.2s' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:'0.75rem' }}>
                  💡 Użytkownik Premium ma automatycznie dostęp do wszystkich funkcji.
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}