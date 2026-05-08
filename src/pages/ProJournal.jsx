import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Wind, ArrowUp, Clock, MapPin, Plus, Search, X, Target, CloudSun } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip } from 'recharts'

const COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899']

function GlassCard({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ background:'rgba(30,41,59,0.6)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderTop:'1px solid rgba(255,255,255,0.18)', borderRadius:20, boxShadow:'0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)', ...style }}>
      {children}
    </div>
  )
}

function MiniChip({ icon, label, value }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:9, padding:'0.4rem 0.55rem', border:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'0.35rem' }}>
      <span style={{ color:'#64748B' }}>{icon}</span>
      <div>
        <div style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', color:'#475569', textTransform:'uppercase', letterSpacing:0.8, lineHeight:1 }}>{label}</div>
        <div style={{ fontSize:'0.75rem', fontWeight:600, color:'#CBD5E1', lineHeight:1.3 }}>{value}</div>
      </div>
    </div>
  )
}

function JumpCardPro({ jump, onDelete, onClick }) {
  const fmt = (d) => new Date(d).toLocaleDateString('pl-PL', { day:'numeric', month:'short', year:'numeric' })
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
      whileHover={{ y:-3, transition:{ duration:0.2 } }} onClick={onClick}
      style={{ background:'rgba(30,41,59,0.55)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.08)', borderTop:'1px solid rgba(255,255,255,0.14)', borderRadius:18, padding:'0.85rem 1rem', marginBottom:'0.65rem', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.35)', display:'flex', flexDirection:'column', gap:'0.75rem' }}
      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(139,92,246,0.4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
    >
      {/* Górny wiersz — numer, data, tagi, usuń */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap', flex:1, minWidth:0 }}>
          <div style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ fontFamily:'var(--head)', fontSize:'1.2rem', fontWeight:900, color:'#fff', lineHeight:1, textShadow:'0 0 20px rgba(139,92,246,0.5)' }}>#{jump.number}</span>
            <span style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'#94A3B8', marginTop:2 }}>{new Date(jump.jump_date).toLocaleDateString('pl-PL', { day:'numeric', month:'short', year:'numeric' })}</span>
          </div>
          {jump.city && <div style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}><MapPin size={11} color='#94A3B8' strokeWidth={1.5} /><span style={{ fontSize:'0.78rem', color:'#CBD5E1', fontWeight:500 }}>{jump.city}</span></div>}
          {jump.jump_type && <span style={{ background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:6, padding:'0.15rem 0.55rem', fontSize:'0.68rem', fontWeight:600, color:'#A78BFA', fontFamily:'var(--mono)' }}>{jump.jump_type}</span>}
          {jump.parachute && <span style={{ background:'rgba(103,232,249,0.1)', border:'1px solid rgba(103,232,249,0.25)', borderRadius:6, padding:'0.15rem 0.55rem', fontSize:'0.68rem', fontWeight:600, color:'#67E8F9', fontFamily:'var(--mono)' }}>{jump.parachute}</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(jump.id) }} style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'0.8rem', padding:'0.15rem 0.3rem', borderRadius:4, lineHeight:1, flexShrink:0 }} onMouseEnter={e => e.target.style.color='#F87171'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.2)'}>✕</button>
      </div>
      {/* Chips — alt, delay, plane */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.4rem' }}>
        <MiniChip icon={<ArrowUp size={11} strokeWidth={1.5} />} label="Alt" value={jump.altitude ? `${jump.altitude}m` : '—'} />
        <MiniChip icon={<Clock size={11} strokeWidth={1.5} />} label="Delay" value={jump.delay ? `${jump.delay}s` : '—'} />
        <MiniChip icon={<Plane size={11} strokeWidth={1.5} />} label="Plane" value={jump.aircraft || '—'} />
      </div>
      {/* Pogoda */}
      {jump.weather && (
        <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.18)', borderRadius:10, padding:'0.5rem 0.75rem', display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
          <CloudSun size={13} color='#93C5FD' strokeWidth={1.5} />
          <span style={{ fontSize:'0.8rem', fontWeight:600, color:'#93C5FD' }}>{jump.weather.split(',')[0]}</span>
          {jump.weather.split(',')[1] && <span style={{ fontSize:'0.75rem', color:'#64748B' }}>{jump.weather.split(',').slice(1).join(',').trim()}</span>}
        </div>
      )}
      {/* Wynik + notatki */}
      {(jump.result || jump.notes) && (
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
          {jump.result && <div style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}><Target size={11} color='#10B981' strokeWidth={1.5} /><span style={{ fontSize:'0.82rem', fontWeight:700, color:'#10B981' }}>{jump.result}</span></div>}
          {jump.notes && <div style={{ fontSize:'0.72rem', color:'#64748B', paddingLeft:'0.5rem', borderLeft:'2px solid rgba(139,92,246,0.4)', lineHeight:1.5, flex:1 }}>{jump.notes.length > 60 ? jump.notes.slice(0,60)+'…' : jump.notes}</div>}
        </div>
      )}
    </motion.div>
  )
}

function JumpModal({ jump, onClose, onDelete }) {
  const fmt = (d) => new Date(d).toLocaleDateString('pl-PL', { day:'numeric', month:'long', year:'numeric' })
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(4px)' }}>
      <motion.div initial={{ scale:0.95, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:20 }} onClick={e => e.stopPropagation()}
        style={{ background:'rgba(15,23,42,0.97)', border:'1px solid rgba(255,255,255,0.12)', borderTop:'1px solid rgba(255,255,255,0.2)', borderRadius:24, padding:'2rem', maxWidth:500, width:'100%', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
          <div>
            <div style={{ fontFamily:'var(--head)', fontSize:'2rem', fontWeight:900, color:'#fff', textShadow:'0 0 30px rgba(139,92,246,0.6)', lineHeight:1 }}>Skok #{jump.number}</div>
            <div style={{ fontSize:'0.82rem', color:'#94A3B8', marginTop:4 }}>{fmt(jump.jump_date)}{jump.city ? ` · ${jump.city}` : ''}</div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#94A3B8', cursor:'pointer', padding:'0.45rem 0.9rem', fontFamily:'var(--font)', fontSize:'0.82rem' }}>Zamknij</button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1.25rem' }}>
          {jump.jump_type && <span style={{ background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:8, padding:'0.25rem 0.75rem', fontSize:'0.75rem', color:'#A78BFA', fontWeight:600, fontFamily:'var(--mono)' }}>{jump.jump_type}</span>}
          {jump.parachute && <span style={{ background:'rgba(103,232,249,0.1)', border:'1px solid rgba(103,232,249,0.25)', borderRadius:8, padding:'0.25rem 0.75rem', fontSize:'0.75rem', color:'#67E8F9', fontWeight:600, fontFamily:'var(--mono)' }}>{jump.parachute}</span>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1.25rem' }}>
          {[{ icon:<MapPin size={14} strokeWidth={1.5}/>, label:'Miejscowość', value:jump.city||'—' },{ icon:<Plane size={14} strokeWidth={1.5}/>, label:'Samolot', value:jump.aircraft||'—' },{ icon:<ArrowUp size={14} strokeWidth={1.5}/>, label:'Wysokość', value:jump.altitude?`${jump.altitude} m`:'—' },{ icon:<Clock size={14} strokeWidth={1.5}/>, label:'Opóźnienie', value:jump.delay?`${jump.delay} s`:'—' },{ icon:<Target size={14} strokeWidth={1.5}/>, label:'Wynik', value:jump.result||'—', color:jump.result?'#10B981':undefined }].map(r => (
            <div key={r.label} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'0.75rem 0.9rem', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', marginBottom:4, color:'#64748B' }}>{r.icon}<span style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:1 }}>{r.label}</span></div>
              <div style={{ fontSize:'0.9rem', fontWeight:600, color:r.color||'#F1F5F9' }}>{r.value}</div>
            </div>
          ))}
        </div>
        {jump.weather && <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:14, padding:'0.9rem 1rem', marginBottom:'1rem' }}><div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:4 }}><CloudSun size={14} color='#93C5FD' strokeWidth={1.5}/><span style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'#64748B', textTransform:'uppercase', letterSpacing:1 }}>Pogoda</span></div><div style={{ fontSize:'0.88rem', color:'#93C5FD', fontWeight:500 }}>{jump.weather}</div></div>}
        {jump.notes && <div style={{ background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', borderLeft:'3px solid #8B5CF6', borderRadius:14, padding:'0.9rem 1rem', marginBottom:'1rem' }}><div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'#64748B', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Uwagi</div><div style={{ fontSize:'0.85rem', color:'#CBD5E1', lineHeight:1.6 }}>{jump.notes}</div></div>}
        <button onClick={() => { onClose(); onDelete(jump.id) }} style={{ width:'100%', background:'transparent', border:'1px solid rgba(248,113,113,0.25)', borderRadius:12, color:'#F87171', padding:'0.65rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.85rem' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.08)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>🗑 Usuń skok</button>
      </motion.div>
    </motion.div>
  )
}

export default function ProJournal({ jumps, loading, onDelete, onRepeat, repeating, docs = [], urgentDocs = [] }) {
  const [search, setSearch] = useState('')
  const [showDocs, setShowDocs] = useState(false)
  const [selectedJump, setSelectedJump] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const totalJumps = jumps.length > 0 ? Math.max(...jumps.map(j => j.number || 0)) : 0

  const perMonth = {}
  jumps.filter(j => j.jump_date).forEach(j => { const k = j.jump_date.slice(0,7); perMonth[k] = (perMonth[k]||0)+1 })
  const monthData = Object.entries(perMonth).sort().slice(-6).map(([m,c]) => ({ month:m.slice(5), count:c }))

  const perType = {}
  jumps.filter(j => j.jump_type).forEach(j => { perType[j.jump_type] = (perType[j.jump_type]||0)+1 })
  const typeData = Object.entries(perType).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value]) => ({ name, value }))

  const filtered = search ? jumps.filter(j =>
    String(j.number).includes(search) || (j.city||'').toLowerCase().includes(search.toLowerCase()) ||
    (j.aircraft||'').toLowerCase().includes(search.toLowerCase()) || (j.parachute||'').toLowerCase().includes(search.toLowerCase()) ||
    (j.jump_type||'').toLowerCase().includes(search.toLowerCase()) || (j.jump_date||'').includes(search)
  ) : jumps

  return (
    <div style={{ minHeight:'100vh', padding:'1.5rem 1rem 5rem', position:'relative' }}>
      <div style={{ position:'relative', zIndex:1, maxWidth:780, margin:'0 auto' }}>

        {/* Dokumenty */}
        {docs.length > 0 && (
          <div style={{ background:'rgba(30,41,59,0.6)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderTop:'1px solid rgba(255,255,255,0.18)', borderRadius:20, marginBottom:'1rem', overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
            <button onClick={() => setShowDocs(d => !d)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.85rem 1.1rem', background:'transparent', border:'none', cursor:'pointer', color:'#F1F5F9', fontFamily:'var(--font)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ fontSize:15 }}>📋</span>
                <span style={{ fontSize:'0.88rem', fontWeight:500, fontFamily:'Inter, sans-serif' }}>Moje dokumenty</span>
                {urgentDocs.length > 0 && (
                  <span style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.4)', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.72rem', color:'#FBBF24', fontWeight:600 }}>
                    {urgentDocs.length} wymaga uwagi
                  </span>
                )}
              </div>
              <span style={{ color:'#64748B', fontSize:'0.8rem' }}>{showDocs ? '▲' : '▼'}</span>
            </button>
            {showDocs && (
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'0.75rem 1.1rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                {docs.map(doc => {
                  const expired = doc.days !== null && doc.days < 0
                  const warning = doc.days !== null && doc.days <= 30
                  const color = expired ? '#F87171' : warning ? '#FBBF24' : '#10B981'
                  const dot = expired ? '#F87171' : warning ? '#FBBF24' : '#10B981'
                  const fmt = doc.expiry ? new Date(doc.expiry).toLocaleDateString('pl-PL') : ''
                  return (
                    <div key={doc.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background: doc.noExpiry ? '#10B981' : dot, flexShrink:0 }} />
                        <span style={{ fontSize:'0.85rem', color:'#94A3B8', fontFamily:'Inter, sans-serif' }}>{doc.label}</span>
                      </div>
                      <span style={{ fontFamily:'Inter, sans-serif', fontSize:'0.78rem', color: doc.noExpiry ? '#10B981' : color }}>
                        {doc.noExpiry ? '' : doc.days < 0
                          ? `Wygasło ${Math.abs(doc.days)} dni temu`
                          : doc.days <= 30
                            ? `Wygasa za ${doc.days} dni`
                            : `Ważne do ${fmt}`}
                      </span>
                    </div>
                  )
                })}
                <a href="/profile" style={{ color:'#A78BFA', textDecoration:'none', fontSize:'0.78rem', marginTop:'0.25rem', display:'inline-block' }}>Zarządzaj dokumentami →</a>
              </div>
            )}
          </div>
        )}

        {/* Hero stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'1rem', marginBottom:'1.25rem' }}>
          <GlassCard style={{ padding:'1.5rem' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'#64748B', textTransform:'uppercase', letterSpacing:2, marginBottom:8 }}>Łączna liczba skoków</div>
            <div style={{ fontFamily:'var(--head)', fontSize:'4rem', fontWeight:900, lineHeight:1, color:'#fff', textShadow:'0 0 30px rgba(139,92,246,0.7), 0 0 60px rgba(139,92,246,0.3)' }}>{loading ? '—' : totalJumps}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.68rem', color:'#64748B', marginTop:6 }}>Total Skydives</div>
            {monthData.length > 1 && <div style={{ marginTop:'1rem', height:50 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={monthData}><Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>}
          </GlassCard>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {typeData.length > 0 && (
              <GlassCard style={{ padding:'1rem', flex:1 }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.58rem', color:'#64748B', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 }}>Typy skoków</div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:60, height:60, flexShrink:0 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={typeData} cx="50%" cy="50%" innerRadius={18} outerRadius={28} dataKey="value" strokeWidth={0}>{typeData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie></PieChart></ResponsiveContainer></div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:3 }}>{typeData.slice(0,3).map((t,i)=><div key={t.name} style={{ display:'flex', alignItems:'center', gap:'0.35rem' }}><div style={{ width:6, height:6, borderRadius:'50%', background:COLORS[i], flexShrink:0 }}/><span style={{ fontSize:'0.68rem', color:'#94A3B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</span><span style={{ fontSize:'0.68rem', color:'#64748B', marginLeft:'auto', fontFamily:'var(--mono)' }}>{t.value}</span></div>)}</div>
                </div>
              </GlassCard>
            )}
            {monthData.length > 0 && (
              <GlassCard style={{ padding:'1rem', flex:1 }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.58rem', color:'#64748B', textTransform:'uppercase', letterSpacing:1.5, marginBottom:8 }}>Ostatnie miesiące</div>
                <div style={{ height:50 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={monthData} barSize={10}><Bar dataKey="count" radius={[3,3,0,0]}>{monthData.map((_,i)=><Cell key={i} fill={i===monthData.length-1?'#8B5CF6':'rgba(139,92,246,0.4)'}/>)}</Bar><Tooltip contentStyle={{ background:'rgba(15,23,42,0.9)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:'0.75rem', color:'#fff' }} cursor={{ fill:'rgba(255,255,255,0.03)' }}/></BarChart></ResponsiveContainer></div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Dziennik header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.85rem', gap:'0.75rem', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, color:'#fff' }}>Dziennik skoków</span>
            <span style={{ background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', borderRadius:20, padding:'0.1rem 0.6rem', fontSize:'0.68rem', color:'#A78BFA', fontFamily:'var(--mono)', fontWeight:600 }}>PRO</span>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <div style={{ position:'relative' }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#64748B' }} strokeWidth={1.5}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Szukaj..." style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, padding:'0.45rem 0.85rem 0.45rem 2rem', color:'#fff', fontFamily:'var(--font)', fontSize:'0.82rem', outline:'none', width:160 }}/>
              {search && <button onClick={()=>setSearch('')} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#64748B', cursor:'pointer', padding:0, lineHeight:1 }}><X size={12}/></button>}
            </div>
            {jumps.length > 0 && <button onClick={onRepeat} disabled={repeating} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:50, color:'#94A3B8', padding:'0.45rem 1rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.78rem', fontWeight:500 }}>{repeating ? '...' : '↩ Powtórz'}</button>}
          </div>
        </div>

        {loading && <div style={{ textAlign:'center', padding:'4rem', color:'#64748B' }}>Ładowanie...</div>}
        {!loading && jumps.length === 0 && (
          <GlassCard style={{ padding:'3rem', textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:'1rem', opacity:0.3 }}>🪂</div>
            <p style={{ color:'#64748B', marginBottom:'1rem' }}>Brak skoków</p>
            <Link to="/add" style={{ textDecoration:'none' }}><button style={{ background:'linear-gradient(135deg,#8B5CF6,#3B82F6)', border:'none', borderRadius:12, color:'#fff', padding:'0.65rem 1.5rem', fontFamily:'var(--font)', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(139,92,246,0.4)' }}>+ Dodaj pierwszy skok</button></Link>
          </GlassCard>
        )}

        <AnimatePresence>
          {!loading && filtered.map(j => <JumpCardPro key={j.id} jump={j} onClick={()=>setSelectedJump(j)} onDelete={(id)=>setConfirmDelete({ id, number:j.number })}/>)}
        </AnimatePresence>
        {!loading && search && filtered.length === 0 && <div style={{ textAlign:'center', padding:'2rem', color:'#64748B' }}>Brak wyników dla "{search}"</div>}
      </div>

      {/* FAB */}
      <Link to="/add" style={{ textDecoration:'none', position:'fixed', bottom:'2rem', right:'2rem', zIndex:50 }}>
        <motion.button whileHover={{ scale:1.08 }} whileTap={{ scale:0.95 }} style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#3B82F6)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 24px rgba(139,92,246,0.6), 0 0 0 1px rgba(139,92,246,0.3)', color:'#fff' }}>
          <Plus size={22} strokeWidth={2}/>
        </motion.button>
      </Link>

      <AnimatePresence>
        {selectedJump && <JumpModal jump={selectedJump} onClose={()=>setSelectedJump(null)} onDelete={(id)=>{ setSelectedJump(null); setConfirmDelete({ id, number:selectedJump.number }) }}/>}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:400, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }} style={{ background:'rgba(15,23,42,0.98)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'1.75rem', maxWidth:360, width:'100%' }}>
              <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.75rem' }}>Usuń skok #{confirmDelete.number}?</div>
              <p style={{ fontSize:'0.85rem', color:'#94A3B8', marginBottom:'1.25rem' }}>Tej operacji nie można cofnąć.</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button onClick={()=>setConfirmDelete(null)} style={{ flex:1, padding:'0.65rem', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#94A3B8', fontFamily:'var(--font)', cursor:'pointer' }}>Anuluj</button>
                <button onClick={()=>{ onDelete(confirmDelete.id); setConfirmDelete(null) }} style={{ flex:1, padding:'0.65rem', background:'rgba(248,113,113,0.15)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:10, color:'#F87171', fontFamily:'var(--font)', cursor:'pointer', fontWeight:600 }}>Usuń</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
