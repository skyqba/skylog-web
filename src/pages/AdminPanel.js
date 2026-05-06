import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useProfile } from '../useProfile'
import { useNavigate } from 'react-router-dom'

const PERMISSIONS = [
  { key: 'perm_export',   label: 'Eksport',    icon: '📄' },
  { key: 'perm_import',   label: 'Import',     icon: '📂' },
  { key: 'perm_stats',    label: 'Statystyki', icon: '📊' },
  { key: 'perm_language', label: 'Język',      icon: '🌐' },
]

export default function AdminPanel() {
  const { isAdmin, loading } = useProfile()
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('users')
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!isAdmin) { navigate('/'); return }
    supabase
      .from('profiles_with_email')
      .select('id, email, is_premium, is_admin, perm_export, perm_import, perm_stats, perm_language')
      .then(({ data }) => { setUsers(data || []); setLoadingUsers(false) })
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setAnnouncements(data || []))
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

  const addAnnouncement = async () => {
    if (!newMsg.trim()) return
    setSaving(true)
    const { data } = await supabase
      .from('announcements')
      .insert({ message: newMsg.trim(), type: 'danger', active: true })
      .select().single()
    if (data) setAnnouncements(prev => [data, ...prev])
    setNewMsg('')
    setSaving(false)
  }

  const toggleAnnouncement = async (id, current) => {
    await supabase.from('announcements').update({ active: !current }).eq('id', id)
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !current } : a))
  }

  const deleteAnnouncement = async (id) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  if (loading || loadingUsers) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)' }}>
      Ładowanie...
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.5rem', fontWeight:900, margin:0 }}>🛡 Panel Admina</h2>
          <div style={{ color:'var(--muted)', fontSize:'0.8rem', marginTop:'0.25rem' }}>{users.length} użytkowników w systemie</div>
        </div>
        <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>
          ← Wróć
        </button>
      </div>
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem' }}>
        {[{ key:'users', label:'👥 Użytkownicy' }, { key:'announcements', label:'📢 Powiadomienia' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding:'0.5rem 1.1rem', background: tab === t.key ? 'var(--accent)' : 'transparent', border:`1px solid ${tab === t.key ? 'var(--accent)' : 'var(--border)'}`, borderRadius:8, color: tab === t.key ? '#fff' : 'var(--muted)', fontFamily:'var(--font)', fontSize:'0.85rem', fontWeight: tab === t.key ? 600 : 400, cursor:'pointer', transition:'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'users' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {users.map(u => {
            const activePerm = PERMISSIONS.filter(p => u[p.key])
            return (
              <div key={u.id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r2)', overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.85rem 1rem' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background: u.is_premium ? 'rgba(108,99,255,0.15)' : 'var(--bg3)', border:`1px solid ${u.is_premium ? 'var(--accent)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                    {u.is_admin ? '🛡' : u.is_premium ? '⭐' : '👤'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.88rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {u.email || 'Brak emaila'}
                      {u.is_admin && <span style={{ marginLeft:'0.5rem', fontSize:'0.65rem', fontFamily:'var(--mono)', color:'var(--accent2)', fontWeight:700, letterSpacing:1 }}>ADMIN</span>}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', marginTop:'0.35rem' }}>
                      {u.is_premium && <span style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.4)', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.68rem', color:'var(--accent2)', fontWeight:600 }}>⭐ Premium</span>}
                      {!u.is_premium && activePerm.length === 0 && !u.is_admin && <span style={{ display:'inline-flex', alignItems:'center', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.68rem', color:'var(--muted)' }}>brak uprawnień</span>}
                      {!u.is_premium && activePerm.map(p => (
                        <span key={p.key} style={{ display:'inline-flex', alignItems:'center', gap:'0.25rem', background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.68rem', color:'var(--success)', fontWeight:600 }}>
                          {p.icon} {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!u.is_admin && (
                    <div style={{ display:'flex', gap:'0.4rem', alignItems:'center', flexShrink:0 }}>
                      <button onClick={() => togglePremium(u)}
                        style={{ background: u.is_premium ? 'rgba(108,99,255,0.15)' : 'transparent', border:`1px solid ${u.is_premium ? 'var(--accent)' : 'var(--border)'}`, borderRadius:8, padding:'0.35rem 0.75rem', cursor:'pointer', color: u.is_premium ? 'var(--accent2)' : 'var(--muted)', fontFamily:'var(--font)', fontSize:'0.78rem', fontWeight:600, whiteSpace:'nowrap' }}>
                        {u.is_premium ? '⭐ Premium' : '+ Premium'}
                      </button>
                      <button onClick={() => setExpanded(expanded === u.id ? null : u.id)}
                        style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'0.35rem 0.55rem', cursor:'pointer', color:'var(--muted)', fontSize:'0.75rem' }}>
                        {expanded === u.id ? '▲' : '▼'}
                      </button>
                    </div>
                  )}
                </div>
                {expanded === u.id && !u.is_admin && (
                  <div style={{ borderTop:'1px solid var(--border)', padding:'1rem', background:'var(--bg3)' }}>
                    <div style={{ fontSize:'0.72rem', color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1, marginBottom:'0.75rem' }}>Indywidualne uprawnienia</div>
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
                    <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:'0.75rem' }}>💡 Użytkownik Premium ma automatycznie dostęp do wszystkich funkcji.</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {tab === 'announcements' && (
        <div>
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1rem' }}>🚨 Nowe powiadomienie</h3>
            <textarea value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Wpisz treść powiadomienia..." rows={3}
              style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', fontFamily:'var(--font)', fontSize:'0.88rem', padding:'0.75rem', outline:'none', resize:'vertical', boxSizing:'border-box', marginBottom:'0.75rem' }} />
            <button onClick={addAnnouncement} disabled={saving || !newMsg.trim()} className="btn" style={{ width:'auto', padding:'0.5rem 1.5rem' }}>
              {saving ? 'Wysyłanie...' : '🚨 Wyślij powiadomienie'}
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {announcements.length === 0 && <div style={{ textAlign:'center', padding:'2rem', color:'var(--muted)', fontSize:'0.85rem' }}>Brak powiadomień</div>}
            {announcements.map(a => (
              <div key={a.id} style={{ background: a.active ? 'rgba(248,113,113,0.1)' : 'var(--bg2)', border:`1px solid ${a.active ? 'rgba(248,113,113,0.4)' : 'var(--border)'}`, borderRadius:'var(--r2)', padding:'1rem', opacity: a.active ? 1 : 0.5 }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                      <span>🚨</span>
                      <span style={{ fontSize:'0.68rem', fontFamily:'var(--mono)', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>Ważne</span>
                      <span style={{ fontSize:'0.68rem', color:'var(--muted)' }}>· {new Date(a.created_at).toLocaleDateString('pl-PL')}</span>
                      {a.active ? <span style={{ fontSize:'0.68rem', color:'var(--success)', fontWeight:600 }}>● Aktywne</span> : <span style={{ fontSize:'0.68rem', color:'var(--muted)' }}>○ Nieaktywne</span>}
                    </div>
                    <div style={{ fontSize:'0.88rem', color:'var(--text)', lineHeight:1.5 }}>{a.message}</div>
                  </div>
                  <div style={{ display:'flex', gap:'0.4rem', flexShrink:0 }}>
                    <button onClick={() => toggleAnnouncement(a.id, a.active)}
                      style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:7, color:'var(--muted)', cursor:'pointer', fontSize:'0.75rem', padding:'0.3rem 0.65rem', fontFamily:'var(--font)' }}>
                      {a.active ? 'Wyłącz' : 'Włącz'}
                    </button>
                    <button onClick={() => deleteAnnouncement(a.id)} style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1rem' }}
                      onMouseEnter={e => e.target.style.color='var(--danger)'}
                      onMouseLeave={e => e.target.style.color='var(--muted)'}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
