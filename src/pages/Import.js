import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Import() {
  const { t } = useTranslation()
  const [step, setStep]         = useState('upload')
  const [rows, setRows]         = useState([])
  const [imported, setImported] = useState(0)
  const [skipped, setSkipped]   = useState(0)
  const [errors, setErrors]     = useState([])
  const [dragOver, setDragOver] = useState(false)
  const navigate = useNavigate()

  const parseDate = (raw) => {
    if (!raw || !raw.trim()) return null
    const s = raw.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    const m1 = s.replace(/\.+/g, '.').match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
    if (m1) return `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`
    const m2 = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
    if (m2) return `${m2[1]}-${m2[2].padStart(2,'0')}-${m2[3].padStart(2,'0')}`
    return null
  }

  const detectFormat = (lines) => {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const cols = lines[i]
      const joined = cols.join('').toLowerCase()
      if (joined.includes('kolejny') || joined.includes('numer') || joined.includes('miejscow')) {
        return { headerRow: i, format: detectColumns(cols) }
      }
    }
    return { headerRow: 0, format: 'simple' }
  }

  const detectColumns = (headers) => {
    const map = {}
    headers.forEach((h, i) => {
      const lower = h.trim().toLowerCase()
      if (lower.includes('kolejny') || lower === 'numer') map.num = i
      if (lower.includes('miejscow')) map.city = i
      if (lower.includes('data')) map.date = i
      if (lower.includes('spadochron') || lower.includes('sadochron') || lower.includes('typ')) map.chute = i
      if (lower.includes('wysoko')) map.alt = i
      if (lower.includes('opó') || lower.includes('opu') || lower.includes('opuz')) map.delay = i
      if (lower.includes('samolot')) map.plane = i
      if (lower.includes('uwagi')) map.notes = i
    })
    return map
  }

  const parseTSV = (text) => {
    const allLines = text.split('\n').map(l => l.split('\t'))
    const { headerRow, format } = detectFormat(allLines)
    const colMap = typeof format === 'object' ? format : null
    const result = []
    for (let i = headerRow + 1; i < allLines.length; i++) {
      const cols = allLines[i]
      if (!cols || cols.every(c => !c.trim())) continue
      let num, city, date, chute, alt, delay, plane, notes
      if (colMap && Object.keys(colMap).length > 0) {
        num   = parseInt(cols[colMap.num])   || null
        city  = cols[colMap.city]?.trim()    || ''
        date  = parseDate(cols[colMap.date])
        chute = cols[colMap.chute]?.trim()   || ''
        alt   = parseInt(cols[colMap.alt])   || null
        delay = parseInt(cols[colMap.delay]) || null
        plane = cols[colMap.plane]?.trim()   || ''
        notes = cols[colMap.notes]?.trim()   || ''
      } else {
        const isFormatB = cols.length > 9 && parseInt(cols[5]) > 0
        if (isFormatB) {
          num = parseInt(cols[5]) || null; city = cols[2]?.trim() || ''; date = parseDate(cols[3])
          chute = cols[6]?.trim() || ''; alt = parseInt(cols[8]) || null; delay = parseInt(cols[9]) || null
          plane = cols[10]?.trim() || ''; notes = cols[11]?.trim() || ''
        } else {
          num = parseInt(cols[1]) || null; city = cols[2]?.trim() || ''; date = parseDate(cols[3])
          chute = cols[4]?.trim() || ''; alt = parseInt(cols[5]) || null; delay = parseInt(cols[6]) || null
          plane = cols[7]?.trim() || ''; notes = cols[8]?.trim() || ''
        }
      }
      if (!num || num < 1) continue
      if (!date && !city && !chute && !plane) continue
      result.push({ num, city, date, chute, alt, delay, plane, notes })
    }
    return result
  }

  const handleFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const parsed = parseTSV(text)
      setRows(parsed)
      setStep('preview')
    }
    reader.readAsText(file, 'utf-8')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const doImport = async () => {
    setStep('importing')
    const { data: { user } } = await supabase.auth.getUser()
    let ok = 0, skip = 0
    const errs = []
    const batchSize = 50
    for (let b = 0; b < rows.length; b += batchSize) {
      const batch = rows.slice(b, b + batchSize).map(row => ({
        user_id:   user.id,
        number:    row.num,
        jump_date: row.date || '2000-01-01',
        city:      row.city   || null,
        parachute: row.chute  || null,
        altitude:  row.alt    || null,
        delay:     row.delay  || null,
        aircraft:  row.plane  || null,
        notes:     row.notes  || null,
      }))
      const { error } = await supabase.from('jumps').insert(batch)
      if (error) { skip += batch.length; errs.push(`Partia ${b}-${b+batchSize}: ${error.message}`) }
      else { ok += batch.length }
      setImported(ok)
      setSkipped(skip)
    }
    setErrors(errs)
    setStep('done')
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', padding: '0.4rem 0.75rem', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.82rem' }}>{t('import.back')}</button>
          <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.3rem', fontWeight: 800 }}>{t('import.title')}</h2>
        </div>

        {step === 'upload' && (
          <div className="card">
            <h3 style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('import.select_file')}</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{t('import.desc')}</p>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('csv-file').click()}
              style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border2)'}`, borderRadius: 'var(--r2)', padding: '3rem 1rem', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(108,99,255,0.08)' : 'var(--bg3)', transition: 'all 0.2s' }}
            >
              <div style={{ fontSize: 36, marginBottom: '0.75rem', opacity: 0.5 }}>📂</div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{t('import.drop_title')}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{t('import.drop_hint')}</div>
            </div>
            <input id="csv-file" type="file" accept=".csv,.tsv,.txt" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
            <div style={{ marginTop: '1.5rem', background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '1rem', fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>{t('import.excel_hint')}</strong>
              {t('import.excel_steps')}
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 'var(--r)', padding: '0.85rem 1rem', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--success)', fontWeight: 600 }}>
              ✓ {t('import.found', { count: rows.length })}
            </div>
            <div className="card" style={{ marginBottom: '1rem', padding: '0' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {[t('import.col_number'), t('import.col_date'), t('import.col_city'), t('import.col_parachute'), t('import.col_altitude'), t('import.col_delay'), t('import.col_aircraft')].map(h => (
                        <th key={h} style={{ padding: '0.75rem', textAlign: 'left', fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap', background: 'var(--bg3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 8).map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontFamily: 'var(--mono)', color: 'var(--accent2)', fontWeight: 600 }}>{r.num}</td>
                        <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap', color: r.date ? 'var(--text)' : 'var(--danger)' }}>{r.date || t('import.no_date')}</td>
                        <td style={{ padding: '0.6rem 0.75rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.city || '—'}</td>
                        <td style={{ padding: '0.6rem 0.75rem', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.chute || '—'}</td>
                        <td style={{ padding: '0.6rem 0.75rem', whiteSpace: 'nowrap' }}>{r.alt ? `${r.alt}m` : '—'}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>{r.delay ? `${r.delay}s` : '—'}</td>
                        <td style={{ padding: '0.6rem 0.75rem', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.plane || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 8 && (
                  <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--muted)', fontSize: '0.82rem', borderTop: '1px solid var(--border)' }}>
                    {t('import.more_jumps', { count: rows.length - 8 })}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn ghost" onClick={() => { setStep('upload'); setRows([]) }}>{t('import.back_btn')}</button>
              <button className="btn" onClick={doImport}>{t('import.import_btn', { count: rows.length })}</button>
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: 40, marginBottom: '1rem' }}>⏳</div>
            <div style={{ fontFamily: 'var(--head)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('import.importing')}</div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('import.importing_progress', { imported, total: rows.length })}</div>
            <div style={{ background: 'var(--bg3)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--accent)', width: `${rows.length ? (imported / rows.length) * 100 : 0}%`, transition: 'width 0.3s', borderRadius: 8 }} />
            </div>
          </div>
        )}

        {step === 'done' && (
          <div>
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 'var(--r2)', padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>✅</div>
              <div style={{ fontFamily: 'var(--head)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}>{t('import.done_title')}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{t('import.done_imported', { count: imported })}</span>
                {skipped > 0 && <span style={{ color: 'var(--danger)' }}> · {t('import.done_errors', { count: skipped })}</span>}
              </div>
            </div>
            {errors.length > 0 && (
              <div className="card" style={{ marginBottom: '1rem', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--danger)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: 1 }}>{t('import.errors_title')}</div>
                {errors.map((e, i) => <div key={i} style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.25rem' }}>{e}</div>)}
              </div>
            )}
            <button className="btn" onClick={() => navigate('/')}>{t('import.go_to_journal')} →</button>
          </div>
        )}
      </div>
    </div>
  )
}