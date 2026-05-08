import { useState } from 'react'

const isPro = () => document.body.classList.contains('theme-pro')

export default function JumpCard({ jump, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const pro = isPro()
  const fmt = (d) => new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })

  if (pro) {
    return (
      <>
        <div
          className="jump-card-pro"
          onClick={() => setExpanded(true)}
          style={{ padding:'1.1rem 1.25rem', marginBottom:'0.75rem', cursor:'pointer', display:'flex', gap:'1rem', alignItems:'stretch' }}
        >
          {/* Lewa — główne info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', flexWrap:'wrap' }}>
              <span style={{ fontFamily:'var(--head)', fontSize:'1.1rem', fontWeight:900, color:'#fff', letterSpacing:'-0.3px' }}>
                Skok #{jump.number}
              </span>
              <span style={{ color:'var(--muted)', fontSize:'0.78rem' }}>
                {fmt(jump.jump_date)}{jump.city ? ` · ${jump.city}` : ''}
              </span>
              {jump.jump_type && <span className="tag-pro">{jump.jump_type}</span>}
              {jump.parachute && <span className="tag-pro" style={{ color:'#67E8F9', borderColor:'rgba(103,232,249,0.3)', background:'rgba(103,232,249,0.1)' }}>{jump.parachute}</span>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
              <ProChip label="Alt" value={jump.altitude ? `${jump.altitude} m` : '—'} />
              <ProChip label="Delay" value={jump.delay ? `${jump.delay}s` : '—'} />
              <ProChip label="Plane" value={jump.aircraft || '—'} />
            </div>
            {jump.notes && (
              <div style={{ marginTop:'0.6rem', fontSize:'0.76rem', color:'var(--muted)', paddingLeft:'0.6rem', borderLeft:'2px solid rgba(139,92,246,0.5)', lineHeight:1.5 }}>
                {jump.notes}
              </div>
            )}
          </div>

          {/* Prawa — pogoda + akcje */}
          <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', alignItems:'flex-end', gap:'0.5rem', flexShrink:0 }}>
            <button
              onClick={e => { e.stopPropagation(); onDelete(jump.id) }}
              style={{ background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'0.85rem', padding:'0.1rem 0.3rem', borderRadius:4, lineHeight:1 }}
              onMouseEnter={e => e.target.style.color='#F87171'}
              onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.3)'}
            >✕</button>
            {jump.weather && (
              <div className="weather-chip" style={{ textAlign:'right', minWidth:120 }}>
                <div style={{ fontSize:'0.82rem', fontWeight:600, color:'#93C5FD' }}>
                  ☀️ {jump.weather.split(',')[0]}
                </div>
                <div style={{ fontSize:'0.7rem', color:'var(--muted)', marginTop:2 }}>
                  {jump.weather.split(',').slice(1).join(',').trim()}
                </div>
              </div>
            )}
            {jump.result && (
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'0.62rem', color:'var(--muted)', fontFamily:'var(--mono)', textTransform:'uppercase', letterSpacing:1 }}>Wynik</div>
                <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#10B981' }}>{jump.result}</div>
              </div>
            )}
          </div>
        </div>

        {expanded && <JumpModal jump={jump} onClose={() => setExpanded(false)} onDelete={onDelete} fmt={fmt} />}
      </>
    )
  }

  // Classic layout
  return (
    <>
      <div
        onClick={() => setExpanded(true)}
        style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1rem 1.1rem', marginBottom:'0.7rem', transition:'border 0.2s', cursor:'pointer' }}
        onMouseEnter={e => e.currentTarget.style.borderColor='rgba(108,99,255,0.35)'}
        onMouseLeave={e => e.currentTarget.style.borderColor='var(--border2)'}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem', gap:'0.5rem' }}>
          <div style={{ minWidth:0, flexShrink:1 }}>
            <div style={{ fontFamily:'var(--head)', fontSize:'1.1rem', fontWeight:800, color:'var(--accent2)', letterSpacing:'-0.3px' }}>Skok #{jump.number}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>{fmt(jump.jump_date)}{jump.city ? ` · ${jump.city}` : ''}</div>
          </div>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'0.4rem', flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end', maxWidth:'55%' }}>
            {jump.jump_type && <span style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:6, padding:'0.2rem 0.6rem', fontFamily:'var(--mono)', fontSize:'0.7rem', color:'#34D399', fontWeight:500 }}>{jump.jump_type}</span>}
            {jump.parachute && <span style={{ background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.3)', borderRadius:6, padding:'0.2rem 0.6rem', fontFamily:'var(--mono)', fontSize:'0.7rem', color:'var(--accent2)', fontWeight:500 }}>{jump.parachute}</span>}
            <button onClick={e => { e.stopPropagation(); onDelete(jump.id) }} style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'0.9rem', padding:'0.2rem 0.35rem', borderRadius:5 }} onMouseEnter={e => e.target.style.color='var(--danger)'} onMouseLeave={e => e.target.style.color='var(--muted)'}>✕</button>
          </div>
        </div>
        <div style={{ height:1, background:'var(--border)', marginBottom:'0.7rem' }} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
          <Chip label="Wysokość" value={jump.altitude ? `${jump.altitude} m` : '—'} />
          <Chip label="Opóźnienie" value={jump.delay ? `${jump.delay}s` : '—'} />
          <Chip label="Samolot" value={jump.aircraft || '—'} />
        </div>
        {jump.result && <div style={{ marginTop:'0.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}><span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>Wynik</span><span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--success)' }}>{jump.result}</span></div>}
        {jump.notes && <div style={{ marginTop:'0.7rem', paddingLeft:'0.6rem', borderLeft:'2px solid var(--accent)', fontSize:'0.76rem', color:'var(--muted)', lineHeight:1.5 }}>{jump.notes}</div>}
        <div style={{ marginTop:'0.75rem', fontSize:'0.72rem', color:'var(--muted)', textAlign:'right' }}>Kliknij aby zobaczyć szczegóły →</div>
      </div>
      {expanded && <JumpModal jump={jump} onClose={() => setExpanded(false)} onDelete={onDelete} fmt={fmt} />}
    </>
  )
}

function JumpModal({ jump, onClose, onDelete, fmt }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.75rem', maxWidth:480, width:'100%', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
          <div>
            <div style={{ fontFamily:'var(--head)', fontSize:'1.5rem', fontWeight:900, color:'var(--accent2)' }}>Skok #{jump.number}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.75rem', color:'var(--muted)', marginTop:2 }}>{fmt(jump.jump_date)}{jump.city ? ` · ${jump.city}` : ''}</div>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', cursor:'pointer', fontSize:'0.85rem', padding:'0.35rem 0.75rem', fontFamily:'var(--font)' }}>✕ Zamknij</button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1.25rem' }}>
          {jump.jump_type && <span style={{ background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:6, padding:'0.25rem 0.75rem', fontFamily:'var(--mono)', fontSize:'0.75rem', color:'#34D399', fontWeight:600 }}>{jump.jump_type}</span>}
          {jump.parachute && <span style={{ background:'rgba(108,99,255,0.15)', border:'1px solid rgba(108,99,255,0.3)', borderRadius:6, padding:'0.25rem 0.75rem', fontFamily:'var(--mono)', fontSize:'0.75rem', color:'var(--accent2)', fontWeight:600 }}>{jump.parachute}</span>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1.25rem' }}>
          <DetailRow label="📍 Miejscowość" value={jump.city || '—'} />
          <DetailRow label="✈️ Samolot" value={jump.aircraft || '—'} />
          <DetailRow label="📏 Wysokość" value={jump.altitude ? `${jump.altitude} m` : '—'} />
          <DetailRow label="⏱ Opóźnienie" value={jump.delay ? `${jump.delay} s` : '—'} />
          <DetailRow label="🪂 Spadochron" value={jump.parachute || '—'} />
          <DetailRow label="🎯 Wynik" value={jump.result || '—'} color={jump.result ? 'var(--success)' : undefined} />
        </div>
        {jump.weather && (
          <div style={{ background:'rgba(108,99,255,0.08)', border:'1px solid rgba(108,99,255,0.25)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1.25rem' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>🌤 Pogoda</div>
            <div style={{ fontSize:'0.88rem', color:'var(--text)', fontWeight:500 }}>{jump.weather}</div>
          </div>
        )}
        {jump.notes && (
          <div style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1.25rem', borderLeft:'3px solid var(--accent)' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>📝 Uwagi</div>
            <div style={{ fontSize:'0.85rem', color:'var(--text)', lineHeight:1.6 }}>{jump.notes}</div>
          </div>
        )}
        <button onClick={() => { onClose(); onDelete(jump.id) }} style={{ width:'100%', background:'transparent', border:'1px solid rgba(248,113,113,0.3)', borderRadius:8, color:'var(--danger)', padding:'0.6rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.85rem' }} onMouseEnter={e => e.currentTarget.style.background='rgba(248,113,113,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          🗑 Usuń skok
        </button>
      </div>
    </div>
  )
}

function ProChip({ label, value }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:'0.45rem 0.6rem', border:'1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:'0.58rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:'0.82rem', fontWeight:600, color:'#fff' }}>{value}</div>
    </div>
  )
}

function Chip({ label, value }) {
  return (
    <div style={{ background:'var(--bg3)', borderRadius:9, padding:'0.5rem 0.6rem' }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:2 }}>{label}</div>
      <div style={{ fontSize:'0.84rem', fontWeight:500 }}>{value}</div>
    </div>
  )
}

function DetailRow({ label, value, color }) {
  return (
    <div style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'0.65rem 0.85rem' }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:'0.88rem', fontWeight:600, color: color || 'var(--text)' }}>{value}</div>
    </div>
  )
}
