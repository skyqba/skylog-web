import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Export() {
  const [jumps, setJumps]       = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading]   = useState(true)
  const [profile, setProfile]   = useState(null)
  const [generating, setGenerating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: j }, { data: prof }] = await Promise.all([
        supabase.from('jumps').select('*').eq('user_id', user.id).order('number', { ascending: true }),
        supabase.from('profiles').select('name,surname,city,license_number').eq('id', user.id).single(),
      ])
      setJumps(j || [])
      setProfile(prof)
      setSelected(new Set((j || []).map(x => x.id)))
      setLoading(false)
    }
    load()
  }, [])

  const toggleAll = () => {
    if (selected.size === jumps.length) setSelected(new Set())
    else setSelected(new Set(jumps.map(j => j.id)))
  }

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedJumps = jumps.filter(j => selected.has(j.id))

  const fmt = (d) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  const generatePDF = async () => {
    if (selectedJumps.length === 0) return
    setGenerating(true)

    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // Nagłówek
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Ksiazka Skokow - SkyLog', 14, 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    if (profile) {
      const name = `${profile.name || ''} ${profile.surname || ''}`.trim()
      if (name) doc.text(`Skoczek: ${name}`, 14, 26)
      if (profile.license_number) doc.text(`Nr licencji: ${profile.license_number}`, 14, 32)
    }
    doc.text(`Liczba skokow: ${selectedJumps.length}`, 14, profile?.license_number ? 38 : 32)
    doc.text(`Data wydruku: ${new Date().toLocaleDateString('pl-PL')}`, 200, 18)

    // Tabela
    autoTable(doc, {
      startY: 44,
      head: [['Nr', 'Data', 'Miejscowosc', 'Spadochron', 'Wys. (m)', 'Opoz. (s)', 'Samolot', 'Uwagi']],
      body: selectedJumps.map(j => [
        j.number,
        fmt(j.jump_date),
        j.city || '',
        j.parachute || '',
        j.altitude || '',
        j.delay || '',
        j.aircraft || '',
        j.notes || '',
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
        font: 'helvetica',
      },
      headStyles: {
        fillColor: [108, 99, 255],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 22 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 18 },
        5: { cellWidth: 18 },
        6: { cellWidth: 30 },
        7: { cellWidth: 'auto' },
      },
      didDrawPage: (data) => {
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Strona ${data.pageNumber}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, { align: 'center' })
        doc.setTextColor(0)
      }
    })

    doc.save(`SkyLog_skoki_${new Date().toISOString().split('T')[0]}.pdf`)
    setGenerating(false)
  }

  const printJumps = () => {
    if (selectedJumps.length === 0) return
    const name = profile ? `${profile.name || ''} ${profile.surname || ''}`.trim() : ''
    const rows = selectedJumps.map(j => `
      <tr>
        <td>${j.number}</td>
        <td>${fmt(j.jump_date)}</td>
        <td>${j.city || ''}</td>
        <td>${j.parachute || ''}</td>
        <td>${j.altitude || ''}</td>
        <td>${j.delay || ''}</td>
        <td>${j.aircraft || ''}</td>
        <td>${j.notes || ''}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>SkyLog - Ksiazka Skokow</title>
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
      <h1>Ksiazka Skokow - SkyLog</h1>
      <div class="meta">
        ${name ? `Skoczek: <strong>${name}</strong> &nbsp;|&nbsp; ` : ''}
        ${profile?.license_number ? `Nr licencji: <strong>${profile.license_number}</strong> &nbsp;|&nbsp; ` : ''}
        Liczba skokow: <strong>${selectedJumps.length}</strong> &nbsp;|&nbsp;
        Data wydruku: <strong>${new Date().toLocaleDateString('pl-PL')}</strong>
      </div>
      <table>
        <thead><tr>
          <th>Nr</th><th>Data</th><th>Miejscowosc</th><th>Spadochron</th>
          <th>Wys. (m)</th><th>Opoz. (s)</th><th>Samolot</th><th>Uwagi</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body></html>`

    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Nagłówek */}
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>← Wróć</button>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>Eksport skoków</h2>
        </div>

        {loading ? (
          <p style={{ color:'var(--muted)', textAlign:'center', padding:'3rem' }}>Ładowanie...</p>
        ) : (
          <>
            {/* Pasek akcji */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem', background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1rem 1.25rem', marginBottom:'1rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.9rem', fontWeight:500 }}>
                  <input
                    type="checkbox"
                    checked={selected.size === jumps.length && jumps.length > 0}
                    onChange={toggleAll}
                    style={{ width:16, height:16, accentColor:'var(--accent)', cursor:'pointer' }}
                  />
                  Zaznacz wszystkie
                </label>
                <span style={{ fontSize:'0.82rem', color:'var(--muted)', fontFamily:'var(--mono)' }}>
                  {selected.size} / {jumps.length} skoków
                </span>
              </div>

              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button
                  onClick={printJumps}
                  disabled={selected.size === 0}
                  style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.55rem 1rem', background:'transparent', border:'1px solid var(--border2)', borderRadius:'var(--r)', color: selected.size === 0 ? 'var(--muted)' : 'var(--text)', fontFamily:'var(--font)', fontSize:'0.85rem', cursor: selected.size === 0 ? 'not-allowed' : 'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => { if (selected.size > 0) e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                >
                  🖨 Drukuj
                </button>
                <button
                  onClick={generatePDF}
                  disabled={selected.size === 0 || generating}
                  className="btn"
                  style={{ width:'auto', padding:'0.55rem 1.25rem', display:'flex', alignItems:'center', gap:'0.4rem', opacity: selected.size === 0 ? 0.5 : 1 }}
                >
                  {generating ? '⏳ Generowanie...' : '📄 Pobierz PDF'}
                </button>
              </div>
            </div>

            {/* Lista skoków */}
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', overflow:'hidden' }}>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                  <thead>
                    <tr style={{ background:'var(--bg3)', borderBottom:'1px solid var(--border)' }}>
                      <th style={{ padding:'0.65rem 0.75rem', width:36 }}></th>
                      {['Nr', 'Data', 'Miejscowość', 'Spadochron', 'Wys.', 'Opóź.', 'Samolot', 'Uwagi'].map(h => (
                        <th key={h} style={{ padding:'0.65rem 0.75rem', textAlign:'left', fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:1, whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jumps.map(j => (
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
                        <td style={{ padding:'0.55rem 0.75rem', fontFamily:'var(--mono)', color:'var(--accent2)', fontWeight:600 }}>{j.number}</td>
                        <td style={{ padding:'0.55rem 0.75rem', whiteSpace:'nowrap' }}>{fmt(j.jump_date)}</td>
                        <td style={{ padding:'0.55rem 0.75rem', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.city || '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.parachute || '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', whiteSpace:'nowrap' }}>{j.altitude ? `${j.altitude}m` : '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', whiteSpace:'nowrap' }}>{j.delay ? `${j.delay}s` : '—'}</td>
                        <td style={{ padding:'0.55rem 0.75rem', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.aircraft || '—'}</td>
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
