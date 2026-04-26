import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetMsg, setResetMsg]   = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError('Błędny e-mail lub hasło.'); return }
    navigate('/')
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email) { setError('Wpisz swój adres e-mail powyżej.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setResetMsg(`Link do resetowania hasła został wysłany na adres ${email}. Sprawdź skrzynkę.`)
    setResetMode(false)
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:'2rem 1rem' }}>
      <div style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.5rem' }}>
            <span style={{ width:40, height:40, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}></span>
            <span style={{ fontFamily:'var(--head)', fontSize:'2rem', fontWeight:900, color:'var(--text)' }}>
              Sky<span style={{ color:'var(--accent2)' }}>Log</span>
            </span>
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', letterSpacing:'2px', color:'var(--muted)', textTransform:'uppercase' }}>
            Dziennik skoków spadochronowych
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.2rem', fontWeight:800, marginBottom:'1.5rem' }}>
            {resetMode ? 'Resetowanie hasła' : 'Logowanie'}
          </h2>

          {/* Komunikat po wysłaniu resetu */}
          {resetMsg && (
            <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--success)', lineHeight:1.5 }}>
              ✓ {resetMsg}
            </div>
          )}

          <form onSubmit={resetMode ? handleReset : handleLogin}>
            <div className="form-group">
              <label className="label">E-mail</label>
              <input
                className="input"
                type="email"
                placeholder="pilot@skylog.pl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {!resetMode && (
              <div className="form-group">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.35rem' }}>
                  <label className="label" style={{ margin:0 }}>Hasło</label>
                  <button
                    type="button"
                    onClick={() => { setResetMode(true); setError(''); setResetMsg('') }}
                    style={{ background:'none', border:'none', color:'var(--accent2)', fontSize:'0.75rem', cursor:'pointer', fontFamily:'var(--font)', padding:0 }}
                  >
                    Nie pamiętasz hasła?
                  </button>
                </div>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {resetMode && (
              <p style={{ fontSize:'0.82rem', color:'var(--muted)', marginBottom:'1rem', lineHeight:1.5 }}>
                Wpisz swój adres e-mail — wyślemy Ci link do ustawienia nowego hasła.
              </p>
            )}

            {error && (
              <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.65rem 0.9rem', color:'var(--danger)', fontSize:'0.85rem', marginBottom:'0.75rem' }}>
                {error}
              </div>
            )}

            <button className="btn" type="submit" disabled={loading} style={{ marginTop:'0.25rem' }}>
              {loading
                ? (resetMode ? 'Wysyłanie...' : 'Logowanie...')
                : (resetMode ? 'Wyślij link resetujący' : 'Zaloguj się')}
            </button>

            {resetMode && (
              <button
                type="button"
                className="btn ghost"
                onClick={() => { setResetMode(false); setError('') }}
                style={{ marginTop:'0.5rem' }}
              >
                ← Wróć do logowania
              </button>
            )}
          </form>

          {!resetMode && (
            <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.85rem', color:'var(--muted)' }}>
              Nie masz konta?{' '}
              <Link to="/register" style={{ color:'var(--accent2)', textDecoration:'none', fontWeight:500 }}>Zarejestruj się</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
