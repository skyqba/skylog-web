import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

export default function Profile() {
  const [profileBase, setProfileBase] = useState(null)
  const [preview, setPreview]         = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [dropzones, setDropzones]     = useState([])
  const [docs, setDocs]               = useState([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [newDz, setNewDz]             = useState('')
  const [msgs, setMsgs]               = useState({})
  const [saving, setSaving]           = useState({})
  const [rigs, setRigs]               = useState([])
  const [showAddRig, setShowAddRig]   = useState(false)
  const [editingRig, setEditingRig]   = useState(null)
  const [newRig, setNewRig]           = useState({ name:'', main:'', reserve:'', container:'', aad:'', reserve_expiry:'' })
  const [savingRig, setSavingRig]     = useState(false)
  const fileRef  = useRef()
  const docRef   = useRef()
  const navigate = useNavigate()

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const [{ data: prof }, { data: dz }, { data: docList }, { data: rigList }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('dropzones').select('*').eq('user_id', user.id).order('name'),
      supabase.storage.from('documents').list(user.id, { sortBy: { column: 'created_at', order: 'desc' } }),
      supabase.from('rigs').select('*').eq('user_id', user.id).order('created_at'),
    ])
    setProfileBase({ ...prof, email: user.email, uid: user.id })
    if (prof?.avatar_url) setPreview(prof.avatar_url + '?t=' + Date.now())
    setDropzones(dz || [])
    setDocs(docList || [])
    setRigs(rigList || [])
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
    const { data } = await supabase.storage.from('documents').createSignedUrl(`${profileBase.uid}/${name}`, 300)
    if (data?.signedUrl) window.location.href = data.signedUrl
  }

  const deleteDoc = async (name) => {
    await supabase.storage.from('documents').remove([`${profileBase.uid}/${name}`])
    setDocs(d => d.filter(x => x.name !== name))
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

  const saveRig = async () => {
    if (!newRig.name.trim()) return
    setSavingRig(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('rigs').insert({
      user_id: user.id,
      name: newRig.name.trim(),
      main: newRig.main.trim() || null,
      reserve: newRig.reserve.trim() || null,
      container: newRig.container.trim() || null,
      aad: newRig.aad.trim() || null,
      reserve_expiry: newRig.reserve_expiry || null,
    }).select().single()
    if (data) {
      setRigs(r => [...r, data])
      setNewRig({ name:'', main:'', reserve:'', container:'', aad:'', reserve_expiry:'' })
      setShowAddRig(false)
    }
    setSavingRig(false)
  }

  const updateRig = async () => {
    if (!editingRig) return
    setSavingRig(true)
    const { data } = await supabase.from('rigs').update({
      name: editingRig.name.trim(),
      main: editingRig.main?.trim() || null,
      reserve: editingRig.reserve?.trim() || null,
      container: editingRig.container?.trim() || null,
      aad: editingRig.aad?.trim() || null,
      reserve_expiry: editingRig.reserve_expiry || null,
    }).eq('id', editingRig.id).select().single()
    if (data) setRigs(r => r.map(x => x.id === data.id ? data : x))
    setEditingRig(null)
    setSavingRig(false)
  }

  const deleteRig = async (id) => {
    await supabase.from('rigs').delete().eq('id', id)
    setRigs(r => r.filter(x => x.id !== id))
  }

  const rigStatus = (expiry) => {
    if (!expiry) return null
    const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0)   return { color:'var(--danger)', label:`Zapas przeterminowany o ${Math.abs(days)} dni!` }
    if (days <= 30) return { color:'#FBBF24',       label:`Zapas wygasa za ${days} dni` }
    return              { color:'var(--success)',   label:`Zapas ważny jeszcze ${days} dni` }
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
        <InsuranceSection profileBase={profileBase} saving={saving} setSaving={setSaving} msgs={msgs} showMsg={showMsg} />
        <MedicalSection profileBase={profileBase} saving={saving} setSaving={setSaving} msgs={msgs} showMsg={showMsg} />

        {/* Moje uprawnienia */}
        <Link to="/qualifications" style={{ textDecoration:'none', display:'block', marginBottom:'1rem' }}>
          <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border2)'}
          >
            <div>
              <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.15rem' }}>Moje uprawnienia</div>
              <div style={{ fontSize:'0.82rem', color:'var(--muted)' }}>Świadectwo kwalifikacji, uprawnienia instruktorskie</div>
            </div>
            <span style={{ color:'var(--accent2)', fontSize:'1.2rem' }}>→</span>
          </div>
        </Link>

        {/* Moje komplety spadochronowe */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, marginBottom:'0.25rem' }}>Moje komplety spadochronowe</h3>
          <p style={{ color:'var(--muted)', fontSize:'0.82rem', marginBottom:'1rem' }}>Sprzęt na którym skaczesz — spadochron główny, zapasowy, pokrowiec i automat</p>

          {rigs.length === 0 && !showAddRig && (
            <div style={{ textAlign:'center', padding:'1.5rem', color:'var(--muted)', fontSize:'0.85rem', background:'var(--bg3)', borderRadius:'var(--r)', marginBottom:'1rem' }}>
              Brak sprzętu — dodaj pierwszy komplet poniżej
            </div>
          )}

          {rigs.map(rig => {
            const status = rigStatus(rig.reserve_expiry)
            const isEditing = editingRig?.id === rig.id
            return (
              <div key={rig.id} style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'1rem', marginBottom:'0.75rem', border:`1px solid ${isEditing ? 'var(--accent)' : 'var(--border)'}` }}>
                {isEditing ? (
                  <>
                    <div style={{ fontFamily:'var(--head)', fontSize:'0.9rem', fontWeight:800, marginBottom:'0.75rem', color:'var(--accent2)' }}>Edycja kompletu</div>
                    <div className="form-group">
                      <label className="label">Nazwa kompletu *</label>
                      <input className="input" value={editingRig.name} onChange={e => setEditingRig(r => ({ ...r, name: e.target.value }))} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                      <div className="form-group">
                        <label className="label">Spadochron główny</label>
                        <input className="input" placeholder="np. Pilot 168" value={editingRig.main || ''} onChange={e => setEditingRig(r => ({ ...r, main: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="label">Spadochron zapasowy</label>
                        <input className="input" placeholder="np. Nano 160" value={editingRig.reserve || ''} onChange={e => setEditingRig(r => ({ ...r, reserve: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="label">Pokrowiec</label>
                        <input className="input" placeholder="np. Javelin Odyssey" value={editingRig.container || ''} onChange={e => setEditingRig(r => ({ ...r, container: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="label">Automat (AAD)</label>
                        <input className="input" placeholder="np. Cypres 2" value={editingRig.aad || ''} onChange={e => setEditingRig(r => ({ ...r, aad: e.target.value }))} />
                      </div>
                      <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                        <label className="label">Koniec ważności spadochronu zapasowego</label>
                        <input className="input" type="date" value={editingRig.reserve_expiry || ''} onChange={e => setEditingRig(r => ({ ...r, reserve_expiry: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
                      <button className="btn ghost" style={{ flex:1 }} onClick={() => setEditingRig(null)}>Anuluj</button>
                      <button className="btn" style={{ flex:1 }} onClick={updateRig} disabled={savingRig || !editingRig.name.trim()}>{savingRig ? 'Zapisywanie...' : 'Zapisz zmiany'}</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                      <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, color:'var(--accent2)' }}>{rig.name}</div>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <button onClick={() => setEditingRig({ ...rig })}
                          style={{ background:'transparent', border:'1px solid var(--border2)', borderRadius:7, color:'var(--muted)', cursor:'pointer', fontSize:'0.75rem', padding:'0.3rem 0.6rem', fontFamily:'var(--font)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent2)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color='var(--muted)' }}
                        >✏ Edytuj</button>
                        <button onClick={() => deleteRig(rig.id)} style={{ background:'transparent', border:'none', color:'var(--muted)', cursor:'pointer', fontSize:'1rem' }}
                          onMouseEnter={e => e.target.style.color='var(--danger)'}
                          onMouseLeave={e => e.target.style.color='var(--muted)'}>✕</button>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', fontSize:'0.82rem' }}>
                      {rig.main && <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.5rem 0.75rem' }}><div style={{ color:'var(--muted)', fontSize:'0.65rem', fontFamily:'var(--mono)', letterSpacing:1, textTransform:'uppercase', marginBottom:2 }}>Główny</div><div style={{ fontWeight:600 }}>{rig.main}</div></div>}
                      {rig.reserve && <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.5rem 0.75rem' }}><div style={{ color:'var(--muted)', fontSize:'0.65rem', fontFamily:'var(--mono)', letterSpacing:1, textTransform:'uppercase', marginBottom:2 }}>Zapasowy</div><div style={{ fontWeight:600 }}>{rig.reserve}</div></div>}
                      {rig.container && <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.5rem 0.75rem' }}><div style={{ color:'var(--muted)', fontSize:'0.65rem', fontFamily:'var(--mono)', letterSpacing:1, textTransform:'uppercase', marginBottom:2 }}>Pokrowiec</div><div style={{ fontWeight:600 }}>{rig.container}</div></div>}
                      {rig.aad && <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.5rem 0.75rem' }}><div style={{ color:'var(--muted)', fontSize:'0.65rem', fontFamily:'var(--mono)', letterSpacing:1, textTransform:'uppercase', marginBottom:2 }}>Automat</div><div style={{ fontWeight:600 }}>{rig.aad}</div></div>}
                      {rig.reserve_expiry && <div style={{ background:'var(--bg2)', borderRadius:8, padding:'0.5rem 0.75rem', gridColumn:'1 / -1' }}><div style={{ color:'var(--muted)', fontSize:'0.65rem', fontFamily:'var(--mono)', letterSpacing:1, textTransform:'uppercase', marginBottom:2 }}>Koniec ważności zapasowego</div><div style={{ fontWeight:600 }}>{new Date(rig.reserve_expiry).toLocaleDateString('pl-PL')}</div></div>}
                    </div>
                    {status && <div style={{ marginTop:'0.75rem', padding:'0.6rem 0.9rem', borderRadius:'var(--r)', fontSize:'0.82rem', fontWeight:600, color:status.color, background:'rgba(255,255,255,0.04)', border:`1px solid ${status.color}` }}>{status.label}</div>}
                  </>
                )}
              </div>
            )
          })}

          {showAddRig && (
            <div style={{ background:'var(--bg3)', borderRadius:'var(--r)', padding:'1rem', marginBottom:'0.75rem', border:'1px solid var(--border2)' }}>
              <div style={{ fontFamily:'var(--head)', fontSize:'0.9rem', fontWeight:800, marginBottom:'0.75rem', color:'var(--accent2)' }}>Nowy komplet</div>
              <div className="form-group">
                <label className="label">Nazwa kompletu *</label>
                <input className="input" placeholder="np. Mój główny zestaw" value={newRig.name} onChange={e => setNewRig(r => ({ ...r, name: e.target.value }))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div className="form-group"><label className="label">Spadochron główny</label><input className="input" placeholder="np. Pilot 168" value={newRig.main} onChange={e => setNewRig(r => ({ ...r, main: e.target.value }))} /></div>
                <div className="form-group"><label className="label">Spadochron zapasowy</label><input className="input" placeholder="np. Nano 160" value={newRig.reserve} onChange={e => setNewRig(r => ({ ...r, reserve: e.target.value }))} /></div>
                <div className="form-group"><label className="label">Pokrowiec</label><input className="input" placeholder="np. Javelin Odyssey" value={newRig.container} onChange={e => setNewRig(r => ({ ...r, container: e.target.value }))} /></div>
                <div className="form-group"><label className="label">Automat (AAD)</label><input className="input" placeholder="np. Cypres 2" value={newRig.aad} onChange={e => setNewRig(r => ({ ...r, aad: e.target.value }))} /></div>
                <div className="form-group" style={{ gridColumn:'1 / -1' }}><label className="label">Koniec ważności spadochronu zapasowego</label><input className="input" type="date" value={newRig.reserve_expiry} onChange={e => setNewRig(r => ({ ...r, reserve_expiry: e.target.value }))} /></div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem' }}>
                <button className="btn ghost" style={{ flex:1 }} onClick={() => { setShowAddRig(false); setNewRig({ name:'', main:'', reserve:'', container:'', aad:'', reserve_expiry:'' }) }}>Anuluj</button>
                <button className="btn" style={{ flex:1 }} onClick={saveRig} disabled={savingRig || !newRig.name.trim()}>{savingRig ? 'Zapisywanie...' : 'Zapisz komplet'}</button>
              </div>
            </div>
          )}

          {!showAddRig && !editingRig && (
            <button onClick={() => setShowAddRig(true)}
              style={{ width:'100%', padding:'0.65rem', background:'var(--bg3)', border:'2px dashed var(--border2)', borderRadius:'var(--r)', color:'var(--accent2)', fontFamily:'var(--font)', fontSize:'0.88rem', fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor='var(--border2)'}
            >+ Dodaj komplet spadochronowy</button>
          )}
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

        <Link to="/stats" style={{ textDecoration:'none', display:'block', marginBottom:'0.75rem' }}>
          <button className="btn ghost" style={{ width:'100%' }}>📊 Statystyki skoków</button>
        </Link>
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