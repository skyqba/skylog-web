import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import JumpCard from '../components/JumpCard'
import {
  getCachedJumps, setCachedJumps,
  getCachedProfile, setCachedProfile,
  getCachedRigs, setCachedRigs,
  getCachedQuals, setCachedQuals
} from '../localCache'

export default function Journal() {
  const [jumps, setJumps]         = useState([])
  const [profile, setProfile]     = useState(null)
  const [rigs, setRigs]           = useState([])
  const [quals, setQuals]         = useState(null)
  const [loading, setLoading]     = useState(true)
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!navigator.onLine) {
      setJumps(getCachedJumps())
      setProfile(getCachedProfile())
      setRigs(getCachedRigs())
      setQuals(getCachedQuals())
      setLoading(false)
      return
    }

    const [{ data: j }, { data: prof }, { data: rigList }, { data: q }] = await Promise.all([
      supabase.from('jumps').select('*').order('number', { ascending: false }),
      supabase.from('profiles').select('insurance_expiry,medical_expiry').eq('id', user.id).single(),
      supabase.from('rigs').select('id,name,reserve_expiry').eq('user_id', user.id),
      supabase.from('qualifications').select('*').eq('user_id', user.id).single(),
    ])

    setCachedJumps(j || [])
    setCachedProfile(prof)
    setCachedRigs(rigList || [])
    setCachedQuals(q || null)

    setJumps(j || [])
    setProfile(prof)
    setRigs(rigList || [])
    setQuals(q || null)
    setLoading(false)
  }

  const deleteJump = async (id) => {
    await supabase.from('jumps').delete().eq('id', id)
    setJumps(j => j.filter(x => x.id !== id))
    setCachedJumps(getCachedJumps().filter(x => x.id !== id))
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
      setJumps(j => [data, ...j])
      setCachedJumps([data, ...getCachedJumps()])
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
    profile?.insurance_expiry ? { label:'Ubezpieczenie',           expiry: profile.insurance_expiry,      days: daysUntil(profile.insurance_expiry) } : null,
    profile?.medical_expiry   ? { label:'Badania lotnicze',        expiry: profile.medical_expiry,        days: daysUntil(profile.medical_expiry) } : null,
    quals?.cert_expiry        ? { label:'Świadectwo kwalifikacji', expiry: quals.cert_expiry,             days: daysUntil(quals.cert_expiry) } : null,
    quals?.has_tandem && quals?.tandem_expiry         ? { label:'Uprawnienie Tandem', expiry: quals.tandem_expiry,  days: daysUntil(quals.tandem_expiry) } : null,
    quals?.has_ins && quals?.ins_sl && quals?.ins_sl_expiry   ? { label:'INS/SL',  expiry: quals.ins_sl_expiry,  days: daysUntil(quals.ins_sl_expiry) } : null,
    quals?.has_ins && quals?.ins_aff && quals?.ins_aff_expiry ? { label:'INS/AFF', expiry: quals.ins_aff_expiry, days: daysUntil(quals.ins_aff_expiry) } : null,
    quals?.has_ins && quals?.ins_t && quals?.ins_t_expiry     ? { label:'INS/T',   expiry: quals.ins_t_expiry,   days: daysUntil(quals.ins_t_expiry) } : null,
    (quals?.uspa_number || quals?.uspa_class) ? {
      label: `Licencja USPA${quals.uspa_class ? ` — klasa ${quals.uspa_class}` : ''}${quals.uspa_number ? ` (${quals.uspa_number})` : ''}`,
      expiry: null, days: null, noExpiry: true
    } : null,
    quals?.uspa_coach      ? { label:'USPA Coach',      expiry: null, days: null, noExpiry: true } : null,
    quals?.uspa_instructor ? { label:'USPA Instructor', expiry: null, days: null, noExpiry: true } : null,
    quals?.uspa_examiner   ? { label:'USPA Examiner',   expiry: null, days: null, noExpiry: true } : null,
    quals?.uspa_judge      ? { label:'USPA Judge',      expiry: null, days: null, noExpiry: true } : null,
    quals?.uspa_pro        ? { label:'USPA PRO Rating', expiry: null, days: null, noExpiry: true } : null,
    ...rigs.filter(r => r.reserve_expiry).map(r => ({
      label: `Zapas — ${r.name}`,
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
    profile?.insurance_expiry && alertOn('alert_insurance') ? { key:'insurance', label:'Ubezpieczenie',    days: daysUntil(profile.insurance_expiry), linkTo:'/profile' } : null,
    profile?.medical_expiry   && alertOn('alert_medical')   ? { key:'medical',   label:'Badania lotnicze', days: daysUntil(profile.medical_expiry),   linkTo:'/profile' } : null,
  ].filter(a => a !== null && a.days !== null && a.days <= 60 && !dismissedQuals.includes(a.key))
   .sort((a, b) => a.days - b.days)

  const qualAlerts = quals ? [
    quals.cert_expiry && alertOn('alert_cert')                                  ? { key:'cert',    label:'Świadectwo kwalifikacji', days: daysUntil(quals.cert_expiry) } : null,
    quals.has_tandem && quals.tandem_expiry && alertOn('alert_tandem')          ? { key:'tandem',  label:'Uprawnienie Tandem',      days: daysUntil(quals.tandem_expiry) } : null,
    quals.has_ins && quals.ins_sl  && quals.ins_sl_expiry  && alertOn('alert_ins') ? { key:'ins_sl',  label:'INS/SL',               days: daysUntil(quals.ins_sl_expiry) } : null,
    quals.has_ins && quals.ins_aff && quals.ins_aff_expiry && alertOn('alert_ins') ? { key:'ins_aff', label:'INS/AFF',              days: daysUntil(quals.ins_aff_expiry) } : null,
    quals.has_ins && quals.ins_t   && quals.ins_t_expiry   && alertOn('alert_ins') ? { key:'ins_t',   label:'INS/T',                days: daysUntil(quals.ins_t_expiry) } : null,
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
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'var(--head)', fontSize:'0.95rem', fontWeight:800, color, marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:'0.82rem', color, opacity:0.9 }}>{subtitle}</div>
      </div>
      <Link to={linkTo} style={{ textDecoration:'none', flexShrink:0 }}>
        <button style={{ background:'transparent', border:`1px solid ${color}`, borderRadius:8, padding:'0.4rem 0.9rem', color, fontFamily:'var(--font)', fontSize:'0.8rem', cursor:'pointer', whiteSpace:'nowrap' }}>Aktualizuj →</button>
      </Link>
      <button
        onClick={onDismiss}
        style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1.1rem', padding:'0.2rem 0.4rem', marginLeft:'0.25rem', flexShrink:0, lineHeight:1 }}
        onMouseEnter={e => e.currentTarget.style.color='var(--danger)'}
        onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}
        title="Zamknij alert"
      >✕</button>
    </div>
  )

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:680, margin:'0 auto', padding:'1.5rem 1rem' }}>

        {offline && (
          <div style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.4)', borderRadius:'var(--r)', padding:'0.65rem 0.9rem', color:'#FBBF24', fontSize:'0.82rem', marginBottom:'1rem', fontWeight:500 }}>
            ⚡ Tryb offline — wyświetlane dane z ostatniej synchronizacji
          </div>
        )}

        {confirmDelete && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.5rem', maxWidth:360, width:'100%' }}>
              <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.75rem' }}>Usunąć skok #{confirmDelete.number}?</div>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem' }}>Ta operacja jest nieodwracalna. Skok zostanie trwale usunięty z dziennika.</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button className="btn ghost" style={{ flex:1 }} onClick={() => setConfirmDelete(null)}>Anuluj</button>
                <button className="btn danger" style={{ flex:1 }} onClick={() => { deleteJump(confirmDelete.id); setConfirmDelete(null) }}>Usuń skok</button>
              </div>
            </div>
          </div>
        )}

        {confirmDismiss && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.5rem', maxWidth:360, width:'100%' }}>
              <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.75rem' }}>Zamknąć alert?</div>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem' }}>Alert zniknie do czasu wylogowania. Uprawnienie nadal będzie wymagać aktualizacji.</p>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button className="btn ghost" style={{ flex:1 }} onClick={() => setConfirmDismiss(null)}>Nie</button>
                <button className="btn danger" style={{ flex:1 }} onClick={confirmDismissYes}>Tak, zamknij</button>
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
              title={expired ? 'NIEAKTUALNE UŁOŻENIE ZAPASOWEGO!' : 'Zbliża się koniec ważności ułożenia zapasowego'}
              subtitle={`${rig.name} — ${expired ? `Nieważne od ${Math.abs(rig.days)} dni. Ważność: ${new Date(rig.reserve_expiry).toLocaleDateString('pl-PL')}` : `Koniec ważności: ${new Date(rig.reserve_expiry).toLocaleDateString('pl-PL')} · zostało ${rig.days} dni`}`}
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
              title={expired ? `${a.label} — WYGASŁO!` : `Zbliża się koniec ważności — ${a.label}`}
              subtitle={expired ? `Wygasło ${Math.abs(a.days)} dni temu` : `Zostało ${a.days} dni`}
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
              title={expired ? `${a.label} — WYGASŁO!` : `Zbliża się koniec ważności — ${a.label}`}
              subtitle={expired ? `Wygasło ${Math.abs(a.days)} dni temu` : `Zostało ${a.days} dni`}
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
                <span style={{ fontSize:'0.88rem', fontWeight:500 }}>Moje dokumenty</span>
                {urgentDocs.length > 0 && (
                  <span style={{ background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.4)', borderRadius:20, padding:'0.1rem 0.55rem', fontSize:'0.72rem', color:'#FBBF24', fontWeight:600 }}>
                    {urgentDocs.length} wymaga uwagi
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
                        {doc.noExpiry ? '' : doc.days < 0 ? `Nieważny od ${Math.abs(doc.days)} dni` : doc.days <= 30 ? `Wygasa za ${doc.days} dni` : `Ważny do ${fmt}`}
                      </span>
                    </div>
                  )
                })}
                <Link to="/profile" style={{ color:'var(--accent2)', textDecoration:'none', fontSize:'0.78rem', marginTop:'0.25rem', display:'inline-block' }}>Zarządzaj dokumentami →</Link>
              </div>
            )}
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.25rem 1.5rem', marginBottom:'1.5rem', borderTop:'2px solid rgba(108,99,255,0.5)' }}>
          <div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'0.65rem', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1.5px', marginBottom:4 }}>Łączna liczba skoków</div>
            <div style={{ fontFamily:'var(--head)', fontSize:'3rem', fontWeight:900, letterSpacing:'-2px', lineHeight:1, color:'var(--text)' }}>
              {loading ? '—' : (jumps.length > 0 ? Math.max(...jumps.map(j => j.number || 0)) : 0)}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'row', gap:'0.5rem', alignItems:'center' }}>
            {jumps.length > 0 && (
              <button className="btn ghost small" onClick={repeatLastJump} disabled={repeating} title="Dodaj skok z tymi samymi danymi co poprzedni">
                {repeating ? '...' : '⟳ Powtórz ostatni'}
              </button>
            )}
            <Link to="/add" style={{ textDecoration:'none' }}>
              <button className="btn small">+ Dodaj skok</button>
            </Link>
          </div>
        </div>

        <h2 style={{ fontFamily:'var(--head)', fontSize:'1.1rem', fontWeight:800, marginBottom:'1rem' }}>Dziennik skoków</h2>

        {!loading && jumps.length > 0 && (
          <div style={{ marginBottom:'1rem', position:'relative' }}>
            <input
              className="input"
              placeholder="🔍  Szukaj po numerze, dacie (2024-06), miejscowości, samolocie..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft:'1rem' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1rem', lineHeight:1 }}>✕</button>
            )}
          </div>
        )}

        {loading && <p style={{ color:'var(--muted)', textAlign:'center', padding:'3rem' }}>Ładowanie...</p>}
        {!loading && jumps.length === 0 && (
          <div style={{ textAlign:'center', padding:'4rem 1rem', color:'var(--muted)' }}>
            <div style={{ fontSize:48, marginBottom:'0.75rem', opacity:0.3 }}></div>
            <p>Brak skoków w dzienniku.</p>
            <Link to="/add" style={{ color:'var(--accent2)', textDecoration:'none', fontWeight:500 }}>Dodaj pierwszy skok →</Link>
          </div>
        )}
        {!loading && (() => {
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
            ? <p style={{ textAlign:'center', color:'var(--muted)', padding:'2rem' }}>Brak skoków pasujących do „{search}"</p>
            : filtered.map(j => <JumpCard key={j.id} jump={j} onDelete={(id) => setConfirmDelete({ id, number: j.number })} />)
        })()}
      </div>
    </div>
  )
}