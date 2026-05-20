import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, X, MapPin, ArrowUp, Clock, Plane, Target, CloudSun } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'

const U = {
  bg:      '#0B0E14',
  card:    '#161B22',
  card2:   '#1C2128',
  border:  'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.10)',
  text:    '#F0F6FC',
  muted:   '#8B949E',
  accent:  '#6366F1',
  success: '#3FB950',
  danger:  '#F85149',
  yellow:  '#D29922',
}

function UltraJumpCard({ jump, onClick, onDelete }) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString('pl-PL', { day:'numeric', month:'short', year:'numeric' }) : ''
  return (
    <motion.div
      initial={{ opacity:0, y:8 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0 }}
      onClick={onClick}
      style={{
        background: U.card,
        border: `1px solid ${U.border}`,
        borderRadius: 12,
        padding: '1rem 1.25rem',
        marginBottom: '0.5rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = U.border2}
      onMouseLeave={e => e.currentTarget.style.borderColor = U.border}
    >
      {/* Wiersz 1: numer + data + usuń */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.6rem' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:'0.75rem' }}>
          <span style={{ fontFamily:"'Inter', sans-serif", fontSize:'1.15rem', fontWeight:700, color:U.text }}>#{jump.number}</span>
          <span style={{ fontSize:'0.78rem', color:U.muted }}>{fmt(jump.jump_date)}</span>
          {jump.city && (
            <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.78rem', color:U.muted }}>
              <MapPin size={11} strokeWidth={1.5} /> {jump.city}
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(jump.id) }}
          style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'0.8rem', padding:'0.1rem 0.3rem', lineHeight:1 }}
          onMouseEnter={e => e.target.style.color=U.danger}
          onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.2)'}
        >✕</button>
      </div>

      {/* Wiersz 2: tagi */}
      {(jump.jump_type || jump.parachute) && (
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.6rem' }}>
          {jump.jump_type && (
            <span style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:6, padding:'0.15rem 0.6rem', fontSize:'0.72rem', fontWeight:500, color:'#a5b4fc', letterSpacing:'0.02em' }}>
              {jump.jump_type}
            </span>
          )}
          {jump.parachute && (
            <span style={{ background:'rgba(63,185,80,0.1)', border:'1px solid rgba(63,185,80,0.2)', borderRadius:6, padding:'0.15rem 0.6rem', fontSize:'0.72rem', fontWeight:500, color:'#7ee787', letterSpacing:'0.02em' }}>
              {jump.parachute}
            </span>
          )}
        </div>
      )}

      {/* Wiersz 3: parametry w jednej linii bez pudełek */}
      <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
        {jump.altitude > 0 && (
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.82rem', color:U.muted }}>
            <ArrowUp size={12} strokeWidth={1.5} color={U.muted} />
            <span style={{ color:U.text, fontWeight:500 }}>{jump.altitude}m</span>
          </span>
        )}
        {jump.altitude > 0 && jump.delay > 0 && <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'0.75rem' }}>·</span>}
        {jump.delay > 0 && (
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.82rem', color:U.muted }}>
            <Clock size={12} strokeWidth={1.5} color={U.muted} />
            <span style={{ color:U.text, fontWeight:500 }}>{jump.delay}s</span>
          </span>
        )}
        {jump.delay > 0 && jump.aircraft && <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'0.75rem' }}>·</span>}
        {jump.aircraft && (
          <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.82rem', color:U.muted }}>
            <Plane size={12} strokeWidth={1.5} color={U.muted} />
            <span style={{ color:U.text, fontWeight:500 }}>{jump.aircraft}</span>
          </span>
        )}
        {jump.result && (
          <>
            <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'0.75rem' }}>·</span>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.82rem' }}>
              <Target size={12} strokeWidth={1.5} color={U.success} />
              <span style={{ color:U.success, fontWeight:600 }}>{jump.result} cm</span>
            </span>
          </>
        )}
        {jump.weather && (
          <>
            <span style={{ color:'rgba(255,255,255,0.15)', fontSize:'0.75rem' }}>·</span>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.78rem', color:U.muted }}>
              <CloudSun size={12} strokeWidth={1.5} />
              {jump.weather.split(',')[0]}
            </span>
          </>
        )}
      </div>

      {/* Uwagi */}
      {jump.notes && (
        <div style={{ marginTop:'0.5rem', fontSize:'0.75rem', color:U.muted, borderLeft:`2px solid rgba(99,102,241,0.3)`, paddingLeft:'0.6rem', lineHeight:1.5 }}>
          {jump.notes.length > 80 ? jump.notes.slice(0,80)+'…' : jump.notes}
        </div>
      )}
    </motion.div>
  )
}

function JumpModal({ jump, onClose, onDelete }) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString('pl-PL', { day:'numeric', month:'long', year:'numeric' }) : ''
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' }}>
      <motion.div initial={{ scale:0.97, y:12 }} animate={{ scale:1, y:0 }} exit={{ scale:0.97 }} onClick={e => e.stopPropagation()}
        style={{ background:'#161B22', border:`1px solid ${U.border2}`, borderRadius:16, padding:'2rem', maxWidth:480, width:'100%', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
          <div>
            <div style={{ fontSize:'1.8rem', fontWeight:700, color:U.text, lineHeight:1 }}>Skok #{jump.number}</div>
            <div style={{ fontSize:'0.85rem', color:U.muted, marginTop:4 }}>{fmt(jump.jump_date)}{jump.city ? ` · ${jump.city}` : ''}</div>
          </div>
          <button onClick={onClose} style={{ background:U.card2, border:`1px solid ${U.border}`, borderRadius:8, color:U.muted, cursor:'pointer', padding:'0.45rem 0.9rem', fontFamily:'Inter', fontSize:'0.82rem' }}>Zamknij</button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1.25rem' }}>
          {jump.jump_type && <span style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:6, padding:'0.25rem 0.75rem', fontSize:'0.75rem', color:'#a5b4fc', fontWeight:500 }}>{jump.jump_type}</span>}
          {jump.parachute && <span style={{ background:'rgba(63,185,80,0.1)', border:'1px solid rgba(63,185,80,0.2)', borderRadius:6, padding:'0.25rem 0.75rem', fontSize:'0.75rem', color:'#7ee787', fontWeight:500 }}>{jump.parachute}</span>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
          {[
            { label:'LOKALIZACJA', value:jump.city||'—', icon:<MapPin size={13} strokeWidth={1.5}/> },
            { label:'SAMOLOT', value:jump.aircraft||'—', icon:<Plane size={13} strokeWidth={1.5}/> },
            { label:'WYSOKOŚĆ', value:jump.altitude?`${jump.altitude} m`:'—', icon:<ArrowUp size={13} strokeWidth={1.5}/> },
            { label:'OPÓŹNIENIE', value:jump.delay?`${jump.delay} s`:'—', icon:<Clock size={13} strokeWidth={1.5}/> },
            { label:'WYNIK ACC', value:jump.result||'—', icon:<Target size={13} strokeWidth={1.5}/> },
          ].map(r => (
            <div key={r.label} style={{ background:U.card2, borderRadius:8, padding:'0.75rem 0.9rem', border:`1px solid ${U.border}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4, color:U.muted }}>{r.icon}<span style={{ fontFamily:'var(--mono)', fontSize:'0.58rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>{r.label}</span></div>
              <div style={{ fontSize:'0.9rem', fontWeight:600, color:U.text }}>{r.value}</div>
            </div>
          ))}
        </div>
        {jump.weather && <div style={{ background:U.card2, border:`1px solid ${U.border}`, borderRadius:8, padding:'0.75rem 1rem', marginBottom:'0.75rem', fontSize:'0.85rem', color:U.muted }}><CloudSun size={13} strokeWidth={1.5} style={{ verticalAlign:'middle', marginRight:6 }}/>{jump.weather}</div>}
        {jump.notes && <div style={{ background:U.card2, border:`1px solid ${U.border}`, borderLeft:`3px solid ${U.accent}`, borderRadius:'0 8px 8px 0', padding:'0.75rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:U.muted, lineHeight:1.6 }}>{jump.notes}</div>}
        <button onClick={() => { onClose(); onDelete(jump.id) }} style={{ width:'100%', background:'transparent', border:`1px solid rgba(248,81,73,0.25)`, borderRadius:8, color:U.danger, padding:'0.65rem', cursor:'pointer', fontFamily:'Inter', fontSize:'0.85rem' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(248,81,73,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          🗑 Usuń skok
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function UltraJournal({ jumps, loading, onDelete, onRepeat, repeating, docs=[], urgentDocs=[], urgentRigs=[], profileAlerts=[], qualAlerts=[] }) {
  const [search, setSearch] = useState('')
  const [selectedJump, setSelectedJump] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [visibleCount, setVisibleCount] = useState(20)
  const [showDocs, setShowDocs] = useState(false)

  const totalJumps = jumps.length > 0 ? Math.max(...jumps.map(j => j.number || 0)) : 0

  // Dane do wykresu słupkowego — ostatnie 12 miesięcy
  const perMonth = {}
  jumps.filter(j => j.jump_date).forEach(j => {
    const k = j.jump_date.slice(0,7)
    perMonth[k] = (perMonth[k]||0)+1
  })
  const months = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru']
  const currentYear = new Date().getFullYear()
  const barData = Array.from({length:12}, (_,i) => {
    const key = `${currentYear}-${String(i+1).padStart(2,'0')}`
    return { month: months[i], count: perMonth[key] || 0 }
  })

  const filtered = search
    ? jumps.filter(j =>
        String(j.number).includes(search) ||
        (j.city||'').toLowerCase().includes(search.toLowerCase()) ||
        (j.aircraft||'').toLowerCase().includes(search.toLowerCase()) ||
        (j.parachute||'').toLowerCase().includes(search.toLowerCase()) ||
        (j.jump_type||'').toLowerCase().includes(search.toLowerCase()) ||
        (j.jump_date||'').includes(search)
      )
    : jumps

  const allAlerts = [...urgentRigs, ...profileAlerts, ...qualAlerts]

  return (
    <div style={{ minHeight:'100vh', background:U.bg, paddingBottom:'5rem' }}>

      {/* Alerty */}
      {allAlerts.length > 0 && (
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0.75rem 1.5rem 0' }}>
          {allAlerts.slice(0,2).map((a, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.65rem 1rem', background:'rgba(248,81,73,0.08)', border:'1px solid rgba(248,81,73,0.2)', borderRadius:8, marginBottom:'0.5rem', fontSize:'0.82rem', color:U.danger }}>
              ⚠️ {a.label || a.name} — {a.days < 0 ? `wygasło ${Math.abs(a.days)} dni temu` : `zostało ${a.days} dni`}
            </div>
          ))}
        </div>
      )}

      {/* Layout dwukolumnowy */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'1.5rem', display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1.8fr)', gap:'1.5rem', alignItems:'start' }}>

        {/* ── LEWA KOLUMNA ── */}
        <div>

          {/* Licznik */}
          <div style={{ background:U.card, border:`1px solid ${U.border}`, borderRadius:12, padding:'1.5rem', marginBottom:'1rem' }}>
            <div style={{ fontFamily:"'Inter', sans-serif", fontSize:'0.65rem', fontWeight:500, color:U.muted, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:'0.5rem' }}>
              Łączna liczba skoków
            </div>
            <div style={{ fontFamily:"'Inter', sans-serif", fontSize:'3.5rem', fontWeight:300, color:U.text, lineHeight:1, letterSpacing:'-0.02em', marginBottom:'0.25rem' }}>
              {loading ? '—' : totalJumps}
            </div>
            <div style={{ fontSize:'0.75rem', color:U.muted, marginBottom:'1.25rem', letterSpacing:'0.05em' }}>
              Total Skydives
            </div>

            {/* Wykres słupkowy */}
            <div style={{ height:80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={14}>
                  <XAxis dataKey="month" tick={{ fontSize:9, fill:U.muted }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background:'#1C2128', border:`1px solid ${U.border2}`, borderRadius:8, fontSize:'0.75rem', color:U.text }}
                    cursor={{ fill:'rgba(255,255,255,0.03)' }}
                    formatter={(v) => [`${v} skoków`]}
                  />
                  <Bar dataKey="count" fill={U.accent} radius={[3,3,0,0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Przyciski akcji */}
          <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem' }}>
            <Link to="/add" style={{ flex:1, textDecoration:'none' }}>
              <button style={{ width:'100%', background:'#ffffff', color:'#0B0E14', border:'none', borderRadius:8, padding:'0.65rem', fontFamily:'Inter', fontSize:'0.85rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='#F0F6FC'}
                onMouseLeave={e => e.currentTarget.style.background='#ffffff'}>
                + Dodaj skok
              </button>
            </Link>
            {jumps.length > 0 && (
              <button onClick={onRepeat} disabled={repeating}
                style={{ flex:1, background:'transparent', border:`1px solid ${U.border2}`, borderRadius:8, color:U.muted, padding:'0.65rem', fontFamily:'Inter', fontSize:'0.85rem', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; e.currentTarget.style.color=U.text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=U.border2; e.currentTarget.style.color=U.muted }}>
                {repeating ? '...' : '↩ Powtórz'}
              </button>
            )}
          </div>

          {/* Dokumenty */}
          {docs.length > 0 && (
            <div style={{ background:U.card, border:`1px solid ${U.border}`, borderRadius:12, overflow:'hidden' }}>
              <button onClick={() => setShowDocs(d => !d)}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', background:'transparent', border:'none', cursor:'pointer', color:U.text }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:500 }}>Moje dokumenty</span>
                  {urgentDocs.length > 0 && (
                    <span style={{ background:'rgba(210,153,34,0.15)', border:'1px solid rgba(210,153,34,0.3)', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.68rem', color:U.yellow, fontWeight:600 }}>
                      {urgentDocs.length} wymaga uwagi
                    </span>
                  )}
                </div>
                <span style={{ color:U.muted, fontSize:'0.75rem' }}>{showDocs ? '▲' : '▼'}</span>
              </button>
              {showDocs && (
                <div style={{ borderTop:`1px solid ${U.border}`, padding:'0.75rem 1.25rem' }}>
                  {docs.map(doc => {
                    const expired = doc.days !== null && doc.days < 0
                    const warning = doc.days !== null && doc.days <= 30
                    const color = expired ? U.danger : warning ? U.yellow : U.success
                    return (
                      <div key={doc.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.35rem 0', borderBottom:`1px solid ${U.border}` }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <div style={{ width:6, height:6, borderRadius:'50%', background:doc.noExpiry ? U.success : color, flexShrink:0 }} />
                          <span style={{ fontSize:'0.82rem', color:U.muted }}>{doc.label}</span>
                        </div>
                        {!doc.noExpiry && doc.days !== null && (
                          <span style={{ fontSize:'0.72rem', color, fontFamily:'var(--mono)' }}>
                            {doc.days < 0 ? `${Math.abs(doc.days)}d temu` : `${doc.days}d`}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PRAWA KOLUMNA ── */}
        <div>
          {/* Header sekcji */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span style={{ fontFamily:"'Inter', sans-serif", fontSize:'1.1rem', fontWeight:600, color:U.text }}>Dziennik skoków</span>
              <span style={{ background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:20, padding:'0.1rem 0.6rem', fontSize:'0.68rem', color:'#a5b4fc', fontWeight:500, letterSpacing:'0.05em' }}>ULTRA</span>
            </div>
          </div>

          {/* Wyszukiwarka */}
          <div style={{ position:'relative', marginBottom:'1rem' }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:U.muted }} strokeWidth={1.5} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setVisibleCount(20) }}
              placeholder="Szukaj skoku..."
              style={{ width:'100%', background:U.card, border:`1px solid ${U.border}`, borderRadius:8, padding:'0.6rem 0.85rem 0.6rem 2.25rem', color:U.text, fontFamily:'Inter', fontSize:'0.85rem', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.4)'}
              onBlur={e => e.target.style.borderColor=U.border}
            />
            {search && (
              <button onClick={() => { setSearch(''); setVisibleCount(20) }}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:U.muted, cursor:'pointer', padding:0 }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lista skoków */}
          {loading && <div style={{ textAlign:'center', padding:'3rem', color:U.muted, fontSize:'0.85rem' }}>Ładowanie...</div>}

          {!loading && jumps.length === 0 && (
            <div style={{ background:U.card, border:`1px solid ${U.border}`, borderRadius:12, padding:'3rem', textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem', opacity:0.3 }}>🪂</div>
              <p style={{ color:U.muted, marginBottom:'1rem', fontSize:'0.9rem' }}>Brak skoków</p>
              <Link to="/add" style={{ textDecoration:'none' }}>
                <button style={{ background:'#ffffff', color:'#0B0E14', border:'none', borderRadius:8, padding:'0.65rem 1.5rem', fontFamily:'Inter', fontWeight:600, cursor:'pointer' }}>
                  + Dodaj pierwszy skok
                </button>
              </Link>
            </div>
          )}

          <AnimatePresence>
            {!loading && filtered.slice(0, visibleCount).map(j => (
              <UltraJumpCard
                key={j.id}
                jump={j}
                onClick={() => setSelectedJump(j)}
                onDelete={(id) => setConfirmDelete({ id, number:j.number })}
              />
            ))}
          </AnimatePresence>

          {!loading && search && filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'2rem', color:U.muted, fontSize:'0.85rem' }}>
              Brak wyników dla „{search}"
            </div>
          )}

          {!loading && filtered.length > visibleCount && (
            <div style={{ textAlign:'center', padding:'1rem 0' }}>
              <button
                onClick={() => setVisibleCount(v => v + 20)}
                style={{ background:'transparent', border:`1px solid ${U.border2}`, borderRadius:8, color:U.muted, padding:'0.6rem 2rem', fontFamily:'Inter', fontSize:'0.85rem', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.25)'; e.currentTarget.style.color=U.text }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=U.border2; e.currentTarget.style.color=U.muted }}>
                Pokaż więcej ({filtered.length - visibleCount} pozostałych)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FAB mobile */}
      <Link to="/add" style={{ textDecoration:'none', position:'fixed', bottom:'2rem', right:'2rem', zIndex:50 }}>
        <motion.button
          whileHover={{ scale:1.05 }}
          whileTap={{ scale:0.95 }}
          style={{ width:52, height:52, borderRadius:'50%', background:'#ffffff', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.4)', color:'#0B0E14' }}>
          <Plus size={20} strokeWidth={2.5} />
        </motion.button>
      </Link>

      {/* Modal */}
      <AnimatePresence>
        {selectedJump && <JumpModal jump={selectedJump} onClose={() => setSelectedJump(null)} onDelete={(id) => { setSelectedJump(null); setConfirmDelete({ id, number:selectedJump.number }) }} />}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <motion.div initial={{ scale:0.97 }} animate={{ scale:1 }} exit={{ scale:0.97 }}
              style={{ background:'#161B22', border:`1px solid ${U.border2}`, borderRadius:12, padding:'1.75rem', maxWidth:360, width:'100%' }}>
              <div style={{ fontFamily:'Inter', fontSize:'1rem', fontWeight:600, marginBottom:'0.75rem', color:U.text }}>Usuń skok #{confirmDelete.number}?</div>
              <p style={{ fontSize:'0.85rem', color:U.muted, marginBottom:'1.25rem' }}>Tej operacji nie można cofnąć.</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={() => setConfirmDelete(null)}
                  style={{ flex:1, padding:'0.65rem', background:'transparent', border:`1px solid ${U.border}`, borderRadius:8, color:U.muted, fontFamily:'Inter', cursor:'pointer' }}>
                  Anuluj
                </button>
                <button onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null) }}
                  style={{ flex:1, padding:'0.65rem', background:'rgba(248,81,73,0.12)', border:'1px solid rgba(248,81,73,0.25)', borderRadius:8, color:U.danger, fontFamily:'Inter', cursor:'pointer', fontWeight:600 }}>
                  Usuń
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive — na mobile jedna kolumna */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
