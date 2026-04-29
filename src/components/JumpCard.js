export default function JumpCard({ jump, onDelete }) {
  const fmt = (d) => new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div
      style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--r2)', padding: '1rem 1.1rem', marginBottom: '0.7rem', transition: 'border 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.35)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
        
        {/* Lewa strona: numer i data */}
        <div style={{ minWidth: 0, flexShrink: 1 }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent2)', letterSpacing: '-0.3px' }}>
            Skok #{jump.number}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
            {fmt(jump.jump_date)}{jump.city ? ` · ${jump.city}` : ''}
          </div>
        </div>

        {/* Prawa strona: tagi + przycisk usuń */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '55%' }}>
          {jump.jump_type && (
            <span style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 6, padding: '0.2rem 0.6rem', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: '#34D399', fontWeight: 500, wordBreak: 'break-word' }}>
              {jump.jump_type}
            </span>
          )}
          {jump.parachute && (
            <span style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 6, padding: '0.2rem 0.6rem', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--accent2)', fontWeight: 500, wordBreak: 'break-word' }}>
              {jump.parachute}
            </span>
          )}
          <button
            onClick={() => onDelete(jump.id)}
            style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem 0.35rem', borderRadius: 5, transition: 'color 0.2s', flexShrink: 0 }}
            onMouseEnter={e => e.target.style.color = 'var(--danger)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            title="Usuń skok"
          >✕</button>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', marginBottom: '0.7rem' }} />

      {/* Detail chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem' }}>
        <Chip label="Wysokość"  value={jump.altitude ? `${jump.altitude} m` : '—'} />
        <Chip label="Opóźnienie" value={jump.delay ? `${jump.delay}s` : '—'} />
        <Chip label="Samolot"   value={jump.aircraft || '—'} />
      </div>

      {/* Wynik */}
      {jump.result && (
        <div style={{ marginTop: '0.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>Wynik</span>
          <span style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--success)' }}>{jump.result}</span>
        </div>
      )}

      {/* Notatki */}
      {jump.notes && (
        <div style={{ marginTop: '0.7rem', paddingLeft: '0.6rem', borderLeft: '2px solid var(--accent)', fontSize: '0.76rem', color: 'var(--muted)', lineHeight: 1.5 }}>
          {jump.notes}
        </div>
      )}
    </div>
  )
}

function Chip({ label, value }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 9, padding: '0.5rem 0.6rem' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '0.62rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.84rem', fontWeight: 500 }}>{value}</div>
    </div>
  )
}