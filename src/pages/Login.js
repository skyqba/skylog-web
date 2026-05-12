import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'

export default function Login() {
  if (!localStorage.getItem('jumplogx_theme')) {
    document.body.classList.add('theme-dark')
  }
  const { t } = useTranslation()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail    = localStorage.getItem('jumplogx_email')
    const savedPassword = localStorage.getItem('jumplogx_password')
    const savedRemember = localStorage.getItem('jumplogx_remember')
    if (savedRemember === 'true' && savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRemember(true)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      if (remember) {
        localStorage.setItem('jumplogx_email', email)
        localStorage.setItem('jumplogx_password', password)
        localStorage.setItem('jumplogx_remember', 'true')
      } else {
        localStorage.removeItem('jumplogx_email')
        localStorage.removeItem('jumplogx_password')
        localStorage.removeItem('jumplogx_remember')
      }
      navigate('/')
    }
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://skylog-web-dec7.vercel.app/reset-password',
    })
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:'2rem 1rem' }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ marginBottom:'0.25rem' }}>
            <span style={{ fontFamily:'var(--head)', fontSize:'2rem', fontWeight:900, color:'var(--text)' }}>
              <span style={{ color:'var(--accent2)' }}>Jump</span>Log<span style={{ color:'var(--accent2)' }}>X</span>
            </span>
          </div>
          <div style={{ fontFamily:'var(--font)', fontSize:'0.65rem', color:'var(--muted)', marginBottom:'0.4rem' }}>
            by SkyQba ver 1.0
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', letterSpacing:'2px', color:'var(--muted)', textTransform:'uppercase' }}>
            {t('login.tagline')}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.2rem', fontWeight:800, marginBottom:'1.5rem' }}>
            {resetMode ? t('login.reset_title') : t('login.title')}
          </h2>

          {resetSent && (
            <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--success)' }}>
              {t('login.reset_sent')}
            </div>
          )}

          {error && (
            <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={resetMode ? handleReset : handleLogin}>
            <div className="form-group">
              <label className="label">{t('login.email')}</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            {!resetMode && (
              <div className="form-group">
                <label className="label">{t('login.password')}</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            )}
            {!resetMode && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ width:15, height:15, accentColor:'var(--accent)', cursor:'pointer' }}
                />
                <label htmlFor="remember" style={{ fontSize:'0.82rem', color:'var(--muted)', cursor:'pointer', fontFamily:'var(--font)' }}>
                  {t('login.remember')}
                </label>
              </div>
            )}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? t('login.loading') : resetMode ? t('login.reset_send') : t('login.submit')}
            </button>
          </form>

          <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'center' }}>
            <button onClick={() => { setResetMode(!resetMode); setError(''); setResetSent(false) }}
              style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'0.82rem', cursor:'pointer', fontFamily:'var(--font)' }}>
              {resetMode ? t('login.back_to_login') : t('login.forgot')}
            </button>
            <Link to="/register" style={{ color:'var(--accent2)', fontSize:'0.82rem', textDecoration:'none' }}>
              {t('login.no_account')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}