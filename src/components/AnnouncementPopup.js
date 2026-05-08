import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function AnnouncementPopup({ session }) {
  const [announcements, setAnnouncements] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!session) return
    if (!navigator.onLine) return
    const seen = JSON.parse(sessionStorage.getItem('seen_announcements') || '[]')
    supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const unseen = (data || []).filter(a => !seen.includes(a.id))
        if (unseen.length > 0) {
          setAnnouncements(unseen)
          setVisible(true)
        }
      })
  }, [session])

  const dismiss = () => {
    const ids = announcements.map(a => a.id)
    const seen = JSON.parse(sessionStorage.getItem('seen_announcements') || '[]')
    sessionStorage.setItem('seen_announcements', JSON.stringify([...seen, ...ids]))
    setVisible(false)
  }

  if (!visible || announcements.length === 0) return null

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'#0f0f13', border:'2px solid rgba(248,113,113,0.45)', borderRadius:16, padding:'2.25rem', maxWidth:500, width:'100%', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 30px 80px rgba(0,0,0,0.8)' }}>

        {/* Nagłówek */}
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.75rem', paddingBottom:'1.25rem', borderBottom:'1px solid rgba(248,113,113,0.15)' }}>
          <span style={{ fontSize:'2rem', lineHeight:1 }}>🚨</span>
          <div>
            <div style={{
              fontFamily:'"Playfair Display", Georgia, "Times New Roman", serif',
              fontSize:'1.35rem',
              fontWeight:700,
              color:'#F87171',
              letterSpacing:'0.3px',
              lineHeight:1.2,
            }}>
              Komunikat Systemowy
            </div>
            <div style={{
              fontFamily:'"Courier New", Courier, monospace',
              fontSize:'0.65rem',
              color:'rgba(248,113,113,0.5)',
              letterSpacing:'3px',
              textTransform:'uppercase',
              marginTop:4,
            }}>
              JumpLogX · Administracja
            </div>
          </div>
        </div>

        {/* Treść powiadomień */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', marginBottom:'2rem' }}>
          {announcements.map((a, i) => (
            <div key={a.id} style={{ borderLeft:'3px solid rgba(248,113,113,0.6)', paddingLeft:'1.25rem' }}>
              {announcements.length > 1 && (
                <div style={{
                  fontFamily:'"Courier New", Courier, monospace',
                  fontSize:'0.62rem',
                  color:'rgba(248,113,113,0.5)',
                  textTransform:'uppercase',
                  letterSpacing:3,
                  marginBottom:'0.5rem',
                }}>
                  {i + 1} / {announcements.length}
                </div>
              )}
              <div style={{
                fontFamily:'"Playfair Display", Georgia, "Times New Roman", serif',
                fontSize:'1.05rem',
                color:'#ececec',
                lineHeight:1.9,
                fontStyle:'italic',
                fontWeight:400,
              }}>
                „{a.message}"
              </div>
              <div style={{
                fontFamily:'"Courier New", Courier, monospace',
                fontSize:'0.68rem',
                color:'rgba(255,255,255,0.2)',
                marginTop:'0.65rem',
                letterSpacing:'0.5px',
              }}>
                {new Date(a.created_at).toLocaleDateString('pl-PL', { day:'numeric', month:'long', year:'numeric' })}
              </div>
            </div>
          ))}
        </div>

        {/* Przycisk */}
        <button
          onClick={dismiss}
          style={{
            width:'100%',
            padding:'0.85rem',
            background:'rgba(248,113,113,0.1)',
            border:'1px solid rgba(248,113,113,0.35)',
            borderRadius:8,
            color:'#F87171',
            fontFamily:'"Playfair Display", Georgia, "Times New Roman", serif',
            fontSize:'1rem',
            fontWeight:600,
            cursor:'pointer',
            letterSpacing:'0.5px',
            transition:'all 0.2s',
            fontStyle:'italic',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(248,113,113,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(248,113,113,0.1)' }}
        >
          Przyjmuję do wiadomości
        </button>
      </div>
    </div>
  )
}