import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const JUMP_TYPES = [
  'Tandem (T)', 'AFF', 'Static Line (SL)', 'RW – płaski',
  'FF (Freefly)', 'WS (Wingsuit)', 'CP (Swooping)',
  'CF (Canopy Formation)', 'ACC (Celność lądowania)', 'B.A.S.E', 'Inny'
]

export default function EditJumps() {
  const { t } = useTranslation()
  const [jumps, setJumps]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [editId, setEditId]       = useState(null)
  const [editForm, setEditForm]   = useState({})
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(new Set())
  const [equipment, setEquipment] = useState([])
  const [dropzones, setDropzones] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: j }, { data: eq }, { data: dz }] = await Promise.all([
        supabase.from('jumps').select('*').eq('user_id', user.id).order('number', { ascending: false }),
        supabase.from('equipment').select('*').eq('user_id', user.id),
        supabase.from('dropzones').select('*').eq('user_id', user.id).order('name'),
      ])
      setJumps(j || [])
      setEquipment(eq || [])
      setDropzones(dz || [])
      setLoading(false)
    }
    load()
  }, [])

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length && filtered.length > 0) setSelected(new Set())
    else setSelected(new Set(filtered.map(j => j.id)))
  }

  const deleteSelected = async () => {
    if (selected.size === 0) return
    if (!window.confirm(t('edit_jumps.confirm_delete', { count: selected.size }))) return
    setDeleting(true)
    const ids = Array.from(selected)
    const { error } = await supabase.from('jumps').delete().in('id', ids)
    if (!error) {
      setJumps(j => j.filter(x => !selected.has(x.id)))
      setSelected(new Set())
    }
    setDeleting(false)
  }

  const startEdit = (jump) => {
    setEditId(jump.id)
    setEditForm({
      number:    jump.number || '',
      jump_date: jump.jump_date || '',
      city:      jump.city || '',
      parachute: jump.parachute || '',
      altitude:  jump.altitude || '',
      delay:     jump.delay || '',
      aircraft:  jump.aircraft || '',
      jump_type: jump.jump_type || '',
      notes:     jump.notes || '',
      result:    jump.result || '',
    })
  }

  const cancelEdit = () => { setEditId(null); setEditForm({}) }

  const saveEdit = async () => {
    setSaving(true)
    const { error } = await supabase.from('jumps').update({
      number:    parseInt(editForm.number) || null,
      jump_date: editForm.jump_date || null,
      city:      editForm.city.trim() || null,
      parachute: editForm.parachute.trim() || null,
      altitude:  parseInt(editForm.altitude) || null,
      delay:     parseInt(editForm.delay) || null,
      aircraft:  editForm.aircraft.trim() || null,
      jump_type: editForm.jump_type.trim() || null,
      notes:     editForm.notes.trim() || null,
      result:    editForm.result.trim() || null,
    }).eq('id', editId)
    if (!error) {
      setJumps(j => j.map(x => x.id === editId ? { ...x, ...editForm, number: parseInt(editForm.number), altitude: parseInt(editForm.altitude), delay: parseInt(editForm.delay) } : x))
      setEditId(null)
    }
    setSaving(false)
  }

  const set = (k) => (e) => setEditForm(f => ({ ...f, [k]: e.target.value }))

  const fmt = (d) => {
    if (!d) return '—'
    const [y, m, day] = d.split('-')
    return `${day}.${m}.${y}`
  }

  const filtered = jumps.filter(j => {
    if (!search) return true
    const s = search.toLowerCase()
    return String(j.number).includes(s) || (j.city||'').toLowerCase().includes(s) || (j.aircraft||'').toLowerCase().includes(s) || (j.parachute||'').toLowerCase().includes(s)
  })

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1.5rem 1rem' }}>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
          <button onClick={() => navigate('/profile')} style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', padding:'0.4rem 0.75rem', cursor:'pointer', fontFamily:'var(--font)', fontSize:'0.82rem' }}>
            {t('edit_jumps.back')}
          </button>
          <h2 style={{ fontFamily:'var(--head)', fontSize:'1.3rem', fontWeight:800 }}>{t('edit_jumps.title')}</h2>
        </div>

        <div className="form-group" style={{ marginBottom:'1rem' }}>
          <input
            className="input"
            placeholder={t('edit_jumps.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {!loading && filtered.length > 0 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r)', padding:'0.65rem 1rem', marginBottom:'1rem' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.88rem', fontWeight:500 }}>
              <input
                type="checkbox"
                checked={selected.size === filtered.length && filtered.length > 0}
                onChange={toggleAll}
                style={{ width:15, height:15, accentColor:'var(--accent)', cursor:'pointer' }}
              />
              {t('edit_jumps.select_all')}
              {selected.size > 0 && (
                <span style={{ fontFamily:'var(--mono)', fontSize:'0.72rem', color:'var(--muted)' }}>
                  {t('edit_jumps.selected', { count: selected.size })}
                </span>
              )}
            </label>
            {selected.size > 0 && (
              <button
                onClick={deleteSelected}
                disabled={deleting}
                style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.4)', borderRadius:7, color:'var(--danger)', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, padding:'0.35rem 0.85rem', fontFamily:'var(--font)' }}
              >
                {deleting ? t('edit_jumps.deleting') : t('edit_jumps.delete_selected', { count: selected.size })}
              </button>
            )}
          </div>
        )}

        {loading && <p style={{ color:'var(--muted)', textAlign:'center', padding:'3rem' }}>{t('edit_jumps.loading')}</p>}

        {!loading && filtered.length === 0 && (
          <p style={{ color:'var(--muted)', textAlign:'center', padding:'2rem' }}>{t('edit_jumps.no_results')}</p>
        )}

        {filtered.map(jump => (
          <div key={jump.id} style={{ background:'var(--bg2)', border:`1px solid ${editId === jump.id ? 'var(--accent)' : 'var(--border2)'}`, borderRadius:'var(--r2)', marginBottom:'0.75rem', overflow:'hidden', transition:'border 0.2s' }}>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.85rem 1.1rem', cursor: editId === jump.id ? 'default' : 'pointer' }}
              onClick={() => editId !== jump.id && startEdit(jump)}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <input
                  type="checkbox"
                  checked={selected.has(jump.id)}
                  onChange={() => toggleSelect(jump.id)}
                  onClick={e => e.stopPropagation()}
                  style={{ width:15, height:15, accentColor:'var(--accent)', cursor:'pointer', flexShrink:0 }}
                />
                <div style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, color:'var(--accent2)', minWidth:50 }}>#{jump.number}</div>
                <div>
                  <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{fmt(jump.jump_date)}{jump.city ? ` · ${jump.city}` : ''}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:2, fontFamily:'var(--mono)' }}>
                    {[jump.parachute, jump.aircraft, jump.jump_type].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                {editId === jump.id ? (
                  <span style={{ fontSize:'0.78rem', color:'var(--accent2)', fontWeight:600 }}>✏ {t('edit_jumps.editing')}</span>
                ) : (
                  <button onClick={e => { e.stopPropagation(); startEdit(jump) }}
                    style={{ background:'transparent', border:'1px solid var(--border2)', borderRadius:7, color:'var(--muted)', cursor:'pointer', fontSize:'0.78rem', padding:'0.3rem 0.7rem', fontFamily:'var(--font)', transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent2)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border2)'; e.currentTarget.style.color='var(--muted)' }}>
                    ✏ {t('edit_jumps.edit_btn')}
                  </button>
                )}
              </div>
            </div>

            {editId === jump.id && (
              <div style={{ borderTop:'1px solid var(--border)', padding:'1.1rem', background:'var(--bg3)' }}>
                <div className="form-row" style={{ marginBottom:'0.75rem' }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="label">{t('edit_jumps.jump_number')}</label>
                    <input className="input" type="number" value={editForm.number} onChange={set('number')} />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="label">{t('edit_jumps.jump_date')}</label>
                    <input className="input" type="date" value={editForm.jump_date} onChange={set('jump_date')} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom:'0.75rem' }}>
                  <label className="label">{t('edit_jumps.city')}</label>
                  {dropzones.length > 0 && (
                    <select className="input" value={editForm.city} onChange={set('city')} style={{ marginBottom:'0.4rem' }}>
                      <option value="">{t('edit_jumps.city_select')}</option>
                      {dropzones.map(dz => <option key={dz.id} value={dz.name}>{dz.name}</option>)}
                    </select>
                  )}
                  <input className="input" placeholder={t('edit_jumps.city_manual')} value={editForm.city} onChange={set('city')} />
                </div>

                <div className="form-group" style={{ marginBottom:'0.75rem' }}>
                  <label className="label">{t('edit_jumps.parachute')}</label>
                  {equipment.length > 0 && (
                    <select className="input" value={editForm.parachute} onChange={set('parachute')} style={{ marginBottom:'0.4rem' }}>
                      <option value="">{t('edit_jumps.parachute_select')}</option>
                      {equipment.map(eq => <option key={eq.id} value={eq.name}>{eq.name}</option>)}
                    </select>
                  )}
                  <input className="input" placeholder={t('edit_jumps.parachute_manual')} value={editForm.parachute} onChange={set('parachute')} />
                </div>

                <div className="form-group" style={{ marginBottom:'0.75rem' }}>
                  <label className="label">{t('edit_jumps.jump_type')}</label>
                  <select className="input" value={editForm.jump_type} onChange={set('jump_type')}>
                    <option value="">{t('edit_jumps.jump_type_select')}</option>
                    {JUMP_TYPES.map(jt => <option key={jt} value={jt}>{jt}</option>)}
                  </select>
                </div>

                <div className="form-row" style={{ marginBottom:'0.75rem' }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="label">{t('edit_jumps.altitude')}</label>
                    <input className="input" type="number" value={editForm.altitude} onChange={set('altitude')} placeholder="4000" />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label className="label">{t('edit_jumps.delay')}</label>
                    <input className="input" type="number" value={editForm.delay} onChange={set('delay')} placeholder="60" />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom:'0.75rem' }}>
                  <label className="label">{t('edit_jumps.aircraft')}</label>
                  <input className="input" value={editForm.aircraft} onChange={set('aircraft')} placeholder="np. Cessna 182" />
                </div>

                <div className="form-group" style={{ marginBottom:'0.75rem' }}>
                  <label className="label">{t('edit_jumps.result')}</label>
                  <input className="input" value={editForm.result} onChange={set('result')} placeholder={t('edit_jumps.result_placeholder')} />
                </div>

                <div className="form-group" style={{ marginBottom:'0.75rem' }}>
                  <label className="label">{t('edit_jumps.notes')}</label>
                  <textarea className="input" value={editForm.notes} onChange={set('notes')} rows={2} style={{ resize:'vertical', fontFamily:'var(--font)' }} placeholder={t('edit_jumps.notes_placeholder')} />
                </div>

                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <button onClick={cancelEdit} className="btn ghost" style={{ flex:1 }}>{t('edit_jumps.cancel')}</button>
                  <button onClick={saveEdit} disabled={saving} className="btn" style={{ flex:1 }}>
                    {saving ? t('edit_jumps.saving') : t('edit_jumps.save')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}