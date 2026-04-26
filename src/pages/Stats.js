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

  // Skoki per rok
  const perYear = {}
  withDate.forEach(j => {
    const y = j.jump_date.slice(0,4)
    perYear[y] = (perYear[y] || 0) + 1
  })
  const maxPerYear = Math.max(...Object.values(perYear))

  // Skoki per miesiac
  const months = ['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru']
  const perMonth = {}
  withDate.forEach(j => {
    const m = parseInt(j.jump_date.slice(5,7)) - 1
    perMonth[m] = (perMonth[m] || 0) + 1
  })
  const maxPerMonth = Math.max(...Object.values(perMonth), 1)

  // Strefy
  const perCity = {}
  jumps.filter(j => j.city).forEach(j => {
    const c = j.city.trim()
    perCity[c] = (perCity[c] || 0) + 1
  })
  const topCities = Object.entries(perCity).sort((a,b) => b[1]-a[1]).slice(0,8)
  const maxCity   = topCities[0]?.[1] || 1

  // Samoloty
  const perAircraft = {}
  jumps.filter(j => j.aircraft).forEach(j => {
    const a = j.aircraft.trim()
    perAircraft[a] = (perAircraft[a] || 0) + 1
  })
  const topAircraft = Object.entries(perAircraft).sort((a,b) => b[1]-a[1]).slice(0,6)
  const maxAircraft = topAircraft[0]?.[1] || 1

  // Spadochrony
  const perChute = {}
  jumps.filter(j => j.parachute).forEach(j => {
    const p = j.parachute.trim()
    perChute[p] = (perChute[p] || 0) + 1
  })
  const topChutes = Object.entries(perChute).sort((a,b) => b[1]-a[1]).slice(0,5)
  const maxChute  = topChutes[0]?.[1] || 1

  // Rodzaje skoków
  const perType = {}
  jumps.filter(j => j.jump_type).forEach(j => {
    perType[j.jump_type] = (perType[j.jump_type] || 0) + 1
  })
  const topTypes  = Object.entries(perType).sort((a,b) => b[1]-a[1]).slice(0,6)
  const maxType   = topTypes[0]?.[1] || 1

  // Wysokość
  const withAlt   = jumps.filter(j => j.altitude > 0)
  const avgAlt    = withAlt.length ? Math.round(withAlt.reduce((s,j) => s + j.altitude, 0) / withAlt.length) : 0
  const maxAlt    = withAlt.length ? Math.max(...withAlt.map(j => j.altitude)) : 0

  // Opóźnienie
  const withDelay = jumps.filter(j => j.delay > 0)
  const avgDelay  = withDelay.length ? Math.round(withDelay.reduce((s,j) => s + j.delay, 0) / withDelay.length) : 0
  const maxDelay  = withDelay.length ? Math.max(...withDelay.map(j => j.delay)) : 0

  // Wynik — średnia per dzień
  const parseResult = (r) => {
    if (!r) return null
    const n = parseFloat(r.toString().replace(',', '.'))
    return isNaN(n) ? null : n
  }

  const withResult = jumps.filter(j => parseResult(j.result) !== null)

  // Grupuj po dniu
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
  })).sort((a,b) => a.day.localeCompare(b.day))

  const overallAvg = dayAvgs.length
    ? (dayAvgs.reduce((s,d) => s + d.avg, 0) / dayAvgs.length).toFixed(3)
    : null

  const bestDay = dayAvgs.length ? dayAvgs.reduce((best, d) => d.avg < best.avg ? d : best) : null
  const worstDay = dayAvgs.length ? dayAvgs.reduce((worst, d) => d.avg > worst.avg ? d : worst) : null

  const fmt = (d) => {
    if (!d) return '—'
    const [y,m,day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  // Rekordy dni
  const jumpsPerDay = {}
  withDate.forEach(j => {
    jumpsPerDay[j.jump_date] = (jumpsPerDay[j.jump_date] || 0) + 1
  })
  const bestDayJumps = Object.entries(jumpsPerDay).sort((a,b) => b[1]-a[1])[0]

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:780, margin:'0 auto', padding:'1.5rem 1rem 4rem' }}>

        {/* Nagłówek */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'2rem' }}>
          <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>← Wróć</button>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>Statystyki skoków</h2>
        </div>

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

        {/* Wyniki (celność) */}
        {dayAvgs.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.25rem' }}>Wyniki — celność lądowania</h3>
            <p style={{ color:'var(--muted)', fontSize:'0.8rem', marginBottom:'1.25rem' }}>Średnia wyników z każdego dnia treningowego (niższa wartość = lepszy wynik)</p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'0.75rem', marginBottom:'1.25rem' }}>
              <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Ogólna średnia</div>
                <div style={{ fontFamily:'var(--head)', fontSize:'1.6rem', fontWeight:900, color:'var(--success)' }}>{overallAvg}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>z {dayAvgs.length} dni treningowych</div>
              </div>
              {bestDay && (
                <div style={{ background:'rgba(52,211,153,0.07)', border:'1px solid rgba(52,211,153,0.2)', borderRadius:'var(--r)', padding:'0.85rem 1rem' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Najlepszy dzień</div>
                  <div style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:900, color:'var(--success)' }}>{bestDay.avg.toFixed(3)}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>{fmt(bestDay.day)} · {bestDay.count} skoków</div>
                </div>
              )}
              {worstDay && (
                <div style={{ background:'rgba(248,113,113,0.07)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:'var(--r)', padding:'0.85rem 1rem' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.62rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Najsłabszy dzień</div>
                  <div style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:900, color:'var(--danger)' }}>{worstDay.avg.toFixed(3)}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:2 }}>{fmt(worstDay.day)} · {worstDay.count} skoków</div>
                </div>
              )}
            </div>

            {/* Wykres wyników per dzień */}
            <div style={{ overflowX:'auto' }}>
              <div style={{ minWidth: dayAvgs.length * 28, height:120, display:'flex', alignItems:'flex-end', gap:3, padding:'0 0 24px' }}>
                {(() => {
                  const maxVal = Math.max(...dayAvgs.map(d => d.avg), 1)
                  return dayAvgs.map((d, i) => (
                    <div key={i} title={`${fmt(d.day)}\nŚrednia: ${d.avg.toFixed(3)}\nSkoków: ${d.count}`}
                      style={{ flex:1, minWidth:20, display:'flex', flexDirection:'column', alignItems:'center', gap:2, cursor:'default' }}>
                      <div style={{ width:'100%', background: d.avg <= parseFloat(overallAvg) ? 'var(--success)' : 'rgba(108,99,255,0.5)', borderRadius:'3px 3px 0 0', height:`${(d.avg / maxVal) * 90}px`, minHeight:3, transition:'height 0.5s ease' }} />
                      <div style={{ fontFamily:'var(--mono)', fontSize:'0.5rem', color:'var(--muted)', transform:'rotate(-45deg)', transformOrigin:'center', whiteSpace:'nowrap', marginTop:4 }}>{d.day.slice(5)}</div>
                    </div>
                  ))
                })()}
              </div>
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--muted)', marginTop:4 }}>
              Zielony = wynik lepszy od średniej · Fioletowy = wynik słabszy od średniej
            </div>
          </div>
        )}

        {/* Skoki per rok */}
        {years.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Skoki per rok</h3>
            {Object.entries(perYear).sort().map(([year, count]) => (
              <Bar key={year} label={year} value={count} max={maxPerYear} color="var(--accent)" />
            ))}
          </div>
        )}

        {/* Skoki per miesiąc */}
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Aktywność w ciągu roku (wszystkie lata)</h3>
          <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:80, marginBottom:8 }}>
            {months.map((m, i) => {
              const count = perMonth[i] || 0
              const h = maxPerMonth > 0 ? (count / maxPerMonth) * 68 : 0
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ width:'100%', background: count > 0 ? 'var(--accent2)' : 'var(--bg3)', borderRadius:'3px 3px 0 0', height:`${h}px`, minHeight: count > 0 ? 4 : 0, transition:'height 0.5s ease' }} title={`${m}: ${count} skoków`} />
                  <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--muted)' }}>{m}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top strefy */}
        {topCities.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Najczęstsze strefy zrzutu</h3>
            {topCities.map(([city, count]) => (
              <Bar key={city} label={city} value={count} max={maxCity} color="var(--accent2)" />
            ))}
          </div>
        )}

        {/* Top samoloty */}
        {topAircraft.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Najczęstsze samoloty</h3>
            {topAircraft.map(([aircraft, count]) => (
              <Bar key={aircraft} label={aircraft} value={count} max={maxAircraft} color="#FBBF24" />
            ))}
          </div>
        )}

        {/* Rodzaje skoków */}
        {topTypes.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Rodzaje skoków</h3>
            {topTypes.map(([type, count]) => (
              <Bar key={type} label={type} value={count} max={maxType} color="#F472B6" />
            ))}
          </div>
        )}

        {/* Spadochrony */}
        {topChutes.length > 0 && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Używany sprzęt</h3>
            {topChutes.map(([chute, count]) => (
              <Bar key={chute} label={chute} value={count} max={maxChute} color="var(--success)" />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
