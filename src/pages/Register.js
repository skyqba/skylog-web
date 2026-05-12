import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'

export default function Register() {
  if (!localStorage.getItem('jumplogx_theme')) {
    document.body.classList.add('theme-dark')
  }
  const { t } = useTranslation()
  const [form, setForm] = useState({ email:'', password:'', password2:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError(t('register.error_required')); return
    }
    if (form.password !== form.password2) {
      setError(t('register.error_passwords')); return
    }
    if (form.password.length < 6) {
      setError(t('register.error_password_length')); return
    }
    if (!acceptTerms) {
      setError('Musisz zaakceptować Regulamin aby się zarejestrować.')
      return
    }
    setLoading(true)

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    })

    if (authErr) { setError(authErr.message); setLoading(false); return }

    const userId = data?.user?.id
    if (!userId) { setError(t('register.error_generic')); setLoading(false); return }

    await supabase.from('profiles').upsert({
      id: userId,
      name: '',
      surname: '',
      avatar_url: null,
    })

    setLoading(false)
    navigate('/')
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:'2rem 1rem' }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ marginBottom:'0.25rem' }}>
            <span style={{ fontFamily:'var(--head)', fontSize:'2rem', fontWeight:900 }}>
              <span style={{ color:'#A78BFA' }}>Jump</span><span style={{ color:'#F1F5F9' }}>Log</span><span style={{ color:'#A78BFA' }}>X</span>
            </span>
          </div>
          <div style={{ fontFamily:'var(--font)', fontSize:'0.65rem', color:'var(--muted)' }}>by SkyQba ver 1.0</div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:800 }}>{t('register.title')}</h2>
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="label">{t('register.email')}</label>
              <input className="input" type="email" placeholder="twoj@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="label">{t('register.password')}</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
            </div>
            <div className="form-group">
              <label className="label">{t('register.password2')}</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password2} onChange={set('password2')} required />
            </div>

            {error && (
              <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.65rem 0.9rem', color:'var(--danger)', fontSize:'0.85rem', marginBottom:'0.75rem' }}>
                {error}
              </div>
            )}

            {/* Regulamin */}
            <div onClick={() => setAcceptTerms(a => !a)}
              style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'0.85rem 1rem', background: acceptTerms ? 'rgba(139,92,246,0.06)' : 'var(--bg3)', border:`1px solid ${acceptTerms ? 'rgba(139,92,246,0.35)' : 'var(--border)'}`, borderRadius:'var(--r)', cursor:'pointer', marginBottom:'0.75rem', marginTop:'0.5rem', transition:'all 0.2s' }}>
              <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${acceptTerms ? '#8B5CF6' : 'var(--border2)'}`, background: acceptTerms ? '#8B5CF6' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, transition:'all 0.2s' }}>
                {acceptTerms && <span style={{ color:'#fff', fontSize:11, fontWeight:700, lineHeight:1 }}>✓</span>}
              </div>
              <p style={{ fontSize:'0.82rem', color:'var(--muted)', margin:0, lineHeight:1.5 }}>
                Przeczytałem i akceptuję{' '}
                <Link to="/terms" onClick={e => e.stopPropagation()} style={{ color:'#A78BFA', textDecoration:'none', fontWeight:600 }}>
                  Regulamin aplikacji JumpLogX
                </Link>
                . Rozumiem, że powinienem regularnie tworzyć kopie zapasowe swoich skoków oraz prowadzić papierową książeczkę skoków.
              </p>
            </div>

            <button className="btn" type="submit" disabled={loading || !acceptTerms} style={{ marginTop:'0.25rem', opacity: acceptTerms ? 1 : 0.5 }}>
              {loading ? t('register.loading') : t('register.submit')}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.85rem', color:'var(--muted)' }}>
            {t('register.have_account')}{' '}
            <Link to="/login" style={{ color:'#A78BFA', textDecoration:'none', fontWeight:500 }}>{t('register.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
