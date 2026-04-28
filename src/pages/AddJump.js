import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const JUMP_TYPES = [
  { value: 'Tandem (T)',            label: 'Tandem (T)' },
  { value: 'AFF',                   label: 'AFF' },
  { value: 'Static Line (SL)',      label: 'Static Line (SL)' },
  { value: 'RW – płaski',           label: 'RW – płaski' },
  { value: 'FF (Freefly)',          label: 'FF (Freefly)' },
  { value: 'WS (Wingsuit)',         label: 'WS (Wingsuit)' },
  { value: 'CP (Swooping)',         label: 'CP (Swooping)' },
  { value: 'CF (Canopy Formation)', label: 'CF (Canopy Formation)' },
  { value: 'ACC (Celność lądowania)', label: 'ACC (Celność lądowania)' },
  { value: 'B.A.S.E',              label: 'B.A.S.E' },
  { value: 'inny',                  label: 'Inny...' },
]

const AIRCRAFT_LIST = [
  'Cessna 182',
  'Cessna 206',
  'Cessna 208 Caravan',
  'Cessna 208B Grand Caravan',
  'Pilatus PC-6 Porter',
  'Antonov An-2',
  'Antonov An-28',
  'AN-28 Bryza',
  'Let L-410 Turbolet',
  'PAC 750 XL',
  'de Havilland DHC-6 Twin Otter',
  'Beechcraft King Air',
  'CASA C-295',
  'Mi-8',
  'Mi-2',
  'AS350',
]

export default function AddJump() {
  const [form, setForm] = useState({
    number: '', jump_date: new Date().toISOString().split('T')[0],
    city: '', parachute: '', altitude: '', delay: '', aircraft: '', notes: '', result: '',
    jump_type: '', custom_type: '',
  })
  const [mainChutes, setMainChutes]                   = useState([])
  const [dropzones, setDropzones]                     = useState([])
  const [error, setError]                             = useState('')
  const [loading, setLoading]                         = useState(false)
  const [aircraftSuggestions, setAircraftSuggestions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: rigs }, { data: dz }, { data: lastJump }] = await Promise.all([
        supabase.from('rigs').select('main').eq('user_id', user.id).not('main', 'is', null),
        supabase.from('dropzones').select('*').eq('user_id', user.id).order('name'),
        supabase.from('jumps').select('number').eq('user_id', user.id).order('number', { ascending: false }).limit(1),
      ])
      // Unikalne nazwy spadochronów głównych ze wszystkich kompletów
      const uniqueChutes = [...new Set((rigs || []).map(r => r.main).filter(Boolean))]
      setMainChutes(uniqueChutes)
      setDropzones(dz || [])
      const nextNum = lastJump && lastJump.length > 0 ? (lastJump[0].number + 1) : 1
      setForm(f => ({ ...f, number: String(nextNum) }))
    }
    load()
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAircraftChange = (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, aircraft: val }))
    if (val.length > 0) {
      setAircraftSuggestions(
        AIRCRAFT_LIST.filter(a => a.toLowerCase().includes(val.toLowerCase()))
      )
    } else {
      setAircraftSuggestions([])
    }
  }

  const handleAircraftSelect = (a) => {
    setForm(f => ({ ...f, aircraft: a }))
    setAircraftSuggestions([])
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.number || !form.jump_date) { setError('Numer i data są wymagane.'); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const finalType = form.jump_type === 'inny'
      ? form.custom_type.trim()
      : form.jump_type

    const { error } = await supabase.from('jumps').insert({
      user_id:   user.id,
      number:    parseInt(form.number),
      jump_date: form.jump_date,
      city:      form.city,
      parachute: form.parachute,
      altitude:  form.altitude  ? parseInt(form.altitude)  : null,
      delay:     form.delay     ? parseInt(form.delay)     : null,
      aircraft:  form.aircraft,
      notes:     form.notes,
      result:    form.result || null,
      jump_type: finalType || null,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/')
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Nowy skok</h2>

        <div className="card">
          <form onSubmit={handleSave}>

            {/* Numer + Data */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div style={{ flex: '0 0 140px' }}>
                <label className="label">Numer skoku *</label>
                <input
                  className="input"
                  type="number"
                  placeholder="42"
                  value={form.number}
                  onChange={set('number')}
                />
              </div>
              <div style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
                <label className="label">Data skoku *</label>
                <input
                  className="input"
                  type="date"
                  value={form.jump_date}
                  onChange={set('jump_date')}
                  required
                  style={{ width: '100%', minWidth: 0 }}
                />
              </div>
            </div>

            {/* Rodzaj skoku */}
            <div className="form-group">
              <label className="label">Rodzaj skoku</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: form.jump_type === 'inny' ? '0.5rem' : 0 }}>
                {JUMP_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, jump_type: f.jump_type === t.value ? '' : t.value, custom_type: '' }))}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--r)',
                      border: `1px solid ${form.jump_type === t.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.jump_type === t.value ? 'rgba(108,99,255,0.2)' : 'var(--bg3)',
                      color: form.jump_type === t.value ? 'var(--accent2)' : 'var(--muted)',
                      fontFamily: 'var(--font)',
                      fontSize: '0.82rem',
                      fontWeight: form.jump_type === t.value ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {form.jump_type === 'inny' && (
                <input
                  className="input"
                  placeholder="Wpisz rodzaj skoku..."
                  value={form.custom_type}
                  onChange={e => setForm(f => ({ ...f, custom_type: e.target.value }))}
                  style={{ marginTop: '0.5rem' }}
                  autoFocus
                />
              )}
            </div>

            {/* Miejscowość */}
            <div className="form-group">
              <label className="label">Miejscowość / Strefa zrzutu</label>
              {dropzones.length > 0 && (
                <select className="input" value={form.city} onChange={set('city')} style={{ marginBottom: '0.5rem' }}>
                  <option value="">— wybierz strefę zrzutu —</option>
                  {dropzones.map(dz => <option key={dz.id} value={dz.name}>{dz.name}</option>)}
                </select>
              )}
              <input className="input" placeholder="lub wpisz ręcznie..." maxLength={150} value={form.city} onChange={set('city')} />
              {dropzones.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                  💡 Dodaj strefy zrzutu w <span style={{ color: 'var(--accent2)' }}>Profilu</span>
                </div>
              )}
            </div>

            {/* Spadochron główny */}
            <div className="form-group">
              <label className="label">Spadochron główny</label>
              {mainChutes.length > 0 && (
                <select className="input" value={form.parachute} onChange={set('parachute')} style={{ marginBottom: '0.5rem' }}>
                  <option value="">— wybierz z kompletów —</option>
                  {mainChutes.map(chute => <option key={chute} value={chute}>{chute}</option>)}
                </select>
              )}
              <input className="input" placeholder="lub wpisz ręcznie..." maxLength={150} value={form.parachute} onChange={set('parachute')} />
              {mainChutes.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                  💡 Dodaj komplety spadochronowe w <span style={{ color: 'var(--accent2)' }}>Profilu</span>
                </div>
              )}
            </div>

            {/* Wysokość + Opóźnienie */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <label className="label">Wysokość (m)</label>
                <input className="input" type="number" placeholder="4000" value={form.altitude} onChange={set('altitude')} />
              </div>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <label className="label">Opóźnienie (s)</label>
                <input className="input" type="number" placeholder="60" value={form.delay} onChange={set('delay')} />
              </div>
            </div>

            {/* Samolot */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="label">Samolot</label>
              <input
                className="input"
                placeholder="np. Cessna 182..."
                value={form.aircraft}
                maxLength={150}
                onChange={handleAircraftChange}
                onBlur={() => setTimeout(() => setAircraftSuggestions([]), 150)}
                autoComplete="off"
              />
              {aircraftSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                  background: 'var(--bg2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r)', overflow: 'hidden', marginTop: 2,
                }}>
                  {aircraftSuggestions.map(a => (
                    <div
                      key={a}
                      onMouseDown={() => handleAircraftSelect(a)}
                      style={{
                        padding: '0.55rem 0.9rem', fontSize: '0.85rem', color: 'var(--text)',
                        cursor: 'pointer', borderBottom: '1px solid var(--border)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {a}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Wynik */}
            <div className="form-group">
              <label className="label">Wynik</label>
              <input className="input" placeholder="np. 0.05, 1 miejsce, zaliczony..." value={form.result} maxLength={150} onChange={set('result')} />
            </div>

            {/* Uwagi */}
            <div className="form-group">
              <label className="label">Uwagi</label>
              <textarea className="input" placeholder="Dodatkowe uwagi..." value={form.notes} maxLength={150} onChange={set('notes')} rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} />
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--r)', padding: '0.65rem 0.9rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn ghost" onClick={() => navigate('/')}>Anuluj</button>
              <button type="submit" className="btn" disabled={loading}>{loading ? 'Zapisywanie...' : 'Zapisz skok'}</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}