import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Profile() {
  const [profileBase, setProfileBase] = useState(null)
  const [preview, setPreview]         = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [equipment, setEquipment]     = useState([])
  const [dropzones, setDropzones]     = useState([])
  const [docs, setDocs]               = useState([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [newChute, setNewChute]       = useState('')
  const [newDz, setNewDz]             = useState('')
  const [msgs, setMsgs]               = useState({})
  const [saving, setSaving]           = useState({})
  const fileRef    = useRef()
  const docRef     = useRef()
  const navigate   = useNavigate()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: prof }, { data: eq }, { data: dz }, { data: docList }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('equipment').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('dropzones').select('*').eq('user_id', user.id).order('name'),
      supabase.storage.from('documents').list(user.id, { sortBy: { column: 'created_at', order: 'desc' } }),
    ])
    setProfileBase({ ...prof, email: user.email, uid: user.id })
    if (prof?.avatar_url) setPreview(prof.avatar_url + '?t=' + Date.now())
    setEquipment(eq || [])
    setDropzones(dz || [])
    setDocs(docList || [])
  }, [])

  useEffect(() => { load() }, [load])

  const showMsg = (key, text) => {
    setMsgs(m => ({ ...m, [key]: text }))
    setTimeout(() => setMsgs(m => ({ ...m, [key]: null })), 2500)
  }

  const pickAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file || !profileBase) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `${profileBase.uid}/avatar.${ext}`
      await supabase.storage.from('avatars').remove([path])
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type, cacheControl: '0' })
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', profileBase.uid)
        setPreview(data.publicUrl + '?t=' + Date.now())
        showMsg('avatar', 'Zdjęcie zaktualizowane!')
      }
    } catch (e) { showMsg('avatar', 'Błąd uploadu.') }
    setUploading(false)
  }

  const uploadDoc = async (e) => {
    const file = e.target.files[0]
    if (!file || !profileBase) return
    setUploadingDoc(true)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${profileBase.uid}/${Date.now()}_${safeName}`
    const { error } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type })
    if (!error) {
      showMsg('docs', 'Dokument dodany!')
      const { data: docList } = await supabase.storage.from('documents').list(profileBase.uid, { sortBy: { column: 'created_at', order: 'desc' } })
      setDocs(docList || [])
    } else {
      showMsg('docs', 'Błąd: ' + error.message)
    }
    setUploadingDoc(false)
    e.target.value = ''
  }

  const downloadDoc = async (name) => {
    const { data } = await supabase.storage.from('documents').createSignedUrl(`${profileBase.uid}/${name}`, 60)
    if (data?.signedUrl) {
      const a = document.createElement('a')
      a.href = data.signedUrl
      a.download = cleanName(name)
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const deleteDoc = async (name) => {
    await supabase.storage.from('documents').remove([`${profileBase.uid}/${name}`])
    setDocs(d => d.filter(x => x.name !== name))
  }

  const addChute = async () => {
    if (!newChute.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('equipment').insert({ user_id: user.id, name: newChute.trim(), type: 'main' }).select().single()
    if (data) setEquipment(eq => [...eq, data])
    setNewChute('')
  }

  const deleteChute = async (id) => {
    await supabase.from('equipment').delete().eq('id', id)
    setEquipment(eq => eq.filter(e => e.id !== id))
  }

  const addDropzone = async () => {
    if (!newDz.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('dropzones').insert({ user_id: user.id, name: newDz.trim() }).select().single()
    if (data) setDropzones(dz => [...dz, data].sort((a, b) => a.name.localeCompare(b.name)))
    setNewDz('')
  }

  const deleteDz = async (id) => {
    await supabase.from('dropzones').delete().eq('id', id)
    setDropzones(dz => dz.filter(d => d.id !== id))
  }

  const fileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase()
    if (['jpg','jpeg','png','webp','gif'].includes(ext)) return '🖼'
    if (ext === 'pdf') return '📄'
    return '📎'
  }

  const fmtSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024*1024) return `${(bytes/1024).toFixed(0)} KB`
    return `${(bytes/1024/1024).toFixed(1)} MB`
  }

  const cleanName = (name) => name.replace(/^\d+_/, '')

  if (!profileBase) return <div><Navbar /><p style={{ textAlign:'center', padding:'4rem', color:'var(--muted)' }}>Ładowanie...</p></div>

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth:520, margin:'0 auto', padding:'1.5rem 1rem' }}>

        {/* Avatar */}
        <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'2rem', textAlign:'center', marginBottom:'1rem' }}>
          <div onClick={() => !uploading && fileRef.current.click()} style={{ position:'relative', display:'inline-block', cursor: uploading ? 'wait' : 'pointer', marginBottom:'1rem' }}>
            <div style={{ width:90, height:90, borderRadius:'50%', background:'var(--accent)', border:'3px solid rgba(108,99,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:700, overflow:'hidden', margin:'0 auto', position:'relative' }}>
              {preview ? <img src={preview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : `${profileBase.name?.[0]||''}${profileBase.surname?.[0]||''}`}
              {uploading && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', color:'#fff' }}>...</div>}
            </div>
            <div style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background: uploading ? 'var(--muted)' : 'var(--accent)', border:'2px solid var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff' }}>{uploading ? '⏳' : '✏'}</div>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickAvatar} style={{ display:'none' }} />
          {msgs['avatar'] && <div style={{ fontSize:'0.82rem', color:'var(--success)', marginBottom:'0.5rem' }}>{msgs['avatar']}</div>}
          <div style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>{profileBase.name} {profileBase.surname}</div>
          {profileBase.city && <div style={{ color:'var(--muted)', fontSize:'0.82rem', marginTop:4 }}>📍 {profileBase.city}</div>}
          <div style={{ color:'var(--muted)', fontSize:'0.72rem', marginTop:6 }}>Kliknij zdjęcie aby zmienić</div>
        </div>

        {/* Dokumenty */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.25rem' }}>Dokumenty spadochronowe</h3>
          <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:'1.25rem' }}>Skany licencji, ubezpieczenia, badań lotniczych i innych dokumentów</p>

          {docs.length === 0 && (
            <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--muted)', fontSize:'0.85rem', background:'var(--bg3)', borderRadius:'var(--r)', marginBottom:'1rem' }}>
              Brak dokumentów — dodaj pierwszy poniżej
            </div>
          )}

          {docs.map(doc => (
            <div key={doc.name} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'var(--bg3)', borderRadius:'var(--r)', marginBottom:'0.5rem', border:'1px solid var(--border)' }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{fileIcon(doc.name)}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.88rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cleanName(doc.name)}</div>
                {doc.metadata?.size && <div style={{ fontSize:'0.72rem', color:'var(--muted)', fontFamily:'var(--mono)', marginTop:2 }}>{fmtSize(doc.metadata.size)}</div>}
              </div>
              <div style={{ display:'flex', gap:'0.4rem', flexShrink:0 }}>
                <button onClick={() => downloadDoc(doc.name)} style={{ background:'transparent', border:'1px solid var(--border2)', borderRadius:7, color:'var(--accent2)', cursor:'pointer', fontSize:'0.75rem', padding:'0.3rem 0.6rem', fontFamily:'var(--font)' }}>↓ Pobierz</button>
                <button onClick={() => deleteDoc(doc.name)} style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1rem', padding:'0.2rem 0.4rem', borderRadius:5 }}
                  onMouseEnter={e => e.target.style.color='var(--danger)'}
                  onMouseLeave={e => e.target.style.color='var(--muted)'}>✕</button>
              </div>
            </div>
          ))}

          {msgs['docs'] && <p style={{ color:'var(--success)', fontSize:'0.85rem', marginBottom:'0.5rem' }}>{msgs['docs']}</p>}

          <button
            onClick={() => docRef.current.click()}
            disabled={uploadingDoc}
            style={{ width:'100%', padding:'0.65rem', background:'var(--bg3)', border:'2px dashed var(--border2)', borderRadius:'var(--r)', color: uploadingDoc ? 'var(--muted)' : 'var(--accent2)', fontFamily:'var(--font)', fontSize:'0.88rem', fontWeight:500, cursor: uploadingDoc ? 'wait' : 'pointer', transition:'all 0.2s', marginTop:'0.5rem' }}
            onMouseEnter={e => { if (!uploadingDoc) e.currentTarget.style.borderColor='var(--accent)' }}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border2)'}
          >
            {uploadingDoc ? '⏳ Przesyłanie...' : '+ Dodaj dokument (PDF, JPG, PNG)'}
          </button>
          <input ref={docRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={uploadDoc} style={{ display:'none' }} />
        </div>

        <PersonalSection profileBase={profileBase} saving={saving} setSaving={setSaving} msgs={msgs} showMsg={showMsg} />
        <LicenseSection profileBase={profileBase} saving={saving} setSaving={setSaving} msgs={msgs} showMsg={showMsg} />
        <InsuranceSection profileBase={profileBase} saving={saving} setSaving={setSaving} msgs={msgs} showMsg={showMsg} />
        <MedicalSection profileBase={profileBase} saving={saving} setSaving={setSaving} msgs={msgs} showMsg={showMsg} />
        <ReserveSection profileBase={profileBase} saving={saving} setSaving={setSaving} msgs={msgs} showMsg={showMsg} />

        {/* Spadochron główny */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.25rem' }}>Spadochron główny</h3>
          <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:'1rem' }}>Lista dostępna przy dodawaniu skoku</p>
          {equipment.length === 0 && <div style={{ textAlign:'center', padding:'1rem', color:'var(--muted)', fontSize:'0.85rem', background:'var(--bg3)', borderRadius:'var(--r)', marginBottom:'1rem' }}>Brak sprzętu</div>}
          {equipment.map(eq => (
            <div key={eq.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.7rem 1rem', background:'var(--bg3)', borderRadius:'var(--r)', marginBottom:'0.5rem', border:'1px solid var(--border)' }}>
              <span style={{ fontSize:'0.9rem', fontWeight:500 }}>{eq.name}</span>
              <button onClick={() => deleteChute(eq.id)} style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1rem' }}
                onMouseEnter={e => e.target.style.color='var(--danger)'}
                onMouseLeave={e => e.target.style.color='var(--muted)'}>✕</button>
            </div>
          ))}
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
            <input className="input" placeholder="Nazwa np. Pilot 168" value={newChute} onChange={e => setNewChute(e.target.value)} onKeyDown={e => e.key==='Enter' && addChute()} style={{ flex:1 }} />
            <button onClick={addChute} disabled={!newChute.trim()} className="btn" style={{ width:'auto', padding:'0 1.25rem' }}>+ Dodaj</button>
          </div>
        </div>

        {/* Strefy zrzutu */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.25rem' }}>Strefy zrzutu</h3>
          <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:'1rem' }}>Lista dostępna przy dodawaniu skoku</p>
          {dropzones.length === 0 && <div style={{ textAlign:'center', padding:'1rem', color:'var(--muted)', fontSize:'0.85rem', background:'var(--bg3)', borderRadius:'var(--r)', marginBottom:'1rem' }}>Brak stref</div>}
          {dropzones.map(dz => (
            <div key={dz.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.7rem 1rem', background:'var(--bg3)', borderRadius:'var(--r)', marginBottom:'0.5rem', border:'1px solid var(--border)' }}>
              <span style={{ fontSize:'0.9rem', fontWeight:500 }}>📍 {dz.name}</span>
              <button onClick={() => deleteDz(dz.id)} style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1rem' }}
                onMouseEnter={e => e.target.style.color='var(--danger)'}
                onMouseLeave={e => e.target.style.color='var(--muted)'}>✕</button>
            </div>
          ))}
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
            <input className="input" placeholder="np. Dęblin, Piotrków..." value={newDz} onChange={e => setNewDz(e.target.value)} onKeyDown={e => e.key==='Enter' && addDropzone()} style={{ flex:1 }} />
            <button onClick={addDropzone} disabled={!newDz.trim()} className="btn" style={{ width:'auto', padding:'0 1.25rem' }}>+ Dodaj</button>
          </div>
        </div>

        {/* Eksport / Import */}
        <Link to="/edit-jumps" style={{ textDecoration:'none', display:'block', marginBottom:'0.75rem' }}>
          <button className="btn ghost" style={{ width:'100%' }}>✏ Edytuj skoki</button>
        </Link>
        <Link to="/export" style={{ textDecoration:'none', display:'block', marginBottom:'0.75rem' }}>
          <button className="btn ghost" style={{ width:'100%' }}>↓ Eksportuj skoki (PDF / Druk)</button>
        </Link>
        <Link to="/import" style={{ textDecoration:'none', display:'block', marginBottom:'0.75rem' }}>
          <button className="btn ghost" style={{ width:'100%' }}>↑ Importuj skoki z CSV</button>
        </Link>

        <button className="btn danger" onClick={async () => { await supabase.auth.signOut(); navigate('/login') }} style={{ marginBottom:'2rem' }}>
          Wyloguj się
        </button>

      </div>
    </div>
  )
}

function PersonalSection({ profileBase, saving, setSaving, msgs, showMsg }) {
  const [name, setName]       = useState(profileBase.name || '')
  const [surname, setSurname] = useState(profileBase.surname || '')
  const [city, setCity]       = useState(profileBase.city || '')
  const save = async (e) => {
    e.preventDefault()
    setSaving(s => ({ ...s, personal:true }))
    await supabase.from('profiles').update({ name, surname, city }).eq('id', profileBase.id)
    showMsg('personal', 'Zapisano!')
    setSaving(s => ({ ...s, personal:false }))
  }
  return (
    <div className="card" style={{ marginBottom:'1rem' }}>
      <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Dane osobowe</h3>
      <form onSubmit={save}>
        <div className="form-row">
          <div className="form-group"><label className="label">Imię</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Jan" /></div>
          <div className="form-group"><label className="label">Nazwisko</label><input className="input" value={surname} onChange={e => setSurname(e.target.value)} placeholder="Kowalski" /></div>
        </div>
        <div className="form-group"><label className="label">Miejscowość</label><input className="input" value={city} onChange={e => setCity(e.target.value)} placeholder="Warszawa" /></div>
        <div className="form-group"><label className="label">E-mail</label><input className="input" value={profileBase.email||''} disabled style={{ opacity:0.5, cursor:'not-allowed' }} readOnly /></div>
        {msgs['personal'] && <p style={{ color:'var(--success)', fontSize:'0.85rem', marginBottom:'0.5rem' }}>{msgs['personal']}</p>}
        <button className="btn" type="submit" disabled={saving['personal']}>{saving['personal'] ? 'Zapisywanie...' : 'Zapisz'}</button>
      </form>
    </div>
  )
}

function LicenseSection({ profileBase, saving, setSaving, msgs, showMsg }) {
  const [number, setNumber] = useState(profileBase.license_number || '')
  const [expiry, setExpiry] = useState(profileBase.license_expiry || '')
  const save = async (e) => {
    e.preventDefault()
    setSaving(s => ({ ...s, license:true }))
    await supabase.from('profiles').update({ license_number: number||null, license_expiry: expiry||null }).eq('id', profileBase.id)
    showMsg('license', 'Zapisano!')
    setSaving(s => ({ ...s, license:false }))
  }
  return (
    <div className="card" style={{ marginBottom:'1rem' }}>
      <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Licencja skoczka</h3>
      <form onSubmit={save}>
        <div className="form-row">
          <div className="form-group"><label className="label">Numer licencji</label><input className="input" value={number} onChange={e => setNumber(e.target.value)} placeholder="np. APA-1234" /></div>
          <div className="form-group"><label className="label">Data ważności</label><input className="input" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
        </div>
        {msgs['license'] && <p style={{ color:'var(--success)', fontSize:'0.85rem', marginBottom:'0.5rem' }}>{msgs['license']}</p>}
        <button className="btn" type="submit" disabled={saving['license']}>{saving['license'] ? 'Zapisywanie...' : 'Zapisz'}</button>
      </form>
    </div>
  )
}

function InsuranceSection({ profileBase, saving, setSaving, msgs, showMsg }) {
  const [company, setCompany] = useState(profileBase.insurance_company || '')
  const [number, setNumber]   = useState(profileBase.insurance_number || '')
  const [expiry, setExpiry]   = useState(profileBase.insurance_expiry || '')
  const save = async (e) => {
    e.preventDefault()
    setSaving(s => ({ ...s, insurance:true }))
    await supabase.from('profiles').update({ insurance_company: company||null, insurance_number: number||null, insurance_expiry: expiry||null }).eq('id', profileBase.id)
    showMsg('insurance', 'Zapisano!')
    setSaving(s => ({ ...s, insurance:false }))
  }
  return (
    <div className="card" style={{ marginBottom:'1rem' }}>
      <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Ubezpieczenie</h3>
      <form onSubmit={save}>
        <div className="form-group"><label className="label">Ubezpieczyciel</label><input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="np. PZU, Warta..." /></div>
        <div className="form-row">
          <div className="form-group"><label className="label">Numer polisy</label><input className="input" value={number} onChange={e => setNumber(e.target.value)} placeholder="np. 123456789" /></div>
          <div className="form-group"><label className="label">Data ważności</label><input className="input" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
        </div>
        {msgs['insurance'] && <p style={{ color:'var(--success)', fontSize:'0.85rem', marginBottom:'0.5rem' }}>{msgs['insurance']}</p>}
        <button className="btn" type="submit" disabled={saving['insurance']}>{saving['insurance'] ? 'Zapisywanie...' : 'Zapisz'}</button>
      </form>
    </div>
  )
}

function MedicalSection({ profileBase, saving, setSaving, msgs, showMsg }) {
  const [expiry, setExpiry] = useState(profileBase.medical_expiry || '')
  const save = async (e) => {
    e.preventDefault()
    setSaving(s => ({ ...s, medical:true }))
    await supabase.from('profiles').update({ medical_expiry: expiry||null }).eq('id', profileBase.id)
    showMsg('medical', 'Zapisano!')
    setSaving(s => ({ ...s, medical:false }))
  }
  return (
    <div className="card" style={{ marginBottom:'1rem' }}>
      <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Badania lotnicze</h3>
      <form onSubmit={save}>
        <div className="form-group"><label className="label">Data ważności badań</label><input className="input" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
        {msgs['medical'] && <p style={{ color:'var(--success)', fontSize:'0.85rem', marginBottom:'0.5rem' }}>{msgs['medical']}</p>}
        <button className="btn" type="submit" disabled={saving['medical']}>{saving['medical'] ? 'Zapisywanie...' : 'Zapisz'}</button>
      </form>
    </div>
  )
}

function ReserveSection({ profileBase, saving, setSaving, msgs, showMsg }) {
  const [name, setName]         = useState(profileBase.reserve_name || '')
  const [packDate, setPackDate] = useState(profileBase.reserve_pack_date || '')
  const [expiry, setExpiry]     = useState(profileBase.reserve_expiry || '')
  const days = expiry ? Math.ceil((new Date(expiry) - new Date()) / (1000*60*60*24)) : null
  const status = days !== null
    ? days < 0   ? { color:'var(--danger)', label:`Przeterminowany o ${Math.abs(days)} dni!` }
    : days <= 30 ? { color:'#FBBF24', label:`Wygasa za ${days} dni` }
    :              { color:'var(--success)', label:`Ważny jeszcze ${days} dni` }
    : null
  const save = async (e) => {
    e.preventDefault()
    setSaving(s => ({ ...s, reserve:true }))
    await supabase.from('profiles').update({ reserve_name: name||null, reserve_pack_date: packDate||null, reserve_expiry: expiry||null }).eq('id', profileBase.id)
    showMsg('reserve', 'Zapisano!')
    setSaving(s => ({ ...s, reserve:false }))
  }
  return (
    <div className="card" style={{ marginBottom:'1rem' }}>
      <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem' }}>Spadochron zapasowy</h3>
      <form onSubmit={save}>
        <div className="form-group"><label className="label">Nazwa</label><input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="np. Nano 160, Raven 181..." /></div>
        <div className="form-row">
          <div className="form-group"><label className="label">Data ułożenia</label><input className="input" type="date" value={packDate} onChange={e => setPackDate(e.target.value)} /></div>
          <div className="form-group"><label className="label">Data końca ważności</label><input className="input" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
        </div>
        {status && <div style={{ padding:'0.75rem 1rem', borderRadius:'var(--r)', marginBottom:'1rem', fontSize:'0.85rem', fontWeight:600, color:status.color, background:'rgba(255,255,255,0.04)', border:`1px solid ${status.color}` }}>{status.label}</div>}
        {msgs['reserve'] && <p style={{ color:'var(--success)', fontSize:'0.85rem', marginBottom:'0.5rem' }}>{msgs['reserve']}</p>}
        <button className="btn" type="submit" disabled={saving['reserve']}>{saving['reserve'] ? 'Zapisywanie...' : 'Zapisz'}</button>
      </form>
    </div>
  )
}
