import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import JumpCard from '../components/JumpCard'
import ProJournal from './ProJournal'
import JumpsMap from '../components/JumpsMap'
import {
  dbGetJumps, dbSetJumps,
  dbGetProfile, dbSetProfile,
  dbGetRigs, dbSetRigs,
  dbGetQuals, dbSetQuals,
  dbGetDropzones, dbSetDropzones,
  dbGetAircraft, dbSetAircraft,
  dbAddJump, dbDeleteJump
} from '../db'
import { saveToQueue } from '../offlineQueue'


function LoadingScreen() {
  const [progress, setProgress] = React.useState(0)
  const [phase, setPhase] = React.useState(0)
  const phases = ['Łączenie z bazą...', 'Pobieranie skoków...', 'Ładowanie profilu...', 'Prawie gotowe...']

  React.useEffect(() => {
    const start = Date.now()
    const duration = 1800
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / duration) * 100, 95)
      setProgress(pct)
      setPhase(Math.floor((pct / 100) * phases.length))
      if (pct >= 95) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2rem', padding:'2rem' }}>

      {/* Logo */}
      <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'var(--head)', fontSize:'2rem', fontWeight:900, marginBottom:'0.25rem' }}>
          <span style={{ color:'#A78BFA' }}>Jump</span>
          <span style={{ color:'var(--text)' }}>Log</span>
          <span style={{ color:'#A78BFA' }}>X</span>
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:'0.6rem', color:'var(--muted)', letterSpacing:'0.15em', textTransform:'uppercase' }}>
          {phases[Math.min(phase, phases.length - 1)]}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width:'100%', maxWidth:280 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--muted)' }}>Ładowanie</span>
          <span style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'#A78BFA', fontWeight:700 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }}>
          <div style={{
            height:'100%',
            width:`${progress}%`,
            background:'linear-gradient(90deg, #8B5CF6, #06B6D4)',
            borderRadius:99,
            transition:'width 0.1s linear',
            boxShadow:'0 0 12px rgba(139,92,246,0.6)',
          }} />
        </div>
      </div>

      {/* Animowane kropki */}
      <div style={{ display:'flex', gap:'0.5rem' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width:6, height:6, borderRadius:'50%',
            background: i === Math.floor(Date.now() / 400) % 3 ? '#A78BFA' : 'rgba(255,255,255,0.15)',
            animation: `pulse${i} 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
        div[style*="border-radius: 50%"] { animation: dotPulse 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  )
}

export default function Journal() {
  const { t } = useTranslation()
  const [jumps, setJumps]         = useState([])
  const [profile, setProfile]     = useState(null)
  const [rigs, setRigs]           = useState([])
  const [quals, setQuals]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [dropzones, setDropzones]   = useState([])
  const [showDocs, setShowDocs]   = useState(false)
  const [search, setSearch]       = useState('')
  const [repeating, setRepeating] = useState(false)
  const [offline, setOffline]     = useState(!navigator.onLine)
  const [dismissedRigs, setDismissedRigs]   = useState(() => JSON.parse(sessionStorage.getItem('dismissedRigs') || '[]'))
  const [dismissedQuals, setDismissedQuals] = useState(() => JSON.parse(sessionStorage.getItem('dismissedQuals') || '[]'))
  const [confirmDismiss, setConfirmDismiss] = useState(null)
  const [confirmDelete, setConfirmDelete]   = useState(null)

  const alertSettings = (() => {
    try { return JSON.parse(localStorage.getItem('alertSettings') || '{}') } catch { return {} }
  })()
  const alertOn = (key) => alertSettings[key] !== false

  useEffect(() => {
    const handleOnline  = () => { setOffline(false); fetchAll() }
    const handleOffline = () => setOffline(true)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    // Najpierw pokaz dane z cache - natychmiastowe ladowanie
    const [cachedJumps, cachedProfile, cachedRigs, cachedQuals, cachedDz] = await Promise.all([
      dbGetJumps(), dbGetProfile(), dbGetRigs(), dbGetQuals(), dbGetDropzones()
    ])
    if (cachedJumps?.length > 0) {
      setJumps(cachedJumps)
      setProfile(cachedProfile)
      setRigs(cachedRigs || [])
      setQuals(cachedQuals)
      setDropzones(cachedDz || [])
      setLoading(false)
    }

    if (!navigator.onLine) {
      setLoading(false)
      return
    }

    // Odswież dane z Supabase w tle
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [{ data: j }, { data: prof }, { data: rigList }, { data: q }, { data: dzList }, { data: acList }] = await Promise.all([
      supabase.from('jumps').select('*').order('number', { ascending: false }),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('rigs').select('id,name,main,reserve_expiry').eq('user_id', user.id),
      supabase.from('qualifications').select('*').eq('user_id', user.id).single(),
      supabase.from('dropzones').select('*').eq('user_id', user.id).order('name'),
      supabase.from('aircraft').select('*').eq('user_id', user.id).order('name'),
    ])
    await dbSetJumps(j || [])
    await dbSetProfile(prof ? { ...prof, email: user.email } : null)
    await dbSetRigs(rigList || [])
    await dbSetQuals(q || null)
    await dbSetDropzones(dzList || [])
    setDropzones(dzList || [])
    await dbSetAircraft(acList || [])
    setJumps(j || [])
    setProfile(prof)
    setRigs(rigList || [])
    setQuals(q || null)
    setLoading(false)
  }

  const deleteJump = async (id) => {
    await dbDeleteJump(id)
    setJumps(j => j.filter(x => x.id !== id))
    if (navigator.onLine) {
      await supabase.from('jumps').delete().eq('id', id)
    } else {
      await saveToQueue({ type: 'DELETE_JUMP', payload: { id } })
    }
  }

  const repeatLastJump = async () => {
    if (jumps.length === 0) return
    setRepeating(true)
    const last = jumps[0]
    const { data: { user } } = await supabase.auth.getUser()
    const nextNum = last.number + 1
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase.from('jumps').insert({
      user_id:   user.id,
      number:    nextNum,
      jump_date: today,
      city:      last.city || null,
      parachute: last.parachute || null,
      altitude:  last.altitude || null,
      delay:     last.delay || null,
      aircraft:  last.aircraft || null,
      jump_type: last.jump_type || null,
      notes:     null,
      result:    null,
    }).select().single()
    if (!error && data) {
      await dbAddJump(data)
      setJumps(j => [data, ...j])
    }
    setRepeating(false)
  }

  const daysUntil = (date) => {
    if (!date) return null
    return Math.ceil((new Date(date) - new Date()) / (1000*60*60*24))
  }

  const docColor = (days) => {
    if (days === null) return null
    if (days < 0)   return { color:'var(--danger)', dot:'#F87171' }
    if (days <= 30) return { color:'#FBBF24',       dot:'#FBBF24' }
    return               { color:'var(--success)',  dot:'#34D399' }
  }

  const docs = [
    profile?.insurance_expiry ? { label: t('profile.insurance_title'), expiry: profile.insurance_expiry, days: daysUntil(profile.insurance_expiry) } : null,
    profile?.medical_expiry   ? { label: t('profile.medical_title'),   expiry: profile.medical_expiry,   days: daysUntil(profile.medical_expiry) } : null,
    quals?.cert_number ? { label: `Świadectwo kwalifikacji${quals.cert_number ? ` ${quals.cert_number}` : ''}`, expiry: null, days: null, noExpiry: true } : null,
    quals?.cert_expiry && quals?.cert_class ? { label: `Klasa ${quals.cert_class}`, expiry: quals.cert_expiry, days: daysUntil(quals.cert_expiry) } : null,
    quals?.has_tandem && quals?.tandem_expiry ? { label: 'Uprawnienie Tandem', expiry: quals.tandem_expiry, days: daysUntil(quals.tandem_expiry) } : null,
    quals?.has_ins && quals?.ins_sl  && quals?.ins_sl_expiry  ? { label: 'INS/SL',  expiry: quals.ins_sl_expiry,  days: daysUntil(quals.ins_sl_expiry) } : null,
    quals?.has_ins && quals?.ins_aff && quals?.ins_aff_expiry ? { label: 'INS/AFF', expiry: quals.ins_aff_expiry, days: daysUntil(quals.ins_aff_expiry) } : null,
    quals?.has_ins && quals?.ins_t   && quals?.ins_t_expiry   ? { label: 'INS/T',   expiry: quals.ins_t_expiry,   days: daysUntil(quals.ins_t_expiry) } : null,
    (quals?.uspa_number || quals?.uspa_class) ? {
      label: `USPA${quals.uspa_class ? ` — ${quals.uspa_class}` : ''}${quals.uspa_number ? ` (${quals.uspa_number})` : ''}`,
      expiry: null, days: null, noExpiry: true
    } : null,
    quals?.uspa_coach      ? { label: 'USPA Coach',      expiry: null, days: null, noExpiry: true } : null,
    quals?.uspa_instructor ? { label: 'USPA Instructor', expiry: null, days: null, noExpiry: true } : null,
    quals?.uspa_examiner   ? { label: 'USPA Examiner',   expiry: null, days: null, noExpiry: true } : null,
    quals?.uspa_judge      ? { label: 'USPA Judge',      expiry: null, days: null, noExpiry: true } : null,
    quals?.uspa_pro        ? { label: 'USPA PRO Rating', expiry: null, days: null, noExpiry: true } : null,
    ...rigs.filter(r => r.reserve_expiry).map(r => ({
      label: `Reserve — ${r.name}`,
      expiry: r.reserve_expiry,
      days: daysUntil(r.reserve_expiry)
    })),
  ].filter(Boolean)

  const urgentDocs = docs.filter(d => d.days !== null && d.days <= 30)

  const urgentRigs = alertOn('alert_rigs')
    ? rigs
        .filter(r => r.reserve_expiry && !dismissedRigs.includes(r.id))
        .map(r => ({ ...r, days: daysUntil(r.reserve_expiry) }))
        .filter(r => r.days !== null && r.days <= 60)
        .sort((a, b) => a.days - b.days)
    : []

  const profileAlerts = [
    profile?.insurance_expiry && alertOn('alert_insurance') ? { key:'insurance', label: t('profile.insurance_title'), days: daysUntil(profile.insurance_expiry), linkTo:'/profile' } : null,
    profile?.medical_expiry   && alertOn('alert_medical')   ? { key:'medical',   label: t('profile.medical_title'),   days: daysUntil(profile.medical_expiry),   linkTo:'/profile' } : null,
  ].filter(a => a !== null && a.days !== null && a.days <= 60 && !dismissedQuals.includes(a.key))
   .sort((a, b) => a.days - b.days)

  const qualAlerts = quals ? [
    quals.cert_expiry && quals.cert_class && alertOn('alert_cert') ? { key:'cert', label: `Klasa ${quals.cert_class}`, days: daysUntil(quals.cert_expiry) } : null,
    quals.has_tandem && quals.tandem_expiry && alertOn('alert_tandem')             ? { key:'tandem',  label: 'Uprawnienie Tandem',      days: daysUntil(quals.tandem_expiry) } : null,
    quals.has_ins && quals.ins_sl  && quals.ins_sl_expiry  && alertOn('alert_ins') ? { key:'ins_sl',  label: 'INS/SL',                  days: daysUntil(quals.ins_sl_expiry) } : null,
    quals.has_ins && quals.ins_aff && quals.ins_aff_expiry && alertOn('alert_ins') ? { key:'ins_aff', label: 'INS/AFF',                 days: daysUntil(quals.ins_aff_expiry) } : null,
    quals.has_ins && quals.ins_t   && quals.ins_t_expiry   && alertOn('alert_ins') ? { key:'ins_t',   label: 'INS/T',                   days: daysUntil(quals.ins_t_expiry) } : null,
  ].filter(a => a !== null && a.days !== null && a.days <= 60 && !dismissedQuals.includes(a.key))
   .sort((a, b) => a.days - b.days) : []

  const requestDismiss = (type, id) => setConfirmDismiss({ type, id })

  const confirmDismissYes = () => {
    if (!confirmDismiss) return
    if (confirmDismiss.type === 'rig') {
      const updated = [...dismissedRigs, confirmDismiss.id]
      setDismissedRigs(updated)
      sessionStorage.setItem('dismissedRigs', JSON.stringify(updated))
    } else {
      const updated = [...dismissedQuals, confirmDismiss.id]
      setDismissedQuals(updated)
      sessionStorage.setItem('dismissedQuals', JSON.stringify(updated))
    }
    setConfirmDismiss(null)
  }

  const AlertBanner = ({ expired, color, title, subtitle, linkTo, onDismiss }) => (
    <div style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.25rem', borderRadius:'var(--r2)', marginBottom:'1rem', background: expired ? 'rgba(248,113,113,0.12)' : 'rgba(251,191,36,0.08)', border:`2px solid ${expired ? 'rgba(248,113,113,0.6)' : 'rgba(251,191,36,0.5)'}` }}>
      <div style={{ fontSize:28, flexShrink:0 }}>{expired ? '🚨' : '⚠️'}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--head)', fontSize:'0.95rem', fontWeight:800, color, marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:'0.82rem', color, opacity:0.9 }}>{subtitle}</div>
      </div>
      <Link to={linkTo} style={{ textDecoration:'none', flexShrink:0 }}>
        <button style={{ background:'transparent', border:`1px solid ${color}`, borderRadius:8, padding:'0.4rem 0.9rem', color, fontFamily:'var(--font)', fontSize:'0.8rem', cursor:'pointer', whiteSpace:'nowrap' }}>{t('journal.update')}</button>
      </Link>
      <button
        onClick={onDismiss}
        style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1.1rem', padding:'0.2rem 0.4rem', marginLeft:'0.25rem', flexShrink:0, lineHeight:1 }}
        onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}
        title={t('journal.close_alert')}
      >✕</button>
    </div>
  )

  const isPro = document.body.classList.contains('theme-pro') || document.body.classList.contains('theme-dark') || document.body.classList.contains('theme-dark')

  if (isPro) {
    return (
      <>
        <Navbar />
        <ProJournal
          jumps={jumps}
          loading={loading}
          onDelete={(id) => setConfirmDelete({ id, number: jumps.find(j=>j.id===id)?.number })}
          onRepeat={repeatLastJump}
          repeating={repeating}
          docs={docs}
          urgentDocs={urgentDocs}
          urgentRigs={urgentRigs}
          profileAlerts={profileAlerts}
          qualAlerts={qualAlerts}
        />
        {confirmDelete && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.5rem', maxWidth:360, width:'100%' }}>
              <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.75rem' }}>{t('journal.delete_jump_title', { number: confirmDelete.number })}</div>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem' }}>{t('journal.delete_jump_desc')}</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button className="btn ghost" style={{ flex:1 }} onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</button>
                <button className="btn danger" style={{ flex:1 }} onClick={() => { deleteJump(confirmDelete.id); setConfirmDelete(null) }}>{t('journal.delete_jump_confirm')}</button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:680, margin:'0 auto', padding:'1.5rem 1rem' }}>

        {offline && (
          <div style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.4)', borderRadius:'var(--r)', padding:'0.65rem 0.9rem', color:'#FBBF24', fontSize:'0.82rem', marginBottom:'1rem', fontWeight:500 }}>
            {t('journal.offline')}
          </div>
        )}

        {confirmDelete && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.5rem', maxWidth:360, width:'100%' }}>
              <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.75rem' }}>{t('journal.delete_jump_title', { number: confirmDelete.number })}</div>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem' }}>{t('journal.delete_jump_desc')}</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button className="btn ghost" style={{ flex:1 }} onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</button>
                <button className="btn danger" style={{ flex:1 }} onClick={() => { deleteJump(confirmDelete.id); setConfirmDelete(null) }}>{t('journal.delete_jump_confirm')}</button>
              </div>
            </div>
          </div>
        )}

        {confirmDismiss && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.5rem', maxWidth:360, width:'100%' }}>
              <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.75rem' }}>{t('journal.dismiss_alert_title')}</div>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem' }}>{t('journal.dismiss_alert_desc')}</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button className="btn ghost" style={{ flex:1 }} onClick={() => setConfirmDismiss(null)}>{t('journal.dismiss_no')}</button>
                <button className="btn danger" style={{ flex:1 }} onClick={confirmDismissYes}>{t('journal.dismiss_yes')}</button>
              </div>
            </div>
          </div>
        )}

        {urgentRigs.map(rig => {
          const expired = rig.days < 0
          const color = expired ? 'var(--danger)' : '#FBBF24'
          return (
            <AlertBanner
              key={rig.id}
              expired={expired}
              color={color}
              title={expired ? t('journal.alert_reserve_expired') : t('journal.alert_reserve_expiring')}
              subtitle={`${rig.name} — ${expired
                ? t('journal.alert_reserve_invalid', { days: Math.abs(rig.days), date: new Date(rig.reserve_expiry).toLocaleDateString('pl-PL') })
                : t('journal.alert_reserve_valid', { date: new Date(rig.reserve_expiry).toLocaleDateString('pl-PL'), days: rig.days })}`}
              linkTo="/profile"
              onDismiss={() => requestDismiss('rig', rig.id)}
            />
          )
        })}

        {profileAlerts.map((a) => {
          const expired = a.days < 0
          const color = expired ? 'var(--danger)' : '#FBBF24'
          return (
            <AlertBanner
              key={a.key}
              expired={expired}
              color={color}
              title={expired ? t('journal.alert_expired', { label: a.label }) : t('journal.alert_expiring', { label: a.label })}
              subtitle={expired ? t('journal.alert_expired_ago', { days: Math.abs(a.days) }) : t('journal.alert_days_left', { days: a.days })}
              linkTo={a.linkTo}
              onDismiss={() => requestDismiss('qual', a.key)}
            />
          )
        })}

        {qualAlerts.map((a) => {
          const expired = a.days < 0
          const color = expired ? 'var(--danger)' : '#FBBF24'
          return (
            <AlertBanner
              key={a.key}
              expired={expired}
              color={color}
              title={expired ? t('journal.alert_expired', { label: a.label }) : t('journal.alert_expiring', { label: a.label })}
              subtitle={expired ? t('journal.alert_expired_ago', { days: Math.abs(a.days) }) : t('journal.alert_days_left', { days: a.days })}
              linkTo="/qualifications"
              onDismiss={() => requestDismiss('qual', a.key)}
            />
          )
        })}

        {docs.length > 0 && (
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--r2)', marginBottom:'1rem', overflow:'hidden' }}>
            <button onClick={() => setShowDocs(d => !d)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.85rem 1.1rem', background:'transparent', border:'none', cursor:'pointer', color:'var(--text)', fontFamily:'var(--font)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ fontSize:15 }}>📋</span>
                <span style={{ fontSize:'0.88rem', fontWeight:500 }}>{t('journal.my_docs')}</span>
                {urgentDocs.length > 0 && (
                  <span style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.4)', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.72rem', color:'#FBBF24', fontWeight:600 }}>
                    {urgentDocs.length} {t('journal.needs_attention')}
                  </span>
                )}
              </div>
              <span style={{ color:'var(--muted)', fontSize:'0.8rem' }}>{showDocs ? '▲' : '▼'}</span>
            </button>
            {showDocs && (
              <div style={{ borderTop:'1px solid var(--border)', padding:'0.75rem 1.1rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                {docs.map(doc => {
                  const c = docColor(doc.days)
                  const fmt = doc.expiry ? new Date(doc.expiry).toLocaleDateString('pl-PL') : ''
                  return (
                    <div key={doc.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background: doc.noExpiry ? '#34D399' : (c?.dot || 'var(--muted)'), flexShrink:0 }} />
                        <span style={{ fontSize:'0.85rem', color:'var(--muted)' }}>{doc.label}</span>
                      </div>
                      <span style={{ fontFamily:'var(--mono)', fontSize:'0.78rem', color: doc.noExpiry ? 'var(--success)' : (c?.color || 'var(--muted)') }}>
                        {doc.noExpiry ? '' : doc.days < 0
                          ? t('journal.expired_since', { days: Math.abs(doc.days) })
                          : doc.days <= 30
                            ? t('journal.expires_in', { days: doc.days })
                            : t('journal.valid_until', { date: fmt })}
                      </span>
                    </div>
                  )
                })}
                <Link to="/profile" style={{ color:'var(--accent2)', textDecoration:'none', fontSize:'0.78rem', marginTop:'0.25rem', display:'inline-block' }}>{t('journal.manage_docs')}</Link>
              </div>
            )}
          </div>
        )}

        <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.25rem 1.5rem', marginBottom:'1.5rem', borderTop:'2px solid rgba(108,99,255,0.5)' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:8 }}>
            {t('journal.total_jumps')}
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
            <div className={document.body.classList.contains('theme-pro') ? 'pro-glow' : ''} style={{ fontFamily:'var(--head)', fontSize:'3rem', fontWeight:900, letterSpacing:'-2px', lineHeight:1, color:'var(--text)' }}>
              {loading ? '—' : (jumps.length > 0 ? Math.max(...jumps.map(j => j.number || 0)) : 0)}
            </div>
            <div style={{ display:'flex', flexDirection:'row', gap:'0.5rem', alignItems:'center', flexShrink:0 }}>
              {jumps.length > 0 && (
                <button className="btn ghost small" onClick={repeatLastJump} disabled={repeating} title={t('journal.repeat_title')}>
                  {repeating ? '...' : t('journal.repeat_last')}
                </button>
              )}
              <Link to="/add" style={{ textDecoration:'none' }}>
                <button className="btn small">{t('journal.add_jump')}</button>
              </Link>
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily:'var(--head)', fontSize:'1.1rem', fontWeight:800, marginBottom:'1rem' }}>{t('journal.title')}</h2>

        {!loading && jumps.length > 0 && (
          <div style={{ marginBottom:'1rem', position:'relative' }}>
            <input
              className="input"
              placeholder={t('journal.search_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft:'1rem' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1rem', lineHeight:1 }}>✕</button>
            )}
          </div>
        )}

        {loading && <p style={{ color:'var(--muted)', textAlign:'center', padding:'3rem' }}>{t('journal.loading')}</p>}

        {!loading && jumps.length === 0 && (
          <div style={{ textAlign:'center', padding:'4rem 1rem', color:'var(--muted)' }}>
            <div style={{ fontSize:48, marginBottom:'0.75rem', opacity:0.3 }}></div>
            <p>{t('journal.no_jumps')}</p>
            <Link to="/add" style={{ color:'var(--accent2)', textDecoration:'none', fontWeight:500 }}>{t('journal.add_first')}</Link>
          </div>
        )}

        {!loading && jumps.length > 0 && (() => {
          const s = search.toLowerCase()
          const filtered = s ? jumps.filter(j =>
            String(j.number).includes(s) ||
            (j.city || '').toLowerCase().includes(s) ||
            (j.aircraft || '').toLowerCase().includes(s) ||
            (j.parachute || '').toLowerCase().includes(s) ||
            (j.jump_type || '').toLowerCase().includes(s) ||
            (j.notes || '').toLowerCase().includes(s) ||
            (j.result || '').toLowerCase().includes(s) ||
            (j.jump_date || '').includes(s)
          ) : jumps
          return filtered.length === 0
            ? <p style={{ textAlign:'center', color:'var(--muted)', padding:'2rem' }}>{t('journal.no_results', { search })}</p>
            : filtered.map(j => <JumpCard key={j.id} jump={j} onDelete={(id) => setConfirmDelete({ id, number: j.number })} />)
        })()}
      </div>
    </div>
  )
}