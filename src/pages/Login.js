import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/')
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
              Jump<span style={{ color:'var(--accent2)' }}>Log</span>
            </span>
          </div>
          <div style={{ fontFamily:'var(--font)', fontSize:'0.65rem', color:'var(--muted)', marginBottom:'0.4rem' }}>
            by SkyQba ver 1.0
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'0.7rem', letterSpacing:'2px', color:'var(--muted)', textTransform:'uppercase' }}>
            Parachute Jump Logbook
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.2rem', fontWeight:800, marginBottom:'1.5rem' }}>
            {resetMode ? 'Reset Password' : 'Sign In'}
          </h2>

          {resetSent && (
            <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--success)' }}>
              Reset link sent! Check your email.
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
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : resetMode ? 'Send Reset Link' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem', alignItems:'center' }}>
            <button onClick={() => { setResetMode(!resetMode); setError(''); setResetSent(false) }}
              style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'0.82rem', cursor:'pointer', fontFamily:'var(--font)' }}>
              {resetMode ? '← Back to Sign In' : 'Forgot password?'}
            </button>
            <Link to="/register" style={{ color:'var(--accent2)', fontSize:'0.82rem', textDecoration:'none' }}>
              No account yet? Register →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
