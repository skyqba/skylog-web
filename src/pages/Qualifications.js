import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const CERT_CLASSES = ['PJ B', 'PJ C', 'PJ D']

export default function Qualifications() {
  const [data, setData]     = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  const [certNumber, setCertNumber]   = useState('')
  const [certClass, setCertClass]     = useState('')
  const [hasTandem, setHasTandem]     = useState(false)
  const [hasIns, setHasIns]           = useState(false)
  const [insSl, setInsSl]             = useState(false)
  const [insAff, setInsAff]           = useState(false)
  const [insT, setInsT]               = useState(false)
  const [tandemExpiry, setTandemExpiry] = useState('')
  const [insSlExpiry, setInsSlExpiry]   = useState('')
  const [insAffExpiry, setInsAffExpiry] = useState('')
  const [insTExpiry, setInsTExpiry]     = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user.id)
      const { data: q } = await supabase.from('qualifications').select('*').eq('user_id', user.id).single()
      if (q) {
        setData(q)
        setCertNumber(q.cert_number || '')
        setCertClass(q.cert_class || '')
        setHasTandem(q.has_tandem || false)
        setHasIns(q.has_ins || false)
        setInsSl(q.ins_sl || false)
        setInsAff(q.ins_aff || false)
        setInsT(q.ins_t || false)
        setTandemExpiry(q.tandem_expiry || '')
        setInsSlExpiry(q.ins_sl_expiry || '')
        setInsAffExpiry(q.ins_aff_expiry || '')
        setInsTExpiry(q.ins_t_expiry || '')
      }
    }
    load()
  }, [])

  const daysUntil = (date) => {
    if (!date) return null
    return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const expiryAlert = (date, label) => {
    const days = daysUntil(date)
    if (days === null) return null
    if (days < 0)   return { color:'var(--danger)', label:`${label} — wygasło ${Math.abs(days)} dni temu!` }
    if (days <= 30) return { color:'#FBBF24',       label:`${label} — wygasa za ${days} dni` }
    return null
  }

  const alerts = [
    expiryAlert(tandemExpiry, 'Uprawnienie Tandem'),
    expiryAlert(insSlExpiry,  'INS/SL'),
    expiryAlert(insAffExpiry, 'INS/AFF'),
    expiryAlert(insTExpiry,   'INS/T'),
  ].filter(Boolean)

  const save = async () => {
    setSaving(true)
    const payload = {
      user_id:      userId,
      cert_number:  certNumber || null,
      cert_class:   certClass || null,
      has_tandem:   hasTandem,
      has_ins:      hasIns,
      ins_sl:       hasIns ? insSl : false,
      ins_aff:      hasIns ? insAff : false,
      ins_t:        hasIns ? insT : false,
      tandem_expiry:  hasTandem ? tandemExpiry || null : null,
      ins_sl_expiry:  (hasIns && insSl) ? insSlExpiry || null : null,
      ins_aff_expiry: (hasIns && insAff) ? insAffExpiry || null : null,
      ins_t_expiry:   (hasIns && insT)   ? insTExpiry || null : null,
      updated_at:   new Date().toISOString(),
    }
    if (data) {
      await supabase.from('qualifications').update(payload).eq('user_id', userId)
    } else {
      await supabase.from('qualifications').insert(payload)
      setData(payload)
    }
    setMsg('Zapisano!')
    setTimeout(() => setMsg(''), 2500)
    setSaving(false)
  }

  const checkboxStyle = { width:16, height:16, accentColor:'var(--accent)', cursor:'pointer' }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 1rem' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <button onClick={() => navigate('/profile')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>← Wróć</button>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>Moje uprawnienia</h2>
        </div>

        {/* Alerty */}
        {alerts.map((a, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.85rem 1rem', borderRadius:'var(--r)', marginBottom:'0.75rem', background: a.color === 'var(--danger)' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.08)', border:`1px solid ${a.color}` }}>
            <span>{a.color === 'var(--danger)' ? '🚨' : '⚠️'}</span>
            <span style={{ fontSize:'0.85rem', fontWeight:600, color:a.color }}>{a.label}</span>
          </div>
        ))}

        {/* Świadectwo kwalifikacji */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Świadectwo kwalifikacji</h3>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <div className="form-group" style={{ flex:1 }}>
              <label className="label">Numer świadectwa</label>
              <input className="input" placeholder="np. 1234/2024" value={certNumber} onChange={e => setCertNumber(e.target.value)} />
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label className="label">Klasa</label>
              <select className="input" value={certClass} onChange={e => setCertClass(e.target.value)}>
                <option value="">— wybierz —</option>
                {CERT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Posiadane uprawnienia */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Posiadane uprawnienia</h3>

          {/* Tandem */}
          <div style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'1rem', marginBottom:'0.75rem', border:'1px solid var(--border)' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: hasTandem ? '0.75rem' : 0 }}>
              <input type="checkbox" checked={hasTandem} onChange={e => setHasTandem(e.target.checked)} style={checkboxStyle} />
              <span style={{ fontWeight:600, fontSize:'0.92rem' }}>Tandem</span>
            </label>
            {hasTandem && (
              <div className="form-group" style={{ marginBottom:0, marginTop:'0.5rem' }}>
                <label className="label">Data ważności uprawnień Tandem</label>
                <input className="input" type="date" value={tandemExpiry} onChange={e => setTandemExpiry(e.target.value)} />
                {daysUntil(tandemExpiry) !== null && (
                  <div style={{ marginTop:'0.5rem', fontSize:'0.82rem', fontWeight:600,
                    color: daysUntil(tandemExpiry) < 0 ? 'var(--danger)' : daysUntil(tandemExpiry) <= 30 ? '#FBBF24' : 'var(--success)' }}>
                    {daysUntil(tandemExpiry) < 0
                      ? `Wygasło ${Math.abs(daysUntil(tandemExpiry))} dni temu`
                      : daysUntil(tandemExpiry) <= 30
                      ? `Wygasa za ${daysUntil(tandemExpiry)} dni`
                      : `Ważne jeszcze ${daysUntil(tandemExpiry)} dni`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INS */}
          <div style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'1rem', border:'1px solid var(--border)' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: hasIns ? '0.75rem' : 0 }}>
              <input type="checkbox" checked={hasIns} onChange={e => { setHasIns(e.target.checked); if (!e.target.checked) { setInsSl(false); setInsAff(false); setInsT(false) } }} style={checkboxStyle} />
              <span style={{ fontWeight:600, fontSize:'0.92rem' }}>INS — Instruktor</span>
            </label>

            {hasIns && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>

                {/* INS/SL */}
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insSl ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insSl} onChange={e => setInsSl(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>INS/SL — Instruktor Static Line</span>
                  </label>
                  {insSl && (
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="label">Data ważności INS/SL</label>
                      <input className="input" type="date" value={insSlExpiry} onChange={e => setInsSlExpiry(e.target.value)} />
                      {daysUntil(insSlExpiry) !== null && (
                        <div style={{ marginTop:'0.4rem', fontSize:'0.82rem', fontWeight:600,
                          color: daysUntil(insSlExpiry) < 0 ? 'var(--danger)' : daysUntil(insSlExpiry) <= 30 ? '#FBBF24' : 'var(--success)' }}>
                          {daysUntil(insSlExpiry) < 0 ? `Wygasło ${Math.abs(daysUntil(insSlExpiry))} dni temu` : daysUntil(insSlExpiry) <= 30 ? `Wygasa za ${daysUntil(insSlExpiry)} dni` : `Ważne jeszcze ${daysUntil(insSlExpiry)} dni`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* INS/AFF */}
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insAff ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insAff} onChange={e => setInsAff(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>INS/AFF — Instruktor AFF</span>
                  </label>
                  {insAff && (
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="label">Data ważności INS/AFF</label>
                      <input className="input" type="date" value={insAffExpiry} onChange={e => setInsAffExpiry(e.target.value)} />
                      {daysUntil(insAffExpiry) !== null && (
                        <div style={{ marginTop:'0.4rem', fontSize:'0.82rem', fontWeight:600,
                          color: daysUntil(insAffExpiry) < 0 ? 'var(--danger)' : daysUntil(insAffExpiry) <= 30 ? '#FBBF24' : 'var(--success)' }}>
                          {daysUntil(insAffExpiry) < 0 ? `Wygasło ${Math.abs(daysUntil(insAffExpiry))} dni temu` : daysUntil(insAffExpiry) <= 30 ? `Wygasa za ${daysUntil(insAffExpiry)} dni` : `Ważne jeszcze ${daysUntil(insAffExpiry)} dni`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* INS/T */}
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insT ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insT} onChange={e => setInsT(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>INS/T — Instruktor Tandemowy</span>
                  </label>
                  {insT && (
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="label">Data ważności INS/T</label>
                      <input className="input" type="date" value={insTExpiry} onChange={e => setInsTExpiry(e.target.value)} />
                      {daysUntil(insTExpiry) !== null && (
                        <div style={{ marginTop:'0.4rem', fontSize:'0.82rem', fontWeight:600,
                          color: daysUntil(insTExpiry) < 0 ? 'var(--danger)' : daysUntil(insTExpiry) <= 30 ? '#FBBF24' : 'var(--success)' }}>
                          {daysUntil(insTExpiry) < 0 ? `Wygasło ${Math.abs(daysUntil(insTExpiry))} dni temu` : daysUntil(insTExpiry) <= 30 ? `Wygasa za ${daysUntil(insTExpiry)} dni` : `Ważne jeszcze ${daysUntil(insTExpiry)} dni`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

        {msg && <p style={{ color:'var(--success)', fontSize:'0.85rem', marginBottom:'0.5rem', textAlign:'center' }}>{msg}</p>}

        <button className="btn" onClick={save} disabled={saving} style={{ marginBottom:'2rem' }}>
          {saving ? 'Zapisywanie...' : 'Zapisz uprawnienia'}
        </button>

      </div>
    </div>
  )
}