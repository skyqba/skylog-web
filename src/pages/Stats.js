import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const StatCard = ({ label, value, sub, color = 'var(--accent2)', small = false }) => (
  <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'0.85rem 1rem', borderTop:`2px solid ${color}` }}>
    <div style={{ fontFamily:'var(--mono)', fontSize:'0.55rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:4 }}>{label}</div>
    <div style={{ fontFamily:'var(--head)', fontSize: small ? '0.95rem' : '1.35rem', fontWeight:900, letterSpacing:'-0.5px', color:'var(--text)', lineHeight:1.2 }}>{value}</div>
    {sub && <div style={{ fontSize:'0.68rem', color:'var(--muted)', marginTop:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{sub}</div>}
  </div>
)

const Bar = ({ label, value, max, color = 'var(--accent)' }) => (
  <div style={{ marginBottom:'0.6rem' }}>
    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:'0.8rem' }}>
      <span style={{ color:'var(--text)', fontWeight:500 }}>{label}</span>
      <span style={{ color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'0.75rem' }}>{value}</span>
    </div>
    <div style={{ background:'var(--bg3)', borderRadius:4, height:8, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${max > 0 ? (value / max) * 100 : 0}%`, background:color, borderRadius:4, transition:'width 0.8s ease' }} />
    </div>
  </div>
)

// ─── Currency Tracker ───────────────────────────────────────────────────────
const CurrencyTracker = ({ lastJump }) => {
  if (!lastJump?.jump_date) return null
  const days = Math.floor((new Date() - new Date(lastJump.jump_date)) / (1000 * 60 * 60 * 24))
  const status =
    days <= 30 ? { label: 'CURRENT', color: 'var(--success)', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', icon: '🟢', desc: 'Jesteś aktualny — skocz dalej!' } :
    days <= 60 ? { label: 'GETTING RUSTY', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.4)', icon: '🟡', desc: 'Czas na trening — mija 60 dni!' } :
                 { label: 'UNCURRENT', color: 'var(--danger)', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.4)', icon: '🔴', desc: 'Wymagany trening z instruktorem' }
  const pct = Math.min((days / 90) * 100, 100)
  return (
    <div style={{ background: status.bg, border: `2px solid ${status.border}`, borderRadius: 'var(--r2)', padding: '1.1rem 1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: 20 }}>{status.icon}</span>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 }}>Recency Status</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: '1.1rem', fontWeight: 900, color: status.color }}>{status.label}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--head)', fontSize: '2rem', fontWeight: 900, color: status.color, lineHeight: 1 }}>{days}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>dni od ostatniego skoku</div>
        </div>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: '0.5rem' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: status.color, borderRadius: 6, transition: 'width 1s ease' }} />
      </div>
      <div style={{ fontSize: '0.75rem', color: status.color, fontWeight: 500 }}>{status.desc}</div>
    </div>
  )
}

// ─── Vertical Journey ────────────────────────────────────────────────────────
const VerticalJourney = ({ jumps }) => {
  const withAlt = jumps.filter(j => j.altitude > 0)
  if (withAlt.length === 0) return null
  const totalMeters = withAlt.reduce((s, j) => s + j.altitude, 0)
  const totalKm = (totalMeters / 1000).toFixed(1)
  const everest = (totalMeters / 8849).toFixed(1)
  const karman = (totalMeters / 100000).toFixed(2)
  const comparisons = [
    { label: 'Everestów', value: everest, icon: '🏔', desc: '8 849 m n.p.m.' },
    { label: 'do granicy kosmosu', value: `${karman}×`, icon: '🚀', desc: 'Linia Kármána 100 km' },
    { label: 'km łącznie', value: totalKm, icon: '📏', desc: 'łączna wysokość skoków' },
  ]
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>🚀 Vertical Journey</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>Suma wysokości wszystkich Twoich skoków</p>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--head)', fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', color: 'var(--accent2)', lineHeight: 1 }}>
          {totalMeters.toLocaleString('pl-PL')}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>metrów powyżej ziemi</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {comparisons.map(c => (
          <div key={c.label} style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '0.75rem', textAlign: 'center', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{c.icon}</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: '1.1rem', fontWeight: 900, color: 'var(--text)' }}>{c.value}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent2)', fontWeight: 600, marginBottom: 2 }}>{c.label}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Achievements ────────────────────────────────────────────────────────────
const Achievements = ({ jumps }) => {
  const cities = new Set(jumps.map(j => j.city).filter(Boolean))
  const years  = new Set(jumps.map(j => j.jump_date?.slice(0,4)).filter(Boolean))
  const types  = new Set(jumps.map(j => j.jump_type).filter(Boolean))
  const total  = Math.max(...jumps.map(j => j.number || 0), 0)
  const withResult = jumps.filter(j => j.result && parseFloat(j.result) === 0)

  const all = [
    { icon:'🎯', label:'Pierwsze lądowanie',   desc:'1 skok',                  unlocked: total >= 1 },
    { icon:'✈️', label:'Debiutant',            desc:'10 skoków',               unlocked: total >= 10 },
    { icon:'🪂', label:'Skoczek',              desc:'50 skoków',               unlocked: total >= 50 },
    { icon:'💯', label:'Setka',                desc:'100 skoków',              unlocked: total >= 100 },
    { icon:'🌟', label:'Weteran',              desc:'200 skoków',              unlocked: total >= 200 },
    { icon:'👑', label:'Legenda',              desc:'500 skoków',              unlocked: total >= 500 },
    { icon:'🗺', label:'Globetrotter',         desc:'5 różnych stref',         unlocked: cities.size >= 5 },
    { icon:'🌍', label:'Podróżnik',            desc:'10 różnych stref',        unlocked: cities.size >= 10 },
    { icon:'📅', label:'Wieloletni',           desc:'Skakasz od 3+ lat',       unlocked: years.size >= 3 },
    { icon:'🎭', label:'Wszechstronny',        desc:'5 rodzajów skoków',       unlocked: types.size >= 5 },
    { icon:'🎳', label:'Snajper',              desc:'Wynik 0 cm',              unlocked: withResult.length > 0 },
    { icon:'🏆', label:'Mistrz celności',      desc:'3× wynik 0 cm',           unlocked: withResult.length >= 3 },
  ]

  const unlocked = all.filter(a => a.unlocked)
  const locked   = all.filter(a => !a.unlocked)

  if (unlocked.length === 0) return null

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800, marginBottom: '0.25rem' }}>🏆 Osiągnięcia</h3>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
        Odblokowane: {unlocked.length} / {all.length}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: locked.length > 0 ? '1rem' : 0 }}>
        {unlocked.map(a => (
          <div key={a.label} style={{ padding: '0.75rem', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.35)', borderRadius: 'var(--r)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{a.icon}</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent2)', marginBottom: 2 }}>{a.label}</div>
            <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>{a.desc}</div>
          </div>
        ))}
      </div>
      {locked.length > 0 && (
        <>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.5rem', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: 1 }}>Jeszcze do odblokowania</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
            {locked.map(a => (
              <div key={a.label} style={{ padding: '0.75rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r)', textAlign: 'center', opacity: 0.45, filter: 'grayscale(1)' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{a.icon}</div>
                <div style={{ fontFamily: 'var(--head)', fontSize: '0.75rem', fontWeight: 800, marginBottom: 2 }}>{a.label}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--muted)' }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Swoop Progress (trend liniowy) ─────────────────────────────────────────
const SwoopProgress = ({ dayAvgs, overallAvg }) => {
  if (dayAvgs.length < 2) return null

  const vals   = dayAvgs.map(d => d.avg)
  const minVal = Math.min(...vals)
  const maxVal = Math.max(...vals)
  const range  = maxVal - minVal || 1

  const W = 600, H = 140, PAD = 20

  const points = vals.map((v, i) => ({
    x: PAD + (i / (vals.length - 1)) * (W - PAD * 2),
    y: PAD + ((v - minVal) / range) * (H - PAD * 2),
  }))

  // linia trendu (regresja liniowa)
  const n = vals.length
  const sumX  = vals.reduce((s, _, i) => s + i, 0)
  const sumY  = vals.reduce((s, v) => s + v, 0)
  const sumXY = vals.reduce((s, v, i) => s + i * v, 0)
  const sumX2 = vals.reduce((s, _, i) => s + i * i, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const trendY0 = intercept
  const trendY1 = intercept + slope * (n - 1)
  const improving = slope < 0

  const toSvgY = (v) => PAD + ((v - minVal) / range) * (H - PAD * 2)
  const avgLineY = toSvgY(parseFloat(overallAvg))

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')

  const fmt = (d) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  // % poprawy: porównaj pierwszą i ostatnią tercję
  const third = Math.max(1, Math.floor(n / 3))
  const firstThirdAvg = vals.slice(0, third).reduce((s, v) => s + v, 0) / third
  const lastThirdAvg  = vals.slice(-third).reduce((s, v) => s + v, 0) / third
  const improvement   = firstThirdAvg > 0 ? (((firstThirdAvg - lastThirdAvg) / firstThirdAvg) * 100).toFixed(1) : null

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <h3 style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800 }}>📈 Swoop Progress — trend celności</h3>
        {improvement !== null && (
          <div style={{ background: improving ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.1)', border: `1px solid ${improving ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`, borderRadius: 20, padding: '0.2rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: improving ? 'var(--success)' : 'var(--danger)', whiteSpace: 'nowrap' }}>
            {improving ? `▼ ${improvement}% poprawa` : `▲ ${Math.abs(improvement)}% pogorszenie`}
          </div>
        )}
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
        Im niżej linia, tym lepiej. Linia przerywana = trend. {improving ? '📉 Poprawiasz się!' : '📈 Jeszcze trochę pracy!'}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 320, height: 'auto', display: 'block' }}>
          {/* Siatka */}
          {[0.25, 0.5, 0.75].map(t => (
            <line key={t} x1={PAD} x2={W - PAD} y1={PAD + t * (H - PAD * 2)} y2={PAD + t * (H - PAD * 2)}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          ))}
          {/* Linia średniej */}
          <line x1={PAD} x2={W - PAD} y1={avgLineY} y2={avgLineY}
            stroke="rgba(108,99,255,0.4)" strokeWidth={1} strokeDasharray="4 4" />
          <text x={W - PAD + 3} y={avgLineY + 4} fontSize={8} fill="rgba(108,99,255,0.7)">śr.</text>
          {/* Linia trendu */}
          <line
            x1={PAD} y1={toSvgY(trendY0)}
            x2={W - PAD} y2={toSvgY(trendY1)}
            stroke={improving ? 'rgba(52,211,153,0.6)' : 'rgba(248,113,113,0.6)'}
            strokeWidth={2} strokeDasharray="6 3"
          />
          {/* Linia danych */}
          <polyline points={polyline} fill="none" stroke="var(--accent2)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {/* Punkty */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={3}
              fill={vals[i] <= parseFloat(overallAvg) ? 'var(--success)' : 'var(--accent2)'}
              stroke="var(--bg2)" strokeWidth={1.5}>
              <title>{`${fmt(dayAvgs[i].day)}\n${vals[i].toFixed(3)} cm\n${dayAvgs[i].count} skoków`}</title>
            </circle>
          ))}
        </svg>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.68rem', color: 'var(--muted)', flexWrap: 'wrap' }}>
        <span><span style={{ color: 'var(--success)' }}>●</span> wynik lepszy od średniej</span>
        <span><span style={{ color: 'var(--accent2)' }}>●</span> wynik słabszy od średniej</span>
        <span><span style={{ color: improving ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>- -</span> linia trendu</span>
        <span><span style={{ color: 'rgba(108,99,255,0.7)' }}>- -</span> ogólna średnia</span>
      </div>
    </div>
  )
}

export default function Stats() {
  const [jumps, setJumps]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('jumps').select('*').eq('user_id', user.id).order('number', { ascending: true })
      setJumps(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div><Navbar /><p style={{ textAlign:'center', padding:'4rem', color:'var(--muted)' }}>Ładowanie...</p></div>
  if (jumps.length === 0) return <div><Navbar /><p style={{ textAlign:'center', padding:'4rem', color:'var(--muted)' }}>Brak skoków do analizy.</p></div>

  // ---- Obliczenia ----
  const totalJumps    = Math.max(...jumps.map(j => j.number || 0))
  const withDate      = jumps.filter(j => j.jump_date)
  const years         = [...new Set(withDate.map(j => j.jump_date.slice(0,4)))].sort()
  const firstJump     = withDate[0]
  const lastJump      = withDate[withDate.length - 1]

  const perYear = {}
  withDate.forEach(j => {
    const y = j.jump_date.slice(0,4)
    perYear[y] = (perYear[y] || 0) + 1
  })

  const months = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru']

  const perCity = {}
  jumps.filter(j => j.city).forEach(j => { const c = j.city.trim(); perCity[c] = (perCity[c] || 0) + 1 })
  const topCities   = Object.entries(perCity).sort((a,b) => b[1]-a[1]).slice(0,8)
  const maxCity     = topCities[0]?.[1] || 1

  const perAircraft = {}
  jumps.filter(j => j.aircraft).forEach(j => { const a = j.aircraft.trim(); perAircraft[a] = (perAircraft[a] || 0) + 1 })
  const topAircraft = Object.entries(perAircraft).sort((a,b) => b[1]-a[1]).slice(0,6)
  const maxAircraft = topAircraft[0]?.[1] || 1

  const perChute = {}
  jumps.filter(j => j.parachute).forEach(j => { const p = j.parachute.trim(); perChute[p] = (perChute[p] || 0) + 1 })
  const topChutes = Object.entries(perChute).sort((a,b) => b[1]-a[1]).slice(0,5)
  const maxChute  = topChutes[0]?.[1] || 1

  const perType = {}
  jumps.filter(j => j.jump_type).forEach(j => { perType[j.jump_type] = (perType[j.jump_type] || 0) + 1 })
  const topTypes  = Object.entries(perType).sort((a,b) => b[1]-a[1]).slice(0,6)
  const maxType   = topTypes[0]?.[1] || 1

  const perYearMonth = {}
  withDate.forEach(j => {
    const y = j.jump_date.slice(0,4)
    const m = parseInt(j.jump_date.slice(5,7)) - 1
    if (!perYearMonth[y]) perYearMonth[y] = Array(12).fill(0)
    perYearMonth[y][m]++
  })
  const yearsSorted   = Object.keys(perYearMonth).sort()
  const maxYearMonth  = Math.max(...yearsSorted.flatMap(y => perYearMonth[y]), 1)

  const withAlt   = jumps.filter(j => j.altitude > 0)
  const avgAlt    = withAlt.length ? Math.round(withAlt.reduce((s,j) => s + j.altitude, 0) / withAlt.length) : 0
  const maxAlt    = withAlt.length ? Math.max(...withAlt.map(j => j.altitude)) : 0

  const withDelay = jumps.filter(j => j.delay > 0)
  const avgDelay  = withDelay.length ? Math.round(withDelay.reduce((s,j) => s + j.delay, 0) / withDelay.length) : 0
  const maxDelay  = withDelay.length ? Math.max(...withDelay.map(j => j.delay)) : 0

  const parseResult = (r) => {
    if (!r) return null
    const n = parseFloat(r.toString().replace(',', '.'))
    return isNaN(n) ? null : n
  }

  const withResult = jumps.filter(j => parseResult(j.result) !== null)

  const byDay = {}
  withResult.forEach(j => {
    const day = j.jump_date || 'brak daty'
    if (!byDay[day]) byDay[day] = []
    byDay[day].push(parseResult(j.result))
  })

  const dayAvgs = Object.entries(byDay).map(([day, results]) => ({
    day,
    avg: results.reduce((s,r) => s+r, 0) / results.length,
    count: results.length,
    results,
  })).sort((a,b) => a.day.localeCompare(b.day))

  const dayAvgsWithRolling = dayAvgs.map((d) => ({
    ...d,
    oneDayAvg: d.results.reduce((s, r) => s + r, 0) / d.results.length,
  }))

  const overallAvg = dayAvgs.length
    ? (dayAvgs.reduce((s,d) => s + d.avg, 0) / dayAvgs.length).toFixed(3)
    : null

  const bestDay  = dayAvgs.length ? dayAvgs.reduce((best, d)  => d.avg < best.avg  ? d : best)  : null
  const worstDay = dayAvgs.length ? dayAvgs.reduce((worst, d) => d.avg > worst.avg ? d : worst) : null

  const fmt = (d) => {
    if (!d) return '—'
    const [y,m,day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  const jumpsPerDay = {}
  withDate.forEach(j => { jumpsPerDay[j.jump_date] = (jumpsPerDay[j.jump_date] || 0) + 1 })
  const bestDayJumps = Object.entries(jumpsPerDay).sort((a,b) => b[1]-a[1])[0]

  const printStats = () => {
    const style = document.createElement('style')
    style.id = 'print-style'
    style.innerHTML = `@media print { nav, button { display: none !important; } body { background: white !important; color: black !important; } .card { border: 1px solid #ddd !important; background: white !important; break-inside: avoid; } * { color: black !important; background: white !important; border-color: #ddd !important; } }`
    document.head.appendChild(style)
    window.print()
    setTimeout(() => document.getElementById('print-style')?.remove(), 1000)
  }

  const downloadPDF = async () => {
    const { default: jsPDF }     = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    doc.setFont('helvetica', 'bold'); doc.setFontSize(18)
    doc.text('JumpLog - Statystyki skoków', 14, 18)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    doc.text(`Data wydruku: ${new Date().toLocaleDateString('pl-PL')}`, 14, 26)

    let y = 34

    doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
    doc.text('Podsumowanie ogólne', 14, y); y += 6
    autoTable(doc, {
      startY: y,
      head: [['Parametr', 'Wartość']],
      body: [
        ['Łączna liczba skoków', String(totalJumps)],
        ['Lata aktywności', years.length > 0 ? `${years[0]} – ${years[years.length-1]}` : '—'],
        ['Pierwszy skok', fmt(firstJump?.jump_date) + (firstJump?.city ? ` · ${firstJump.city}` : '')],
        ['Ostatni skok', fmt(lastJump?.jump_date) + (lastJump?.city ? ` · ${lastJump.city}` : '')],
        ['Rekord dzienny', bestDayJumps ? `${bestDayJumps[1]} skoków (${fmt(bestDayJumps[0])})` : '—'],
        ['Średnia wysokość', avgAlt ? `${avgAlt} m (max ${maxAlt} m)` : '—'],
        ['Średnie opóźnienie', avgDelay ? `${avgDelay} s (max ${maxDelay} s)` : '—'],
        ['Liczba stref zrzutu', String(Object.keys(perCity).length)],
      ],
      styles: { fontSize: 9, font: 'helvetica' },
      headStyles: { fillColor: [108, 99, 255] },
      alternateRowStyles: { fillColor: [245, 245, 250] },
    })
    y = doc.lastAutoTable.finalY + 8

    if (dayAvgs.length > 0) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12)
      doc.text('Wyniki — celność lądowania', 14, y); y += 6
      autoTable(doc, {
        startY: y,
        head: [['Parametr', 'Wartość']],
        body: [
          ['Ogólna średnia', overallAvg ? `${overallAvg} cm` : '—'],
          ['Najlepszy dzień', bestDay ? `${bestDay.avg.toFixed(3)} cm · ${fmt(bestDay.day)} (${bestDay.count} skoków)` : '—'],
          ['Najsłabszy dzień', worstDay ? `${worstDay.avg.toFixed(3)} cm · ${fmt(worstDay.day)} (${worstDay.count} skoków)` : '—'],
        ],
        styles: { fontSize: 9, font: 'helvetica' },
        headStyles: { fillColor: [108, 99, 255] },
        alternateRowStyles: { fillColor: [245, 245, 250] },
      })
      y = doc.lastAutoTable.finalY + 8

      if (y > 230) { doc.addPage(); y = 14 }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
      doc.text('Wyniki per dzień skoczny', 14, y); y += 6
      autoTable(doc, {
        startY: y,
        head: [['Data', 'Liczba skoków', 'Średnia dnia (cm)']],
        body: dayAvgsWithRolling.map(d => [fmt(d.day), String(d.count), `${d.oneDayAvg.toFixed(3)} cm`]),
        styles: { fontSize: 8, font: 'helvetica' },
        headStyles: { fillColor: [108, 99, 255] },
        alternateRowStyles: { fillColor: [245, 245, 250] },
      })
      y = doc.lastAutoTable.finalY + 8
    }

    if (Object.keys(perYear).length > 0) {
      if (y > 230) { doc.addPage(); y = 14 }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
      doc.text('Skoki per rok', 14, y); y += 6
      autoTable(doc, {
        startY: y,
        head: [['Rok', 'Liczba skoków']],
        body: Object.entries(perYear).sort().map(([yr, cnt]) => [yr, String(cnt)]),
        styles: { fontSize: 9, font: 'helvetica' },
        headStyles: { fillColor: [108, 99, 255] },
        alternateRowStyles: { fillColor: [245, 245, 250] },
      })
      y = doc.lastAutoTable.finalY + 8
    }

    if (yearsSorted.length > 0) {
      if (y > 200) { doc.addPage(); y = 14 }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
      doc.text('Skoki per miesiąc — szczegółowo', 14, y); y += 6
      for (const yr of yearsSorted) {
        if (y > 240) { doc.addPage(); y = 14 }
        const row = perYearMonth[yr]
        const sum = row.reduce((s,v) => s+v, 0)
        const monthRows = row.map((cnt, mi) => cnt > 0 ? [months[mi], String(cnt)] : null).filter(Boolean)
        autoTable(doc, {
          startY: y,
          head: [[`${yr}  —  łącznie ${sum} skoków`, 'Liczba skoków']],
          body: monthRows,
          styles: { fontSize: 9, font: 'helvetica' },
          headStyles: { fillColor: [60, 55, 120], fontSize: 9 },
          alternateRowStyles: { fillColor: [245, 245, 250] },
        })
        y = doc.lastAutoTable.finalY + 5
      }
      y += 3
    }

    if (topCities.length > 0) {
      if (y > 230) { doc.addPage(); y = 14 }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
      doc.text('Najczęstsze strefy zrzutu', 14, y); y += 6
      autoTable(doc, {
        startY: y,
        head: [['Strefa', 'Liczba skoków']],
        body: topCities.map(([c, n]) => [c, String(n)]),
        styles: { fontSize: 9, font: 'helvetica' },
        headStyles: { fillColor: [108, 99, 255] },
        alternateRowStyles: { fillColor: [245, 245, 250] },
      })
    }

    doc.save(`JumpLog_statystyki_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:780, margin:'0 auto', padding:'1.5rem 1rem 4rem' }}>

        {/* Nagłówek */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <button onClick={() => navigate('/profile')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>← Wróć</button>
            <h2 style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>Statystyki skoków</h2>
          </div>
          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button onClick={printStats} style={{ background:'transparent', border:'1px solid var(--border2)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.85rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border2)'}>🖨 Drukuj</button>
            <button onClick={downloadPDF} className="btn" style={{ width:'auto', padding:'0.4rem 0.85rem', fontSize:'0.82rem' }}>📄 Pobierz PDF</button>
          </div>
        </div>

        {/* Currency Tracker */}
        <CurrencyTracker lastJump={lastJump} />

        {/* Główne liczby */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <StatCard label="Łączna liczba skoków" value={totalJumps} />
          <StatCard label="Lata aktywności" value={years.length} sub={years.length > 0 ? `${years[0]} – ${years[years.length-1]}` : ''} color="var(--success)" />
          <StatCard label="Śr. wysokość" value={avgAlt ? `${avgAlt}m` : '—'} sub={maxAlt ? `max ${maxAlt}m` : ''} color="#FBBF24" />
          <StatCard label="Śr. opóźnienie" value={avgDelay ? `${avgDelay}s` : '—'} sub={maxDelay ? `max ${maxDelay}s` : ''} color="#F472B6" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'0.75rem', marginBottom:'2rem' }}>
          <StatCard label="Pierwszy skok" value={fmt(firstJump?.jump_date)} sub={firstJump?.city ? firstJump.city.slice(0,16) : ''} color="var(--muted)" small />
          <StatCard label="Ostatni skok" value={fmt(lastJump?.jump_date)} sub={lastJump?.city ? lastJump.city.slice(0,16) : ''} color="var(--muted)" small />
          <StatCard label="Rekord dzienny" value={bestDayJumps ? `${bestDayJumps[1]} skoków` : '—'} sub={bestDayJumps ? fmt(bestDayJumps[0]) : ''} color="var(--accent)" />
          <StatCard label="Liczba stref" value={Object.keys(perCity).length} sub="różnych lokalizacji" color="var(--accent2)" />
        </div>

        {/* Vertical Journey */}
        <VerticalJourney jumps={jumps} />

        {/* Achievements */}
        <Achievements jumps={jumps} />

        {/* Swoop Progress */}
        {dayAvgs.length >= 2 && (
          <SwoopProgress dayAvgs={dayAvgs} overallAvg={overallAvg} />
        )}

        {/* Wyniki (celność) */}
        {dayAvgs.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.25rem' }}>Wyniki — celność lądowania</h3>
            <p style={{ color:'var(--muted)', fontSize:'0.8rem', marginBottom:'1.25rem' }}>Średnia wyników z każdego dnia treningowego w cm</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'0.75rem', marginBottom:'1.25rem' }}>
              <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Ogólna średnia</div>
                <div style={{ fontFamily:'var(--head)', fontSize:'1.6rem', fontWeight:900, color:'var(--success)' }}>{overallAvg} <span style={{ fontSize:'1rem' }}>cm</span></div>
                <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>średnia z {dayAvgs.length} dni treningowych</div>
              </div>
              {bestDay && (
                <div style={{ background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'var(--r)', padding:'0.85rem 1rem' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Najlepszy dzień</div>
                  <div style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:900, color:'var(--success)' }}>{bestDay.avg.toFixed(3)} <span style={{ fontSize:'0.85rem' }}>cm</span></div>
                  <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>{fmt(bestDay.day)} · {bestDay.count} skoków</div>
                </div>
              )}
              {worstDay && (
                <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'var(--r)', padding:'0.85rem 1rem' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Najsłabszy dzień</div>
                  <div style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:900, color:'var(--danger)' }}>{worstDay.avg.toFixed(3)} <span style={{ fontSize:'0.85rem' }}>cm</span></div>
                  <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>{fmt(worstDay.day)} · {worstDay.count} skoków</div>
                </div>
              )}
            </div>
            <div style={{ overflowX:'auto' }}>
              <div style={{ minWidth: dayAvgs.length * 28, height:120, display:'flex', alignItems:'flex-end', gap:3, padding:'0 0 24px' }}>
                {(() => {
                  const maxVal = Math.max(...dayAvgs.map(d => d.avg), 1)
                  return dayAvgs.map((d, i) => (
                    <div key={i} title={`${fmt(d.day)}\nŚrednia: ${d.avg.toFixed(3)} cm\nSkoków: ${d.count}`}
                      style={{ flex:1, minWidth:20, display:'flex', flexDirection:'column', alignItems:'center', gap:2, cursor:'default' }}>
                      <div style={{ width:'100%', background: d.avg <= parseFloat(overallAvg) ? 'var(--success)' : 'rgba(108,99,255,0.5)', borderRadius:'3px 3px 0 0', height:`${(d.avg / maxVal) * 90}px`, minHeight:3, transition:'height 0.5s ease' }} />
                      <div style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', color:'var(--muted)', transform:'rotate(-45deg)', transformOrigin:'center', whiteSpace:'nowrap', marginTop:4 }}>{d.day.slice(5)}</div>
                    </div>
                  ))
                })()}
              </div>
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:4, marginBottom:'1.25rem' }}>
              Zielony = wynik lepszy od średniej · Fioletowy = wynik słabszy od średniej
            </div>
            <h4 style={{ fontFamily:'var(--head)', fontSize:'0.88rem', fontWeight:700, marginBottom:'0.75rem' }}>Szczegółowe wyniki — średnia z każdego dnia skocznego</h4>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8rem' }}>
                <thead>
                  <tr style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                    {['Data', 'Liczba skoków', 'Średnia dnia (cm)'].map(h => (
                      <th key={h} style={{ padding:'0.5rem 0.75rem', textAlign:'left', fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayAvgsWithRolling.map((d, i) => (
                    <tr key={i} style={{ borderBottom:'1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg3)' : 'transparent' }}>
                      <td style={{ padding:'0.45rem 0.75rem', whiteSpace:'nowrap', fontWeight:500 }}>{fmt(d.day)}</td>
                      <td style={{ padding:'0.45rem 0.75rem', fontFamily:'var(--mono)', color:'var(--muted)' }}>{d.count}</td>
                      <td style={{ padding:'0.45rem 0.75rem', fontFamily:'var(--mono)', fontWeight:700, color: d.oneDayAvg <= parseFloat(overallAvg) ? 'var(--success)' : 'var(--danger)' }}>{d.oneDayAvg.toFixed(3)} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Skoki per rok */}
        {years.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Skoki per rok</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'0.5rem' }}>
              {Object.entries(perYear).sort().map(([year, count]) => (
                <div key={year} style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'0.65rem 0.85rem', borderTop:'2px solid var(--accent)' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', marginBottom:3 }}>{year}</div>
                  <div style={{ fontFamily:'var(--head)', fontSize:'1.4rem', fontWeight:900 }}>{count}</div>
                  <div style={{ fontSize:'0.68rem', color:'var(--muted)', marginTop:2 }}>skoków</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabela rok x miesiąc */}
        {yearsSorted.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Liczba skoków — rok / miesiąc</h3>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    <th style={{ padding:'0.4rem 0.6rem', textAlign:'left', fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>Rok</th>
                    {months.map(m => (
                      <th key={m} style={{ padding:'0.4rem 0.4rem', textAlign:'center', fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:0.5, whiteSpace:'nowrap' }}>{m}</th>
                    ))}
                    <th style={{ padding:'0.4rem 0.6rem', textAlign:'right', fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1 }}>Suma</th>
                  </tr>
                </thead>
                <tbody>
                  {yearsSorted.map((yr, i) => {
                    const row = perYearMonth[yr]
                    const sum = row.reduce((s,v) => s+v, 0)
                    return (
                      <tr key={yr} style={{ borderBottom:'1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg3)' : 'transparent' }}>
                        <td style={{ padding:'0.45rem 0.6rem', fontFamily:'var(--head)', fontWeight:700, color:'var(--accent2)', whiteSpace:'nowrap' }}>{yr}</td>
                        {row.map((cnt, mi) => (
                          <td key={mi} style={{ padding:'0.45rem 0.4rem', textAlign:'center' }}>
                            {cnt > 0 ? (
                              <span style={{ display:'inline-block', minWidth:22, height:22, lineHeight:'22px', borderRadius:4, background:`rgba(108,99,255,${0.15 + (cnt/maxYearMonth)*0.7})`, color: cnt/maxYearMonth > 0.5 ? '#fff' : 'var(--text)', fontWeight:600, fontSize:'0.72rem', fontFamily:'var(--mono)' }}>{cnt}</span>
                            ) : (
                              <span style={{ color:'var(--border2)', fontSize:'0.65rem' }}>·</span>
                            )}
                          </td>
                        ))}
                        <td style={{ padding:'0.45rem 0.6rem', textAlign:'right', fontFamily:'var(--mono)', fontWeight:700, fontSize:'0.8rem' }}>{sum}</td>
                      </tr>
                    )
                  })}
                  <tr style={{ borderTop:'2px solid var(--border)' }}>
                    <td style={{ padding:'0.45rem 0.6rem', fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase' }}>Suma</td>
                    {months.map((_, mi) => {
                      const total = yearsSorted.reduce((s, yr) => s + (perYearMonth[yr][mi] || 0), 0)
                      return (
                        <td key={mi} style={{ padding:'0.45rem 0.4rem', textAlign:'center', fontFamily:'var(--mono)', fontWeight:700, color:'var(--accent2)', fontSize:'0.75rem' }}>
                          {total > 0 ? total : <span style={{ color:'var(--border2)' }}>·</span>}
                        </td>
                      )
                    })}
                    <td style={{ padding:'0.45rem 0.6rem', textAlign:'right', fontFamily:'var(--mono)', fontWeight:900, color:'var(--accent)', fontSize:'0.85rem' }}>
                      {yearsSorted.reduce((s, yr) => s + perYearMonth[yr].reduce((a,b) => a+b, 0), 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Skoki per miesiąc szczegółowo */}
        {yearsSorted.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Skoki per miesiąc — szczegółowo</h3>
            {yearsSorted.map(yr => (
              <div key={yr} style={{ marginBottom:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.4rem', paddingBottom:'0.25rem', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontFamily:'var(--head)', fontSize:'0.85rem', fontWeight:800, color:'var(--accent2)' }}>
                    {yr} — łącznie {perYearMonth[yr].reduce((a,b) => a+b, 0)} skoków
                  </div>
                  <button
                    onClick={() => {
                      const total = perYearMonth[yr].reduce((a,b) => a+b, 0)
                      const yearJumps = withDate.filter(j => j.jump_date.startsWith(yr)).sort((a,b) => a.number - b.number)
                      const byMonth = {}
                      yearJumps.forEach(j => {
                        const mi = parseInt(j.jump_date.slice(5,7)) - 1
                        if (!byMonth[mi]) byMonth[mi] = []
                        byMonth[mi].push(j)
                      })
                      const lines = []
                      Object.entries(byMonth).sort((a,b) => a[0]-b[0]).forEach(([mi, mJumps]) => {
                        lines.push(`--- ${months[parseInt(mi)]} ${yr} ---`)
                        mJumps.forEach(j => {
                          const parts = [`#${j.number}`, j.jump_date, j.city || '', j.parachute || '', j.aircraft || '', j.result ? `wynik: ${j.result} cm` : '', j.notes || ''].filter(Boolean)
                          lines.push(parts.join(' | '))
                        })
                        const withRes = mJumps.filter(j => j.result && parseFloat(j.result) >= 0)
                        const avgRes = withRes.length ? (withRes.reduce((s,j) => s + parseFloat(j.result), 0) / withRes.length).toFixed(2) : null
                        lines.push(`Podsumowanie: ${mJumps.length} skoków${avgRes ? ` | Śr. wynik: ${avgRes} cm` : ''}`)
                        lines.push('')
                      })
                      const subject = encodeURIComponent(`JumpLog — skoki ${yr}`)
                      const body = encodeURIComponent(`Cześć Gośka,\n\nPrzesyłam szczegółowe skoki za ${yr} (łącznie ${total}):\n\n${lines.join('\n')}\nPozdrawiam,\nKamil`)
                      window.location.href = `mailto:skyqba@gmail.com?subject=${subject}&body=${body}`
                    }}
                    style={{ background:'transparent', border:'1px solid var(--border2)', borderRadius:7, color:'var(--accent2)', cursor:'pointer', fontSize:'0.72rem', padding:'0.25rem 0.65rem', fontFamily:'var(--font)', transition:'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='var(--border2)'}
                  >✉ Wyślij do Gośki</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'0.35rem' }}>
                  {perYearMonth[yr].map((cnt, mi) => cnt > 0 ? (
                    <div key={mi} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.3rem 0.6rem', background:'var(--bg3)', borderRadius:6, border:'1px solid var(--border)' }}>
                      <span style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{months[mi]}</span>
                      <span style={{ fontFamily:'var(--mono)', fontSize:'0.82rem', fontWeight:700 }}>{cnt}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top strefy */}
        {topCities.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Najczęstsze strefy zrzutu</h3>
            {topCities.map(([city, count]) => <Bar key={city} label={city} value={count} max={maxCity} color="var(--accent2)" />)}
          </div>
        )}

        {/* Top samoloty */}
        {topAircraft.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Najczęstsze samoloty</h3>
            {topAircraft.map(([aircraft, count]) => <Bar key={aircraft} label={aircraft} value={count} max={maxAircraft} color="#FBBF24" />)}
          </div>
        )}

        {/* Rodzaje skoków */}
        {topTypes.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Rodzaje skoków</h3>
            {topTypes.map(([type, count]) => <Bar key={type} label={type} value={count} max={maxType} color="#F472B6" />)}
          </div>
        )}

        {/* Spadochrony */}
        {topChutes.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Używany sprzęt</h3>
            {topChutes.map(([chute, count]) => <Bar key={chute} label={chute} value={count} max={maxChute} color="var(--success)" />)}
          </div>
        )}

      </div>
    </div>
  )
}