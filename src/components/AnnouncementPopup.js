import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function AnnouncementPopup({ session }) {
  const [announcements, setAnnouncements] = useState([])
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!session) return
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'#0f0f13', border:'2px solid rgba(248,113,113,0.5)', borderRadius:16, padding:'2rem', maxWidth:480, width:'100%', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 25px 60px rgba(0,0,0,0.7)' }}>

        {/* Nagłówek */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'1px solid rgba(248,113,113,0.2)' }}>
          <span style={{ fontSize:'1.75rem' }}>🚨</span>
          <div>
            <div style={{ fontFamily:'Georgia, "Times New Roman", serif', fontSize:'1.2rem', fontWeight:700, color:'#F87171', letterSpacing:'0.5px' }}>
              Komunikat Systemowy
            </div>
            <div style={{ fontFamily:'Georgia, "Times New Roman", serif', fontSize:'0.72rem', color:'rgba(248,113,113,0.6)', letterSpacing:'2px', textTransform:'uppercase', marginTop:2 }}>
              JumpLogX · Administracja
            </div>
          </div>
        </div>

        {/* Treść powiadomień */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'1.5rem' }}>
          {announcements.map((a, i) => (
            <div key={a.id} style={{ borderLeft:'3px solid #F87171', paddingLeft:'1rem' }}>
              {announcements.length > 1 && (
                <div style={{ fontFamily:'Georgia, "Times New Roman", serif', fontSize:'0.68rem', color:'rgba(248,113,113,0.6)', textTransform:'uppercase', letterSpacing:2, marginBottom:'0.4rem' }}>
                  {i + 1} / {announcements.length}
                </div>
              )}
              <div style={{ fontFamily:'Georgia, "Times New Roman", serif', fontSize:'0.95rem', color:'#e8e8e8', lineHeight:1.8, fontStyle:'italic' }}>
                „{a.message}"
              </div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'0.99rem', color:'rgba(255,255,255,0.25)', marginTop:'0.5rem' }}>
                {new Date(a.created_at).toLocaleDateString('pl-PL', { day:'numeric', month:'long', year:'numeric' })}
              </div>
            </div>
          ))}
        </div>

        {/* Przycisk */}
        <button onClick={dismiss}
          style={{ width:'100%', padding:'0.75rem', background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.4)', borderRadius:8, color:'#F87171', fontFamily:'Georgia, "Times New Roman", serif', fontSize:'0.9rem', fontWeight:600, cursor:'pointer', letterSpacing:'0.5px', transition:'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(248,113,113,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(248,113,113,0.15)' }}>
          Przyjmuję do wiadomości
        </button>
      </div>
    </div>
  )
}