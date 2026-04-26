import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Register() {
  const [form, setForm] = useState({ name:'', surname:'', city:'', email:'', password:'', password2:'' })
  const [preview, setPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const pickAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.surname || !form.email || !form.password) {
      setError('Wypełnij wszystkie wymagane pola.'); return
    }
    if (form.password !== form.password2) {
      setError('Hasła nie są zgodne.'); return
    }
    if (form.password.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków.'); return
    }
    setLoading(true)

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
    })

    if (authErr) { setError(authErr.message); setLoading(false); return }

    const userId = data?.user?.id
    if (!userId) { setError('Błąd rejestracji — spróbuj ponownie.'); setLoading(false); return }

    await supabase.from('profiles').upsert({
      id: userId,
      name: form.name.trim(),
      surname: form.surname.trim(),
      city: form.city.trim(),
      avatar_url: null,
    })

    if (avatarFile) {
      try {
        const ext  = avatarFile.name.split('.').pop()
        const path = `${userId}/avatar.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', userId)
        }
      } catch (e) { console.log('Avatar skip:', e) }
    }

    setLoading(false)
    navigate('/')
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:'2rem 1rem' }}>
      <div style={{ width:'100%', maxWidth:460 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.5rem' }}>
            <span style={{ width:40, height:40, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🪂</span>
            <span style={{ fontFamily:'var(--head)', fontSize:'2rem', fontWeight:800, color:'var(--text)' }}>Sky<span style={{ color:'var(--accent2)' }}>Log</span></span>
          </div>
        </div>
        <div className="card">
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.2rem', marginBottom:'1.5rem', fontWeight:800 }}>Rejestracja</h2>
          <form onSubmit={handleRegister}>
            <div onClick={() => fileRef.current.click()} style={{ display:'flex', alignItems:'center', gap:'1rem', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'0.75rem 1rem', cursor:'pointer', marginBottom:'1rem' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', flexShrink:0, overflow:'hidden', background:'rgba(108,99,255,0.15)', border:'2px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {preview ? <img src={preview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '🪂'}
              </div>
              <div>
                <div style={{ color:'var(--accent2)', fontWeight:500, fontSize:'0.88rem' }}>Dodaj zdjęcie profilowe</div>
                <div style={{ color:'var(--muted)', fontSize:'0.78rem', marginTop:2 }}>JPG lub PNG · opcjonalne</div>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar} style={{ display:'none' }} />
            <div className="form-row">
              <div className="form-group"><label className="label">Imię *</label><input className="input" placeholder="Jan" value={form.name} onChange={set('name')} /></div>
              <div className="form-group"><label className="label">Nazwisko *</label><input className="input" placeholder="Kowalski" value={form.surname} onChange={set('surname')} /></div>
            </div>
            <div className="form-group"><label className="label">Miejscowość</label><input className="input" placeholder="Warszawa" value={form.city} onChange={set('city')} /></div>
            <div className="form-group"><label className="label">E-mail *</label><input className="input" type="email" placeholder="pilot@skylog.pl" value={form.email} onChange={set('email')} /></div>
            <div className="form-row">
              <div className="form-group"><label className="label">Hasło * (min. 6)</label><input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} /></div>
              <div className="form-group"><label className="label">Powtórz hasło *</label><input className="input" type="password" placeholder="••••••••" value={form.password2} onChange={set('password2')} /></div>
            </div>
            {error && <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.65rem 0.9rem', color:'var(--danger)', fontSize:'0.85rem', marginBottom:'0.75rem' }}>{error}</div>}
            <button className="btn" type="submit" disabled={loading} style={{ marginTop:'0.5rem' }}>{loading ? 'Tworzenie konta...' : 'Utwórz konto'}</button>
          </form>
          <p style={{ textAlign:'center', marginTop:'1.25rem', fontSize:'0.85rem', color:'var(--muted)' }}>
            Masz już konto?{' '}<Link to="/login" style={{ color:'var(--accent2)', textDecoration:'none', fontWeight:500 }}>Zaloguj się</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
