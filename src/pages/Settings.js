import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const ALERT_KEYS = [
  { key: 'alert_rigs',      label: 'Sprzet - ulozenie zapasowego',  icon: '🪂', desc: 'Alert gdy konczy sie waznosc ulozenia spadochronu zapasowego' },
  { key: 'alert_insurance', label: 'Ubezpieczenie',                 icon: '📋', desc: 'Alert gdy konczy sie waznosc ubezpieczenia' },
  { key: 'alert_medical',   label: 'Badania lotnicze',              icon: '🏥', desc: 'Alert gdy konczy sie waznosc badan lotniczych' },
  { key: 'alert_cert',      label: 'Swiadectwo kwalifikacji',       icon: '📜', desc: 'Alert dla swiadectwa kwalifikacji' },
  { key: 'alert_tandem',    label: 'Uprawnienie Tandem',            icon: '👥', desc: 'Alert dla uprawnienia tandem' },
  { key: 'alert_ins',       label: 'Uprawnienia INS (SL/AFF/T)',    icon: '🎓', desc: 'Alert dla uprawnien instruktorskich INS' },
  { key: 'alert_uspa',      label: 'Licencja i uprawnienia USPA',   icon: '🌐', desc: 'Alert dla licencji i uprawnien USPA' },
]

const DEFAULT_SETTINGS = Object.fromEntries(ALERT_KEYS.map(a => [a.key, true]))

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('alertSettings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch { return DEFAULT_SETTINGS }
  })
  const [saved, setSaved] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const toggle = (key) => {
    setSettings(s => ({ ...s, [key]: !s[key] }))
    setSaved(false)
  }

  const save = () => {
    localStorage.setItem('alertSettings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetAll = (value) => {
    const reset = Object.fromEntries(ALERT_KEYS.map(a => [a.key, value]))
    setSettings(reset)
    setSaved(false)
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) {
        setDeleteError('Błąd usuwania konta: ' + error.message)
        setDeleteLoading(false)
        return
      }
      await supabase.auth.signOut()
      localStorage.clear()
      navigate('/login')
    } catch (e) {
      setDeleteError('Wystąpił błąd. Spróbuj ponownie.')
      setDeleteLoading(false)
    }
  }

  const activeCount = Object.values(settings).filter(Boolean).length

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Modal potwierdzenia usunięcia konta */}
        {showDeleteConfirm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.5rem', maxWidth:380, width:'100%' }}>
              <div style={{ fontSize:'2rem', textAlign:'center', marginBottom:'0.75rem' }}>⚠️</div>
              <div style={{ fontFamily:'var(--head)', fontSize:'1.1rem', fontWeight:800, marginBottom:'0.75rem', textAlign:'center' }}>
                Usunąć konto?
              </div>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'0.5rem', textAlign:'center' }}>
                Ta operacja jest <strong style={{ color:'var(--danger)' }}>nieodwracalna</strong>.
              </p>
              <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem', textAlign:'center' }}>
                Wszystkie Twoje dane zostaną trwale usunięte — skoki, profil, dokumenty, uprawnienia.
              </p>
              {deleteError && (
                <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.65rem', color:'var(--danger)', fontSize:'0.82rem', marginBottom:'1rem' }}>
                  {deleteError}
                </div>
              )}
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button
                  className="btn ghost"
                  style={{ flex:1 }}
                  onClick={() => { setShowDeleteConfirm(false); setDeleteError('') }}
                  disabled={deleteLoading}
                >
                  Anuluj
                </button>
                <button
                  className="btn danger"
                  style={{ flex:1 }}
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Usuwanie...' : 'Tak, usuń konto'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', padding: '0.4rem 0.75rem', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.82rem' }}>Wróć</button>
          <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.3rem', fontWeight: 800 }}>Ustawienia</h2>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h3 style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800 }}>Powiadomienia i alerty</h3>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--muted)', background: 'var(--bg3)', borderRadius: 20, padding: '0.15rem 0.6rem', border: '1px solid var(--border)' }}>
              {activeCount} / {ALERT_KEYS.length}
            </span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Zarządzaj alertami widocznymi na stronie głównej dziennika
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button onClick={() => resetAll(true)} style={{ flex: 1, padding: '0.4rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--accent2)', fontFamily: 'var(--font)', fontSize: '0.78rem', cursor: 'pointer' }}>
              Włącz wszystkie
            </button>
            <button onClick={() => resetAll(false)} style={{ flex: 1, padding: '0.4rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontFamily: 'var(--font)', fontSize: '0.78rem', cursor: 'pointer' }}>
              Wyłącz wszystkie
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ALERT_KEYS.map(function(alert) {
              return (
                <div key={alert.key}
                  onClick={() => toggle(alert.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: settings[alert.key] ? 'rgba(108,99,255,0.06)' : 'var(--bg3)', border: '1px solid ' + (settings[alert.key] ? 'rgba(108,99,255,0.3)' : 'var(--border)'), borderRadius: 'var(--r)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{alert.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: settings[alert.key] ? 'var(--text)' : 'var(--muted)', marginBottom: 2 }}>{alert.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{alert.desc}</div>
                  </div>
                  <div style={{ flexShrink: 0, width: 42, height: 24, borderRadius: 12, background: settings[alert.key] ? 'var(--accent)' : 'var(--bg3)', border: '2px solid ' + (settings[alert.key] ? 'var(--accent)' : 'var(--border2)'), position: 'relative', transition: 'all 0.2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: settings[alert.key] ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: settings[alert.key] ? '#fff' : 'var(--muted)', transition: 'left 0.2s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Próg ostrzeżeń</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            Alerty pojawiają się gdy do wygaśnięcia pozostało mniej niż 60 dni.
          </p>
          <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '0.75rem 1rem', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--muted)' }}>
            Możliwość zmiany progu będzie dostępna w przyszłej wersji.
          </div>
        </div>

        <button onClick={save} className="btn" style={{ width: '100%', fontSize: '0.95rem', padding: '0.75rem', marginBottom: '1rem' }}>
          {saved ? 'Zapisano!' : 'Zapisz ustawienia'}
        </button>

        {/* Strefa niebezpieczna */}
        <div style={{ background:'rgba(248,113,113,0.05)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:'var(--r2)', padding:'1.25rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, color:'var(--danger)', marginBottom:'0.5rem' }}>
            Strefa niebezpieczna
          </h3>
          <p style={{ fontSize:'0.82rem', color:'var(--muted)', marginBottom:'1rem' }}>
            Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane — skoki, profil, dokumenty i uprawnienia — zostaną trwale usunięte.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background:'transparent', border:'1px solid var(--danger)', borderRadius:8, color:'var(--danger)', padding:'0.55rem 1.25rem', fontFamily:'var(--font)', fontSize:'0.88rem', cursor:'pointer', fontWeight:600, transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            🗑 Usuń konto
          </button>
        </div>

      </div>
    </div>
  )
}