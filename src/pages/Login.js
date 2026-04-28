import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedEmail    = localStorage.getItem('skyjumplog_email')
    const savedPassword = localStorage.getItem('skyjumplog_password')
    const savedRemember = localStorage.getItem('skyjumplog_remember')
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
        localStorage.setItem('skyjumplog_email', email)
        localStorage.setItem('skyjumplog_password', password)
        localStorage.setItem('skyjumplog_remember', 'true')
      } else {
        localStorage.removeItem('skyjumplog_email')
        localStorage.removeItem('skyjumplog_password')
        localStorage.removeItem('skyjumplog_remember')
      }
      navigate('/')
    }
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
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
              Sky Jump<span style={{ color:'var(--accent2)' }}>Log</span>
            </span>
          </div>
          <div style={{ fontFamily:'var(--font)', fontSize:'0.65rem', color:'var(--muted)', marginBottom:'0.4rem' }}>
            by SkyQba ver 1.0
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', letterSpacing:'2px', color:'var(--muted)', textTransform:'uppercase' }}>
            Dziennik skoków spadochronowych
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.2rem', fontWeight:800, marginBottom:'1.5rem' }}>
            {resetMode ? 'Resetowanie hasła' : 'Logowanie'}
          </h2>

          {resetSent && (
            <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--success)' }}>
              Link do resetowania hasła został wysłany! Sprawdź skrzynkę e-mail.
            </div>
          )}

          {error && (
            <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--danger)' }}>
              {error}
            </div>
          )}

          <form onSubmit={resetMode ? handleReset : handleLogin}>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            {!resetMode && (
              <div className="form-group">
                <label className="label">Password</label>
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
                  Zapamiętaj moje dane
                </label>
              </div>
            )}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Proszę czekać...' : resetMode ? 'Wyślij link resetujący' : 'Zaloguj się'}
            </button>
          </form>

          <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'center' }}>
            <button onClick={() => { setResetMode(!resetMode); setError(''); setResetSent(false) }}
              style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'0.82rem', cursor:'pointer', fontFamily:'var(--font)' }}>
              {resetMode ? '← Wróć do logowania' : 'Zapomniałeś hasła?'}
            </button>
            <Link to="/register" style={{ color:'var(--accent2)', fontSize:'0.82rem', textDecoration:'none' }}>
              Nie masz konta? Zarejestruj się →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}