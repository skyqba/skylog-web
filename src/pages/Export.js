import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const pl = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
}

const fmt = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

const inputStyle = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
  fontFamily: 'var(--font)',
  fontSize: '0.82rem',
  padding: '0.45rem 0.75rem',
  outline: 'none',
  width: '100%',
}

const labelStyle = {
  fontFamily: 'var(--mono)',
  fontSize: '0.62rem',
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: 1,
  marginBottom: 4,
  display: 'block',
}

export default function Export() {
  const [jumps, setJumps]           = useState([])
  const [selected, setSelected]     = useState(new Set())
  const [loading, setLoading]       = useState(true)
  const [profile, setProfile]       = useState(null)
  const [generating, setGenerating] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo]     = useState('')
  const [filterCity, setFilterCity]         = useState('')
  const [filterParachute, setFilterParachute] = useState('')
  const [filterAircraft, setFilterAircraft] = useState('')
  const [filterType, setFilterType]         = useState('')

  const [sortBy, setSortBy]   = useState('number')
  const [sortDir, setSortDir] = useState('desc')

  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: j }, { data: prof }] = await Promise.all([
        supabase.from('jumps').select('*').eq('user_id', user.id).order('number', { ascending: false }),
        supabase.from('profiles').select('name,surname,city,license_number').eq('id', user.id).single(),
      ])
      setJumps(j || [])
      setProfile(prof)
      setSelected(new Set((j || []).map(x => x.id)))
      setLoading(false)
    }
    load()
  }, [])

  const uniqueCities     = useMemo(() => [...new Set(jumps.map(j => j.city).filter(Boolean))].sort(), [jumps])
  const uniqueParachutes = useMemo(() => [...new Set(jumps.map(j => j.parachute).filter(Boolean))].sort(), [jumps])
  const uniqueAircrafts  = useMemo(() => [...new Set(jumps.map(j => j.aircraft).filter(Boolean))].sort(), [jumps])
  const uniqueTypes      = useMemo(() => [...new Set(jumps.map(j => j.jump_type).filter(Boolean))].sort(), [jumps])

  const filteredJumps = useMemo(() => {
    let result = [...jumps]
    if (filterDateFrom) result = result.filter(j => j.jump_date >= filterDateFrom)
    if (filterDateTo)   result = result.filter(j => j.jump_date <= filterDateTo)
    if (filterCity)     result = result.filter(j => j.city === filterCity)
    if (filterParachute) result = result.filter(j => j.parachute === filterParachute)
    if (filterAircraft) result = result.filter(j => j.aircraft === filterAircraft)
    if (filterType)     result = result.filter(j => j.jump_type === filterType)
    result.sort((a, b) => {
      let av = a[sortBy], bv = b[sortBy]
      if (sortBy === 'jump_date') { av = av || ''; bv = bv || '' }
      else { av = Number(av) || 0; bv = Number(bv) || 0 }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [jumps, filterDateFrom, filterDateTo, filterCity, filterParachute, filterAircraft, filterType, sortBy, sortDir])

  const activeFiltersCount = [filterDateFrom, filterDateTo, filterCity, filterParachute, filterAircraft, filterType].filter(Boolean).length

  const resetFilters = () => {
    setFilterDateFrom(''); setFilterDateTo('')
    setFilterCity(''); setFilterParachute('')
    setFilterAircraft(''); setFilterType('')
    setSortBy('number'); setSortDir('desc')
  }

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const sortIcon = (col) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const toggleAll = () => {
    const allSelected = filteredJumps.every(j => selected.has(j.id))
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        filteredJumps.forEach(j => next.delete(j.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        filteredJumps.forEach(j => next.add(j.id))
        return next
      })
    }
  }

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedJumps = filteredJumps.filter(j => selected.has(j.id))

  const generatePDF = async () => {
    if (selectedJumps.length === 0) return
    setGenerating(true)
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('JumpLogX', 14, 18)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    let headerY = 26
    if (profile) {
      const name = `${profile.name || ''} ${profile.surname || ''}`.trim()
      if (name) { doc.text(pl(`Skoczek: ${name}`), 14, headerY); headerY += 6 }
    }
    doc.text(pl(`Liczba skokow: ${selectedJumps.length}`), 14, headerY)
    doc.text(pl(`Data wydruku: ${new Date().toLocaleDateString('pl-PL')}`), 200, 18)
    autoTable(doc, {
      startY: headerY + 8,
      head: [['Lp.', 'Nr skoku', 'Data', 'Miejscowosc', 'Spadochron', 'Wys. (m)', 'Opoz. (s)', 'Samolot', 'Typ skoku', 'Uwagi']],
      body: selectedJumps.map((j, index) => [
        index + 1, j.number, fmt(j.jump_date),
        pl(j.city) || '', pl(j.parachute) || '',
        j.altitude || '', j.delay || '',
        pl(j.aircraft) || '', pl(j.jump_type) || '', pl(j.notes) || '',
      ]),
      styles: { fontSize: 8, cellPadding: 2, font: 'helvetica' },
      headStyles: { fillColor: [108, 99, 255], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      columnStyles: {
        0: { cellWidth: 10 }, 1: { cellWidth: 14 }, 2: { cellWidth: 22 },
        3: { cellWidth: 35 }, 4: { cellWidth: 28 }, 5: { cellWidth: 18 },
        6: { cellWidth: 18 }, 7: { cellWidth: 28 }, 8: { cellWidth: 28 },
        9: { cellWidth: 'auto' },
      },
      didDrawPage: (data) => {
        doc.setFontSize(8); doc.setTextColor(150)
        doc.text(`Strona ${data.pageNumber}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, { align: 'center' })
        doc.setTextColor(0)
      }
    })
    doc.save(`JumpLogX_skoki_${new Date().toISOString().split('T')[0]}.pdf`)
    setGenerating(false)
  }

  const printJumps = () => {
    if (selectedJumps.length === 0) return
    const name = profile ? `${profile.name || ''} ${profile.surname || ''}`.trim() : ''
    const rows = selectedJumps.map((j, index) => `
      <tr>
        <td>${index + 1}</td><td>${j.number}</td><td>${fmt(j.jump_date)}</td>
        <td>${j.city || ''}</td><td>${j.parachute || ''}</td>
        <td>${j.altitude || ''}</td><td>${j.delay || ''}</td>
        <td>${j.aircraft || ''}</td><td>${j.jump_type || ''}</td><td>${j.notes || ''}</td>
      </tr>`).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>JumpLogX - Ksiazka Skokow</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #111; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .meta { font-size: 11px; color: #555; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #6C63FF; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
        td { padding: 5px 8px; border-bottom: 1px solid #eee; font-size: 10px; }
        tr:nth-child(even) { background: #f8f8fc; }
        @media print { body { margin: 10px; } }
      </style></head><body>
      <h1>Książka Skoków - JumpLogX</h1>
      <div class="meta">
        ${name ? `Skoczek: <strong>${name}</strong> &nbsp;|&nbsp; ` : ''}
        Liczba skoków: <strong>${selectedJumps.length}</strong> &nbsp;|&nbsp;
        Data wydruku: <strong>${new Date().toLocaleDateString('pl-PL')}</strong>
      </div>
      <table>
        <thead><tr>
          <th>Lp.</th><th>Nr</th><th>Data</th><th>Miejscowość</th><th>Spadochron</th>
          <th>Wys. (m)</th><th>Opóź. (s)</th><th>Samolot</th><th>Typ skoku</th><th>Uwagi</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
  }

  const thStyle = (col) => ({
    padding: '0.65rem 0.75rem',
    textAlign: 'left',
    fontFamily: 'var(--mono)',
    fontSize: '0.65rem',
    color: sortBy === col ? 'var(--accent2)' : 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    whiteSpace: 'nowrap',
    cursor: col ? 'pointer' : 'default',
    userSelect: 'none',
  })

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '1.5rem 1rem' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>← Wróć</button>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>Eksport skoków</h2>
        </div>

        {loading ? (
          <p style={{ color:'var(--muted)', textAlign:'center', padding:'3rem' }}>Ładowanie...</p>
        ) : (
          <>
            {/* Panel filtrów */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', marginBottom:'1rem', overflow:'hidden' }}>
              <button
                onClick={() => setShowFilters(f => !f)}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.85rem 1.25rem', background:'transparent', border:'none', cursor:'pointer', color:'var(--text)', fontFamily:'var(--font)' }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <span style={{ fontSize:15 }}>🔍</span>
                  <span style={{ fontSize:'0.88rem', fontWeight:500 }}>Filtrowanie i sortowanie</span>
                  {activeFiltersCount > 0 && (
                    <span style={{ background:'rgba(108,99,255,0.2)', border:'1px solid rgba(108,99,255,0.4)', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.72rem', color:'var(--accent2)', fontWeight:600 }}>
                      {activeFiltersCount} aktywnych
                    </span>
                  )}
                </div>
                <span style={{ color:'var(--muted)', fontSize:'0.8rem' }}>{showFilters ? '▲' : '▼'}</span>
              </button>

              {showFilters && (
                <div style={{ borderTop:'1px solid var(--border)', padding:'1rem 1.25rem' }}>
                  {/* Sortowanie */}
                  <div style={{ marginBottom:'1rem' }}>
                    <div style={{ ...labelStyle, marginBottom:8 }}>Sortuj według</div>
                    <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                      {[
                        { key:'number',    label:'Nr skoku' },
                        { key:'jump_date', label:'Data' },
                        { key:'altitude',  label:'Wysokość' },
                        { key:'delay',     label:'Opóźnienie' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => toggleSort(key)}
                          style={{
                            padding:'0.35rem 0.85rem',
                            background: sortBy === key ? 'rgba(108,99,255,0.2)' : 'var(--bg3)',
                            border: `1px solid ${sortBy === key ? 'var(--accent)' : 'var(--border)'}`,
                            borderRadius: 8,
                            color: sortBy === key ? 'var(--accent2)' : 'var(--muted)',
                            fontFamily:'var(--font)', fontSize:'0.82rem', cursor:'pointer',
                          }}
                        >
                          {label}{sortIcon(key)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtry */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Data od (RRRR-MM-DD)</label>
                      <input
                        type="text"
                        style={inputStyle}
                        value={filterDateFrom}
                        onChange={e => setFilterDateFrom(e.target.value)}
                        placeholder="2024-01-01"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Data do (RRRR-MM-DD)</label>
                      <input
                        type="text"
                        style={inputStyle}
                        value={filterDateTo}
                        onChange={e => setFilterDateTo(e.target.value)}
                        placeholder="2024-12-31"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Miejscowość</label>
                      <select style={inputStyle} value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                        <option value="">Wszystkie</option>
                        {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Spadochron</label>
                      <select style={inputStyle} value={filterParachute} onChange={e => setFilterParachute(e.target.value)}>
                        <option value="">Wszystkie</option>
                        {uniqueParachutes.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Samolot</label>
                      <select style={inputStyle} value={filterAircraft} onChange={e => setFilterAircraft(e.target.value)}>
                        <option value="">Wszystkie</option>
                        {uniqueAircrafts.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Typ skoku</label>
                      <select style={inputStyle} value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">Wszystkie</option>
                        {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      style={{ marginTop:'0.85rem', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.35rem 0.85rem', fontFamily:'var(--font)', fontSize:'0.82rem', cursor:'pointer' }}
                    >
                      ✕ Resetuj filtry
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pasek akcji */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem', background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1rem 1.25rem', marginBottom:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.9rem', fontWeight:500 }}>
                  <input
                    type="checkbox"
                    checked={filteredJumps.length > 0 && filteredJumps.every(j => selected.has(j.id))}
                    onChange={toggleAll}
                    style={{ width:16, height:16, accentColor:'var(--accent)', cursor:'pointer' }}
                  />
                  Zaznacz wszystkie
                </label>
                <span style={{ fontSize:'0.82rem', color:'var(--muted)', fontFamily:'var(--mono)' }}>
                  {selectedJumps.length} / {filteredJumps.length} skoków
                  {activeFiltersCount > 0 && <span style={{ color:'var(--accent2)', marginLeft:4 }}>(filtr aktywny)</span>}
                </span>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button
                  onClick={printJumps}
                  disabled={selectedJumps.length === 0}
                  style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1rem', background:'transparent', border:'1px solid var(--border2)', borderRadius:'var(--r)', color: selectedJumps.length === 0 ? 'var(--muted)' : 'var(--text)', fontFamily:'var(--font)', fontSize:'0.85rem', cursor: selectedJumps.length === 0 ? 'not-allowed' : 'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => { if (selectedJumps.length > 0) e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                >
                  🖨 Drukuj
                </button>
                <button
                  onClick={generatePDF}
                  disabled={selectedJumps.length === 0 || generating}
                  className="btn"
                  style={{ width:'auto', padding:'0.55rem 1.25rem', display:'flex', alignItems:'center', gap:'0.4rem', opacity: selectedJumps.length === 0 ? 0.5 : 1 }}
                >
                  {generating ? '⏳ Generowanie...' : '📄 Pobierz PDF'}
                </button>
              </div>
            </div>

            {/* Tabela */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', overflow:'hidden' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                  <thead>
                    <tr style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                      <th style={{ padding:'0.65rem 0.75rem', width:36 }}></th>
                      <th style={thStyle(null)}>Lp.</th>
                      <th style={thStyle('number')}    onClick={() => toggleSort('number')}>Nr{sortIcon('number')}</th>
                      <th style={thStyle('jump_date')} onClick={() => toggleSort('jump_date')}>Data{sortIcon('jump_date')}</th>
                      <th style={thStyle(null)}>Miejscowość</th>
                      <th style={thStyle(null)}>Spadochron</th>
                      <th style={thStyle('altitude')}  onClick={() => toggleSort('altitude')}>Wys.{sortIcon('altitude')}</th>
                      <th style={thStyle('delay')}     onClick={() => toggleSort('delay')}>Opóź.{sortIcon('delay')}</th>
                      <th style={thStyle(null)}>Samolot</th>
                      <th style={thStyle(null)}>Typ skoku</th>
                      <th style={thStyle(null)}>Uwagi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJumps.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign:'center', padding:'2rem', color:'var(--muted)' }}>
                          Brak skoków pasujących do filtrów
                        </td>
                      </tr>
                    ) : filteredJumps.map((j, index) => (
                      <tr
                        key={j.id}
                        onClick={() => toggle(j.id)}
                        style={{ borderBottom:'1px solid var(--border)', cursor:'pointer', background: selected.has(j.id) ? 'rgba(108,99,255,0.07)' : 'transparent', transition:'background 0.15s' }}
                        onMouseEnter={e => { if (!selected.has(j.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = selected.has(j.id) ? 'rgba(108,99,255,0.07)' : 'transparent' }}
                      >
                        <td style={{ padding:'0.55rem 0.75rem', textAlign:'center' }}>
                          <input
                            type="checkbox"
                            checked={selected.has(j.id)}
                            onChange={() => toggle(j.id)}
                            onClick={e => e.stopPropagation()}
                            style={{ width:15, height:15, accentColor:'var(--accent)', cursor:'pointer' }}
                          />
                        </td>
                        <td style={{ padding:'0.55rem 0.75rem', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'0.75rem' }}>{index + 1}</td>
                        <td style={{ padding:'0.55rem 0.75rem', fontFamily:'var(--mono)', color:'var(--accent2)', fontWeight:600 }}>{j.number}</td>
                        <td style={{ padding:'0.55rem 0.75rem', whiteSpace:'nowrap' }}>{fmt(j.jump_date)}</td>
                        <td style={{ padding:'0.55rem 0.75rem', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.city || '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.parachute || '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', whiteSpace:'nowrap' }}>{j.altitude ? `${j.altitude}m` : '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', whiteSpace:'nowrap' }}>{j.delay ? `${j.delay}s` : '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.aircraft || '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.jump_type || '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--muted)' }}>{j.notes || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}