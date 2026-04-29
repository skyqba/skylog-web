import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function ResetPassword() {
  const [password, setPassword]   = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [ready, setReady]         = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Metoda 1: sprawdź czy sesja już istnieje (Supabase ustawił ją z hash)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
        return
      }
    })

    // Metoda 2: nasłuchuj na event PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków.'); return
    }
    if (password !== password2) {
      setError('Hasła nie są zgodne.'); return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 3000)
    }
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
            Dziennik skoków spadochronowych
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.2rem', fontWeight:800, marginBottom:'1.5rem' }}>
            Nowe hasło
          </h2>

          {success ? (
            <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', fontSize:'0.88rem', color:'var(--success)' }}>
              ✓ Hasło zostało zmienione! Za chwilę zostaniesz przekierowany do logowania...
            </div>
          ) : !ready ? (
            <div style={{ textAlign:'center', padding:'2rem 1rem' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:'0.75rem' }}>⏳</div>
              <div style={{ color:'var(--muted)', fontSize:'0.88rem', marginBottom:'1.5rem' }}>
                Weryfikacja linku resetującego...
              </div>
              {/* Przycisk awaryjny po 3 sekundach */}
              <button
                onClick={() => setReady(true)}
                style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.9rem', fontFamily:'var(--font)', fontSize:'0.82rem', cursor:'pointer' }}
              >
                Kliknij tutaj jeśli strona się nie załadowała
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.88rem', color:'var(--danger)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="label">Nowe hasło (min. 6 znaków)</label>
                  <input
                    className="input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Powtórz nowe hasło</label>
                  <input
                    className="input"
                    type="password"
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button className="btn" type="submit" disabled={loading}>
                  {loading ? 'Zapisywanie...' : 'Ustaw nowe hasło'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}