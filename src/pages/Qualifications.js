import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const CERT_CLASSES = ['PJ B', 'PJ C', 'PJ D']
const USPA_CLASSES = ['A', 'B', 'C', 'D']

export default function Qualifications() {
  const [data, setData]     = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  const [certNumber, setCertNumber]   = useState('')
  const [certClass, setCertClass]     = useState('')
  const [certExpiry, setCertExpiry]   = useState('')
  const [hasTandem, setHasTandem]     = useState(false)
  const [hasIns, setHasIns]           = useState(false)
  const [insSl, setInsSl]             = useState(false)
  const [insAff, setInsAff]           = useState(false)
  const [insT, setInsT]               = useState(false)
  const [tandemExpiry, setTandemExpiry] = useState('')
  const [insSlExpiry, setInsSlExpiry]   = useState('')
  const [insAffExpiry, setInsAffExpiry] = useState('')
  const [insTExpiry, setInsTExpiry]     = useState('')

  const [uspaNumber, setUspaNumber]   = useState('')
  const [uspaClass, setUspaClass]     = useState('')
  const [uspaExpiry, setUspaExpiry]   = useState('')
  const [uspaCoach, setUspaCoach]     = useState(false)
  const [uspaInstructor, setUspaInstructor] = useState(false)
  const [uspaExaminer, setUspaExaminer]     = useState(false)
  const [uspaJudge, setUspaJudge]           = useState(false)
  const [uspaPro, setUspaPro]               = useState(false)
  const [uspaCoachExpiry, setUspaCoachExpiry]           = useState('')
  const [uspaInstructorExpiry, setUspaInstructorExpiry] = useState('')
  const [uspaExaminerExpiry, setUspaExaminerExpiry]     = useState('')
  const [uspaJudgeExpiry, setUspaJudgeExpiry]           = useState('')
  const [uspaProExpiry, setUspaProExpiry]               = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user.id)
      const { data: q } = await supabase.from('qualifications').select('*').eq('user_id', user.id).single()
      if (q) {
        setData(q)
        setCertNumber(q.cert_number || '')
        setCertClass(q.cert_class || '')
        setCertExpiry(q.cert_expiry || '')
        setHasTandem(q.has_tandem || false)
        setHasIns(q.has_ins || false)
        setInsSl(q.ins_sl || false)
        setInsAff(q.ins_aff || false)
        setInsT(q.ins_t || false)
        setTandemExpiry(q.tandem_expiry || '')
        setInsSlExpiry(q.ins_sl_expiry || '')
        setInsAffExpiry(q.ins_aff_expiry || '')
        setInsTExpiry(q.ins_t_expiry || '')
        setUspaNumber(q.uspa_number || '')
        setUspaClass(q.uspa_class || '')
        setUspaExpiry(q.uspa_expiry || '')
        setUspaCoach(q.uspa_coach || false)
        setUspaInstructor(q.uspa_instructor || false)
        setUspaExaminer(q.uspa_examiner || false)
        setUspaJudge(q.uspa_judge || false)
        setUspaPro(q.uspa_pro || false)
        setUspaCoachExpiry(q.uspa_coach_expiry || '')
        setUspaInstructorExpiry(q.uspa_instructor_expiry || '')
        setUspaExaminerExpiry(q.uspa_examiner_expiry || '')
        setUspaJudgeExpiry(q.uspa_judge_expiry || '')
        setUspaProExpiry(q.uspa_pro_expiry || '')
      }
    }
    load()
  }, [])

  const daysUntil = (date) => {
    if (!date) return null
    return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  }

  const statusColor = (days) => {
    if (days === null) return null
    if (days < 0)   return 'var(--danger)'
    if (days <= 30) return '#FBBF24'
    return 'var(--success)'
  }

  const statusText = (days) => {
    if (days === null) return ''
    if (days < 0)   return `Wygasło ${Math.abs(days)} dni temu`
    if (days <= 30) return `Wygasa za ${days} dni`
    return `Ważne jeszcze ${days} dni`
  }

  const expiryAlert = (date, label) => {
    const days = daysUntil(date)
    if (days === null) return null
    if (days < 0)   return { color:'var(--danger)', label:`${label} — wygasło ${Math.abs(days)} dni temu!` }
    if (days <= 30) return { color:'#FBBF24',       label:`${label} — wygasa za ${days} dni` }
    return null
  }

  const alerts = [
    expiryAlert(certExpiry,           'Świadectwo kwalifikacji'),
    expiryAlert(tandemExpiry,         'Uprawnienie Tandem'),
    expiryAlert(insSlExpiry,          'INS/SL'),
    expiryAlert(insAffExpiry,         'INS/AFF'),
    expiryAlert(insTExpiry,           'INS/T'),
    expiryAlert(uspaExpiry,           'Licencja USPA'),
    expiryAlert(uspaCoachExpiry,      'USPA Coach'),
    expiryAlert(uspaInstructorExpiry, 'USPA Instructor'),
    expiryAlert(uspaExaminerExpiry,   'USPA Examiner'),
    expiryAlert(uspaJudgeExpiry,      'USPA Judge'),
    expiryAlert(uspaProExpiry,        'USPA PRO Rating'),
  ].filter(Boolean)

  const save = async () => {
    setSaving(true)
    const payload = {
      user_id:                userId,
      cert_number:            certNumber || null,
      cert_class:             certClass || null,
      cert_expiry:            certExpiry || null,
      has_tandem:             hasTandem,
      has_ins:                hasIns,
      ins_sl:                 hasIns ? insSl : false,
      ins_aff:                hasIns ? insAff : false,
      ins_t:                  hasIns ? insT : false,
      tandem_expiry:          hasTandem ? tandemExpiry || null : null,
      ins_sl_expiry:          (hasIns && insSl)  ? insSlExpiry  || null : null,
      ins_aff_expiry:         (hasIns && insAff) ? insAffExpiry || null : null,
      ins_t_expiry:           (hasIns && insT)   ? insTExpiry   || null : null,
      uspa_number:            uspaNumber || null,
      uspa_class:             uspaClass || null,
      uspa_expiry:            uspaExpiry || null,
      uspa_coach:             uspaCoach,
      uspa_instructor:        uspaInstructor,
      uspa_examiner:          uspaExaminer,
      uspa_judge:             uspaJudge,
      uspa_pro:               uspaPro,
      uspa_coach_expiry:      uspaCoach      ? uspaCoachExpiry      || null : null,
      uspa_instructor_expiry: uspaInstructor ? uspaInstructorExpiry || null : null,
      uspa_examiner_expiry:   uspaExaminer   ? uspaExaminerExpiry   || null : null,
      uspa_judge_expiry:      uspaJudge      ? uspaJudgeExpiry      || null : null,
      uspa_pro_expiry:        uspaPro        ? uspaProExpiry        || null : null,
      updated_at:             new Date().toISOString(),
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

  const DateField = ({ label, value, onChange }) => {
    const days = daysUntil(value)
    return (
      <div className="form-group" style={{ marginBottom:0 }}>
        <label className="label">{label}</label>
        <input className="input" type="date" value={value} onChange={e => onChange(e.target.value)} />
        {days !== null && (
          <div style={{ marginTop:'0.4rem', fontSize:'0.82rem', fontWeight:600, color: statusColor(days) }}>
            {statusText(days)}
          </div>
        )}
      </div>
    )
  }

  const UspaPermission = ({ checked, onCheck, label, expiry, onExpiry }) => (
    <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
      <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: checked ? '0.5rem' : 0 }}>
        <input type="checkbox" checked={checked} onChange={e => onCheck(e.target.checked)} style={checkboxStyle} />
        <span style={{ fontSize:'0.88rem', fontWeight:500 }}>{label}</span>
      </label>
      {checked && <DateField label="Data ważności" value={expiry} onChange={onExpiry} />}
    </div>
  )

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 1rem' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <button onClick={() => navigate('/profile')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>← Wróć</button>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>Moje uprawnienia</h2>
        </div>

        {alerts.map((a, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.85rem 1rem', borderRadius:'var(--r)', marginBottom:'0.75rem', background: a.color === 'var(--danger)' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.08)', border:`1px solid ${a.color}` }}>
            <span>{a.color === 'var(--danger)' ? '🚨' : '⚠️'}</span>
            <span style={{ fontSize:'0.85rem', fontWeight:600, color:a.color }}>{a.label}</span>
          </div>
        ))}

        {/* Świadectwo kwalifikacji */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Świadectwo kwalifikacji</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            <div className="form-group">
              <label className="label">Numer świadectwa</label>
              <input className="input" placeholder="np. 1234/2024" value={certNumber} onChange={e => setCertNumber(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Klasa</label>
              <select className="input" value={certClass} onChange={e => setCertClass(e.target.value)}>
                <option value="">— wybierz —</option>
                {CERT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <DateField label="Data ważności świadectwa" value={certExpiry} onChange={setCertExpiry} />
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
            {hasTandem && <DateField label="Data ważności uprawnień Tandem" value={tandemExpiry} onChange={setTandemExpiry} />}
          </div>

          {/* INS */}
          <div style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'1rem', border:'1px solid var(--border)' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: hasIns ? '0.75rem' : 0 }}>
              <input type="checkbox" checked={hasIns} onChange={e => { setHasIns(e.target.checked); if (!e.target.checked) { setInsSl(false); setInsAff(false); setInsT(false) } }} style={checkboxStyle} />
              <span style={{ fontWeight:600, fontSize:'0.92rem' }}>INS — Instruktor</span>
            </label>
            {hasIns && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insSl ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insSl} onChange={e => setInsSl(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>INS/SL — Instruktor Static Line</span>
                  </label>
                  {insSl && <DateField label="Data ważności INS/SL" value={insSlExpiry} onChange={setInsSlExpiry} />}
                </div>
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insAff ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insAff} onChange={e => setInsAff(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>INS/AFF — Instruktor AFF</span>
                  </label>
                  {insAff && <DateField label="Data ważności INS/AFF" value={insAffExpiry} onChange={setInsAffExpiry} />}
                </div>
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insT ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insT} onChange={e => setInsT(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>INS/T — Instruktor Tandemowy</span>
                  </label>
                  {insT && <DateField label="Data ważności INS/T" value={insTExpiry} onChange={setInsTExpiry} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Licencja USPA */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Licencja USPA</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'0.75rem' }}>
            <div className="form-group">
              <label className="label">Numer licencji</label>
              <input className="input" placeholder="np. D-12345" value={uspaNumber} onChange={e => setUspaNumber(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Klasa</label>
              <select className="input" value={uspaClass} onChange={e => setUspaClass(e.target.value)}>
                <option value="">— wybierz —</option>
                {USPA_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <DateField label="Data ważności licencji USPA" value={uspaExpiry} onChange={setUspaExpiry} />
        </div>

        {/* Uprawnienia USPA */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Uprawnienia USPA</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <UspaPermission checked={uspaCoach}      onCheck={setUspaCoach}      label="Coach"            expiry={uspaCoachExpiry}      onExpiry={setUspaCoachExpiry} />
            <UspaPermission checked={uspaInstructor} onCheck={setUspaInstructor} label="Instructor (I)"   expiry={uspaInstructorExpiry} onExpiry={setUspaInstructorExpiry} />
            <UspaPermission checked={uspaExaminer}   onCheck={setUspaExaminer}   label="Examiner (IE)"   expiry={uspaExaminerExpiry}   onExpiry={setUspaExaminerExpiry} />
            <UspaPermission checked={uspaJudge}      onCheck={setUspaJudge}      label="Judge"            expiry={uspaJudgeExpiry}      onExpiry={setUspaJudgeExpiry} />
            <UspaPermission checked={uspaPro}        onCheck={setUspaPro}        label="PRO Rating"       expiry={uspaProExpiry}        onExpiry={setUspaProExpiry} />
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