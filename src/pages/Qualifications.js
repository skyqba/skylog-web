import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const CERT_CLASSES = ['PJ B', 'PJ C', 'PJ D']
const USPA_CLASSES = ['A', 'B', 'C', 'D']

export default function Qualifications() {
  const { t } = useTranslation()
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
  const [uspaCoach, setUspaCoach]     = useState(false)
  const [uspaInstructor, setUspaInstructor] = useState(false)
  const [uspaExaminer, setUspaExaminer]     = useState(false)
  const [uspaJudge, setUspaJudge]           = useState(false)
  const [uspaPro, setUspaPro]               = useState(false)

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
        setUspaCoach(q.uspa_coach || false)
        setUspaInstructor(q.uspa_instructor || false)
        setUspaExaminer(q.uspa_examiner || false)
        setUspaJudge(q.uspa_judge || false)
        setUspaPro(q.uspa_pro || false)
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
    if (days < 0)   return t('qualifications.expired_ago', { days: Math.abs(days) })
    if (days <= 30) return t('qualifications.expires_in', { days })
    return t('qualifications.valid_days', { days })
  }

  const expiryAlert = (date, label) => {
    const days = daysUntil(date)
    if (days === null) return null
    if (days < 0)   return { color:'var(--danger)', label:`${label} — ${t('qualifications.expired_ago', { days: Math.abs(days) })}` }
    if (days <= 30) return { color:'#FBBF24',       label:`${label} — ${t('qualifications.expires_in', { days })}` }
    return null
  }

  const alerts = [
    expiryAlert(certExpiry,   t('qualifications.cert_title')),
    expiryAlert(tandemExpiry, t('qualifications.tandem')),
    expiryAlert(insSlExpiry,  'INS/SL'),
    expiryAlert(insAffExpiry, 'INS/AFF'),
    expiryAlert(insTExpiry,   'INS/T'),
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
      uspa_expiry:            null,
      uspa_coach:             uspaCoach,
      uspa_instructor:        uspaInstructor,
      uspa_examiner:          uspaExaminer,
      uspa_judge:             uspaJudge,
      uspa_pro:               uspaPro,
      uspa_coach_expiry:      null,
      uspa_instructor_expiry: null,
      uspa_examiner_expiry:   null,
      uspa_judge_expiry:      null,
      uspa_pro_expiry:        null,
      updated_at:             new Date().toISOString(),
    }
    if (data) {
      await supabase.from('qualifications').update(payload).eq('user_id', userId)
    } else {
      await supabase.from('qualifications').insert(payload)
      setData(payload)
    }
    setMsg(t('qualifications.saved'))
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

  const UspaPermission = ({ checked, onCheck, label }) => (
    <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
      <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer' }}>
        <input type="checkbox" checked={checked} onChange={e => onCheck(e.target.checked)} style={checkboxStyle} />
        <span style={{ fontSize:'0.88rem', fontWeight:500 }}>{label}</span>
      </label>
    </div>
  )

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 1rem' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <button onClick={() => navigate('/profile')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>
            {t('qualifications.back')}
          </button>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>{t('qualifications.title')}</h2>
        </div>

        {alerts.map((a, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.85rem 1rem', borderRadius:'var(--r)', marginBottom:'0.75rem', background: a.color === 'var(--danger)' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.08)', border:`1px solid ${a.color}` }}>
            <span>{a.color === 'var(--danger)' ? '🚨' : '⚠️'}</span>
            <span style={{ fontSize:'0.85rem', fontWeight:600, color:a.color }}>{a.label}</span>
          </div>
        ))}

        {/* Świadectwo kwalifikacji */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>{t('qualifications.cert_title')}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            <div className="form-group">
              <label className="label">{t('qualifications.cert_number')}</label>
              <input className="input" placeholder="np. 1234/2024" value={certNumber} onChange={e => setCertNumber(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">{t('qualifications.cert_class')}</label>
              <select className="input" value={certClass} onChange={e => setCertClass(e.target.value)}>
                <option value="">{t('qualifications.cert_select')}</option>
                {CERT_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <DateField label={t('qualifications.cert_expiry')} value={certExpiry} onChange={setCertExpiry} />
        </div>

        {/* Posiadane uprawnienia */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>{t('qualifications.permissions_title')}</h3>

          {/* Tandem */}
          <div style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'1rem', marginBottom:'0.75rem', border:'1px solid var(--border)' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: hasTandem ? '0.75rem' : 0 }}>
              <input type="checkbox" checked={hasTandem} onChange={e => setHasTandem(e.target.checked)} style={checkboxStyle} />
              <span style={{ fontWeight:600, fontSize:'0.92rem' }}>{t('qualifications.tandem')}</span>
            </label>
            {hasTandem && <DateField label={t('qualifications.tandem_expiry')} value={tandemExpiry} onChange={setTandemExpiry} />}
          </div>

          {/* INS */}
          <div style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'1rem', border:'1px solid var(--border)' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: hasIns ? '0.75rem' : 0 }}>
              <input type="checkbox" checked={hasIns} onChange={e => { setHasIns(e.target.checked); if (!e.target.checked) { setInsSl(false); setInsAff(false); setInsT(false) } }} style={checkboxStyle} />
              <span style={{ fontWeight:600, fontSize:'0.92rem' }}>{t('qualifications.ins')}</span>
            </label>
            {hasIns && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insSl ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insSl} onChange={e => setInsSl(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>{t('qualifications.ins_sl')}</span>
                  </label>
                  {insSl && <DateField label={t('qualifications.ins_sl_expiry')} value={insSlExpiry} onChange={setInsSlExpiry} />}
                </div>
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insAff ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insAff} onChange={e => setInsAff(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>{t('qualifications.ins_aff')}</span>
                  </label>
                  {insAff && <DateField label={t('qualifications.ins_aff_expiry')} value={insAffExpiry} onChange={setInsAffExpiry} />}
                </div>
                <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.75rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', marginBottom: insT ? '0.5rem' : 0 }}>
                    <input type="checkbox" checked={insT} onChange={e => setInsT(e.target.checked)} style={checkboxStyle} />
                    <span style={{ fontSize:'0.88rem', fontWeight:500 }}>{t('qualifications.ins_t')}</span>
                  </label>
                  {insT && <DateField label={t('qualifications.ins_t_expiry')} value={insTExpiry} onChange={setInsTExpiry} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Licencja USPA */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>{t('qualifications.uspa_license')}</h3>
          <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:'1rem' }}>{t('qualifications.uspa_no_expiry')}</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
            <div className="form-group">
              <label className="label">{t('qualifications.uspa_number')}</label>
              <input className="input" placeholder="np. D-12345" value={uspaNumber} onChange={e => setUspaNumber(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">{t('qualifications.uspa_class')}</label>
              <select className="input" value={uspaClass} onChange={e => setUspaClass(e.target.value)}>
                <option value="">{t('qualifications.cert_select')}</option>
                {USPA_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Uprawnienia USPA */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>{t('qualifications.uspa_permissions')}</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <UspaPermission checked={uspaCoach}      onCheck={setUspaCoach}      label="Coach" />
            <UspaPermission checked={uspaInstructor} onCheck={setUspaInstructor} label="Instructor (I)" />
            <UspaPermission checked={uspaExaminer}   onCheck={setUspaExaminer}   label="Examiner (IE)" />
            <UspaPermission checked={uspaJudge}      onCheck={setUspaJudge}      label="Judge" />
            <UspaPermission checked={uspaPro}        onCheck={setUspaPro}        label="PRO Rating" />
          </div>
        </div>

        {msg && <p style={{ color:'var(--success)', fontSize:'0.85rem', marginBottom:'0.5rem', textAlign:'center' }}>{msg}</p>}

        <button className="btn" onClick={save} disabled={saving} style={{ marginBottom:'2rem' }}>
          {saving ? t('qualifications.saving') : t('qualifications.save')}
        </button>

      </div>
    </div>
  )
}