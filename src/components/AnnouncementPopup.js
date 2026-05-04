import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const TYPES = {
  info:    { color:'rgba(108,99,255,0.15)', border:'rgba(108,99,255,0.4)', textColor:'var(--accent2)', icon:'ℹ️', label:'Informacja' },
  warning: { color:'rgba(251,191,36,0.1)',  border:'rgba(251,191,36,0.4)', textColor:'#FBBF24',        icon:'⚠️', label:'Ostrzeżenie' },
  danger:  { color:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.4)',textColor:'var(--danger)',   icon:'🚨', label:'Ważne' },
  success: { color:'rgba(52,211,153,0.1)',  border:'rgba(52,211,153,0.3)', textColor:'var(--success)', icon:'✅', label:'Sukces' },
}

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
      .then(({ data, error }) => {
        console.log('ANNOUNCEMENTS:', data, error)
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
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.75rem', maxWidth:480, width:'100%', maxHeight:'80vh', overflowY:'auto' }}>
        <div style={{ fontFamily:'var(--head)', fontSize:'1.1rem', fontWeight:800, marginBottom:'1.25rem' }}>
          📢 Powiadomienia
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
          {announcements.map(a => {
            const type = TYPES[a.type] || TYPES.info
            return (
              <div key={a.id} style={{ background:type.color, border:`1px solid ${type.border}`, borderRadius:'var(--r)', padding:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.4rem' }}>
                  <span>{type.icon}</span>
                  <span style={{ fontSize:'0.75rem', fontWeight:700, color:type.textColor, fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1 }}>
                    {type.label}
                  </span>
                </div>
                <div style={{ fontSize:'0.9rem', color:'var(--text)', lineHeight:1.6 }}>{a.message}</div>
              </div>
            )
          })}
        </div>
        <button onClick={dismiss} className="btn" style={{ width:'100%' }}>
          Rozumiem ✓
        </button>
      </div>
    </div>
  )
}
