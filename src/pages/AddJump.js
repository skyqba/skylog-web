import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'
import { dbGetJumps, dbAddJump, dbGetDropzones, dbGetRigs, dbGetAircraft } from '../db'
import { saveToQueue } from '../offlineQueue'
import { useProfile } from '../useProfile'

const JUMP_TYPES_PL = [
  { value: 'Tandem (T)',              label: 'Tandem (T)' },
  { value: 'AFF',                     label: 'AFF' },
  { value: 'Static Line (SL)',        label: 'Static Line (SL)' },
  { value: 'RW – płaski',             label: 'RW – płaski' },
  { value: 'FF (Freefly)',            label: 'FF (Freefly)' },
  { value: 'WS (Wingsuit)',           label: 'WS (Wingsuit)' },
  { value: 'CP (Swooping)',           label: 'CP (Swooping)' },
  { value: 'CF (Canopy Formation)',   label: 'CF (Canopy Formation)' },
  { value: 'ACC (Celność lądowania)', label: 'ACC (Celność lądowania)' },
  { value: 'B.A.S.E',                label: 'B.A.S.E' },
  { value: 'inny',                    label: 'Inny...' },
]

const JUMP_TYPES_EN = [
  { value: 'Tandem (T)',              label: 'Tandem (T)' },
  { value: 'AFF',                     label: 'AFF' },
  { value: 'Static Line (SL)',        label: 'Static Line (SL)' },
  { value: 'RW – Formation',         label: 'RW – Formation' },
  { value: 'FF (Freefly)',            label: 'FF (Freefly)' },
  { value: 'WS (Wingsuit)',           label: 'WS (Wingsuit)' },
  { value: 'CP (Swooping)',           label: 'CP (Swooping)' },
  { value: 'CF (Canopy Formation)',   label: 'CF (Canopy Formation)' },
  { value: 'ACC (Accuracy)',          label: 'ACC (Accuracy)' },
  { value: 'B.A.S.E',                label: 'B.A.S.E' },
  { value: 'inny',                    label: 'Other...' },
]

const DEFAULT_AIRCRAFT = [
  'Cessna 182', 'Cessna 206', 'Cessna 208 Caravan', 'Cessna 208B Grand Caravan',
  'Pilatus PC-6 Porter', 'Antonov An-2', 'Antonov An-28', 'AN-28 Bryza',
  'Let L-410 Turbolet', 'PAC 750 XL', 'de Havilland DHC-6 Twin Otter',
  'Beechcraft King Air', 'CASA C-295', 'Mi-8', 'Mi-2', 'AS350',
]

const WIND_DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
const getWindDir = (deg) => WIND_DIRS[Math.round(deg / 22.5) % 16]

const WMO_CODES = {
  0: 'Bezchmurnie ☀️', 1: 'Przeważnie słonecznie 🌤', 2: 'Częściowe zachmurzenie ⛅', 3: 'Zachmurzenie ☁️',
  45: 'Mgła 🌫', 48: 'Mgła z szronem 🌫',
  51: 'Lekka mżawka 🌦', 53: 'Mżawka 🌦', 55: 'Gęsta mżawka 🌧',
  61: 'Lekki deszcz 🌧', 63: 'Deszcz 🌧', 65: 'Ulewny deszcz 🌧',
  71: 'Lekki śnieg ❄️', 73: 'Śnieg ❄️', 75: 'Intensywny śnieg ❄️',
  80: 'Przelotny deszcz 🌦', 81: 'Deszcz przelotny 🌧', 82: 'Gwałtowny deszcz 🌧',
  95: 'Burza ⛈', 96: 'Burza z gradem ⛈', 99: 'Burza z silnym gradem ⛈',
}

export default function AddJump() {
  const { t, i18n } = useTranslation()
  const JUMP_TYPES = i18n.language?.startsWith('en') ? JUMP_TYPES_EN : JUMP_TYPES_PL

  const [form, setForm] = useState({
    number: '', jump_date: new Date().toISOString().split('T')[0],
    city: '', parachute: '', altitude: '', delay: '', aircraft: '', notes: '', result: '',
    jump_type: '', custom_type: '', weather: '',
  })
  const [mainChutes, setMainChutes]                   = useState([])
  const [dropzones, setDropzones]                     = useState([])
  const [userAircraft, setUserAircraft]               = useState([])
  const [error, setError]                             = useState('')
  const [loading, setLoading]                         = useState(false)
  const [aircraftSuggestions, setAircraftSuggestions] = useState([])
  const { canWeather, loading: profileLoading } = useProfile()
  const weatherEnabled = (() => { try { const s = JSON.parse(localStorage.getItem('alertSettings') || '{}'); return s['show_weather'] !== false } catch { return true } })()
  const [weatherLoading, setWeatherLoading]           = useState(false)
  const [weatherData, setWeatherData]                 = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      if (!navigator.onLine) {
        const [offlineJumps, offlineDz, offlineRigs, offlineAc] = await Promise.all([
          dbGetJumps(), dbGetDropzones(), dbGetRigs(), dbGetAircraft(),
        ])
        const uniqueChutes = [...new Set((offlineRigs || []).map(r => r.main).filter(Boolean))]
        setMainChutes(uniqueChutes)
        setDropzones(offlineDz || [])
        setUserAircraft(offlineAc || [])
        const nextNum = offlineJumps.length > 0 ? (Math.max(...offlineJumps.map(j => j.number || 0)) + 1) : 1
        setForm(f => ({ ...f, number: String(nextNum) }))
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: rigs }, { data: dz }, { data: lastJump }, { data: ac }] = await Promise.all([
        supabase.from('rigs').select('main').eq('user_id', user.id).not('main', 'is', null),
        supabase.from('dropzones').select('*').eq('user_id', user.id).order('name'),
        supabase.from('jumps').select('number').eq('user_id', user.id).order('number', { ascending: false }).limit(1),
        supabase.from('aircraft').select('*').eq('user_id', user.id).order('name'),
      ])
      const uniqueChutes = [...new Set((rigs || []).map(r => r.main).filter(Boolean))]
      setMainChutes(uniqueChutes)
      setDropzones(dz || [])
      setUserAircraft(ac || [])
      const nextNum = lastJump && lastJump.length > 0 ? (lastJump[0].number + 1) : 1
      setForm(f => ({ ...f, number: String(nextNum) }))
    }
    load()
    fetchWeather()
  }, [])

  const fetchWeather = () => {
    const settings = (() => { try { return JSON.parse(localStorage.getItem('alertSettings') || '{}') } catch { return {} } })()
    try { const s2 = JSON.parse(localStorage.getItem('alertSettings') || '{}'); if (s2['show_weather'] === false) return } catch {}
    if (!navigator.geolocation) return
    setWeatherLoading(true)
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,windspeed_10m,winddirection_10m,weathercode&timezone=auto&windspeed_unit=ms`
        const res = await fetch(url)
        const data = await res.json()
        const c = data.current
        const temp = Math.round(c.temperature_2m)
        const wind = Math.round(c.windspeed_10m * 10) / 10
        const dir = getWindDir(c.winddirection_10m)
        const desc = WMO_CODES[c.weathercode] || ''
        const weatherStr = `${temp}°C, Wiatr ${wind} m/s ${dir}${desc ? `, ${desc}` : ''}`
        setWeatherData({ temp, wind, dir, desc, weatherStr })
        setForm(f => ({ ...f, weather: weatherStr }))
      } catch (e) {
        console.error('Weather error:', e)
      }
      setWeatherLoading(false)
    }, () => setWeatherLoading(false), { timeout: 10000 })
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const allAircraftNames = [
    ...userAircraft.map(a => a.name),
    ...DEFAULT_AIRCRAFT.filter(d => !userAircraft.some(a => a.name === d))
  ]

  const handleAircraftChange = (e) => {
    const val = e.target.value
    setForm(f => ({ ...f, aircraft: val }))
    if (val.length > 0) {
      setAircraftSuggestions(allAircraftNames.filter(a => a.toLowerCase().includes(val.toLowerCase())))
    } else {
      setAircraftSuggestions([])
    }
  }

  const handleAircraftSelect = async (a) => {
    setForm(f => ({ ...f, aircraft: a }))
    setAircraftSuggestions([])
    if (!userAircraft.some(ua => ua.name === a)) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('aircraft').insert({ user_id: user.id, name: a }).select().single()
      if (data) setUserAircraft(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  const handleAircraftBlur = () => {
    setTimeout(() => setAircraftSuggestions([]), 150)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.number || !form.jump_date) { setError(t('add_jump.error_required')); return }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const finalType = form.jump_type === 'inny' ? form.custom_type.trim() : form.jump_type
    const jumpData = {
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
      weather:   form.weather || null,
    }
    if (!navigator.onLine) {
      const offlineJump = { ...jumpData, id: 'offline_' + Date.now(), user_id: user?.id || 'offline' }
      await dbAddJump(offlineJump)
      await saveToQueue({ type: 'INSERT_JUMP', payload: jumpData })
      setLoading(false)
      navigate('/')
      return
    }
    const { data: newJump, error } = await supabase.from('jumps').insert({ ...jumpData, user_id: user.id }).select().single()
    if (error) { setLoading(false); setError(error.message); return }
    if (newJump) await dbAddJump(newJump)
    setLoading(false)
    navigate('/')
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>
          {t('add_jump.title')}
        </h2>
        <div className="card">
          <form onSubmit={handleSave}>

            {/* Numer + Data */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div style={{ flex: '0 0 140px' }}>
                <label className="label">{t('add_jump.jump_number')}</label>
                <input className="input" type="number" placeholder="42" value={form.number} onChange={set('number')} />
              </div>
              <div style={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden' }}>
                <label className="label">{t('add_jump.jump_date')}</label>
                <input className="input" type="date" value={form.jump_date} onChange={set('jump_date')} required style={{ width: '100%', minWidth: 0 }} />
              </div>
            </div>

            {/* Rodzaj skoku */}
            <div className="form-group">
              <label className="label">{t('add_jump.jump_type')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', marginBottom: form.jump_type === 'inny' ? '0.5rem' : 0 }}>
                {JUMP_TYPES.map(jt => (
                  <button
                    key={jt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, jump_type: f.jump_type === jt.value ? '' : jt.value, custom_type: '' }))}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--r)',
                      border: `1px solid ${form.jump_type === jt.value ? 'var(--accent)' : 'var(--border)'}`,
                      background: form.jump_type === jt.value ? 'rgba(108,99,255,0.2)' : 'var(--bg3)',
                      color: form.jump_type === jt.value ? 'var(--accent2)' : 'var(--muted)',
                      fontFamily: 'var(--font)',
                      fontSize: '0.82rem',
                      fontWeight: form.jump_type === jt.value ? 600 : 400,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {jt.label}
                  </button>
                ))}
              </div>
              {form.jump_type === 'inny' && (
                <input
                  className="input"
                  placeholder={t('add_jump.jump_type_custom')}
                  value={form.custom_type}
                  onChange={e => setForm(f => ({ ...f, custom_type: e.target.value }))}
                  style={{ marginTop: '0.5rem' }}
                  autoFocus
                />
              )}
            </div>

            {/* Miejscowość */}
            <div className="form-group">
              <label className="label">{t('add_jump.city')}</label>
              {dropzones.length > 0 && (
                <select className="input" value={form.city} onChange={set('city')} style={{ marginBottom: '0.5rem' }}>
                  <option value="">{t('add_jump.city_select')}</option>
                  {dropzones.map(dz => <option key={dz.id} value={dz.name}>{dz.name}</option>)}
                </select>
              )}
              <input className="input" placeholder={t('add_jump.city_manual')} maxLength={150} value={form.city} onChange={set('city')} />
              {dropzones.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                  💡 {t('add_jump.city_hint')}
                </div>
              )}
            </div>

            {/* Spadochron */}
            <div className="form-group">
              <label className="label">{t('add_jump.parachute')}</label>
              {mainChutes.length > 0 && (
                <select className="input" value={form.parachute} onChange={set('parachute')} style={{ marginBottom: '0.5rem' }}>
                  <option value="">{t('add_jump.parachute_select')}</option>
                  {mainChutes.map(chute => <option key={chute} value={chute}>{chute}</option>)}
                </select>
              )}
              <input className="input" placeholder={t('add_jump.parachute_manual')} maxLength={150} value={form.parachute} onChange={set('parachute')} />
              {mainChutes.length === 0 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                  💡 {t('add_jump.parachute_hint')}
                </div>
              )}
            </div>

            {/* Wysokość + Opóźnienie */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem' }}>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <label className="label">{t('add_jump.altitude')}</label>
                <input className="input" type="number" placeholder="4000" value={form.altitude} onChange={set('altitude')} />
              </div>
              <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <label className="label">{t('add_jump.delay')}</label>
                <input className="input" type="number" placeholder="60" value={form.delay} onChange={set('delay')} />
              </div>
            </div>

            {/* Samolot */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="label">{t('add_jump.aircraft')}</label>
              <input
                className="input"
                placeholder={t('add_jump.aircraft_placeholder')}
                value={form.aircraft}
                maxLength={150}
                onChange={handleAircraftChange}
                onBlur={handleAircraftBlur}
                autoComplete="off"
              />
              {aircraftSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', overflow: 'hidden', marginTop: 2, maxHeight: 220, overflowY: 'auto' }}>
                  {aircraftSuggestions.map(a => (
                    <div
                      key={a}
                      onMouseDown={() => handleAircraftSelect(a)}
                      style={{ padding: '0.55rem 0.9rem', fontSize: '0.85rem', color: 'var(--text)', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {userAircraft.some(ua => ua.name === a) && <span style={{ fontSize: '0.65rem', color: 'var(--accent2)', fontWeight: 700 }}>★</span>}
                      {a}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                💡 Zarządzaj listą samolotów w Profilu.
              </div>
            </div>

            {/* Pogoda */}
            {canWeather && weatherEnabled && !profileLoading && <div className="form-group">
              <label className="label">🌤 Pogoda</label>
              {weatherLoading && (
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                  Pobieranie pogody...
                </div>
              )}
              {weatherData && !weatherLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.9rem', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 'var(--r)', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.5rem' }}>🌡</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{weatherData.temp}°C</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Wiatr {weatherData.wind} m/s {weatherData.dir} · {weatherData.desc}</div>
                  </div>
                  <button type="button" onClick={fetchWeather} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', fontSize: '0.72rem', padding: '0.25rem 0.6rem', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    ↻ Odśwież
                  </button>
                </div>
              )}
              <input
                className="input"
                placeholder="np. 22°C, Wiatr 4 m/s NW, Bezchmurnie"
                value={form.weather}
                maxLength={200}
                onChange={set('weather')}
              />
              {!weatherData && !weatherLoading && (
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.35rem' }}>
                  💡 Zezwól na dostęp do lokalizacji aby pobrać pogodę automatycznie.
                </div>
              )}
            </div>}

            {/* Wynik - tylko dla ACC */}
            {(form.jump_type === 'ACC (Celność lądowania)' || form.jump_type === 'ACC (Accuracy)') && (
              <div className="form-group">
                <label className="label">{t('add_jump.result')}</label>
                <input className="input" placeholder={t('add_jump.result_placeholder')} value={form.result} maxLength={150} onChange={set('result')} />
              </div>
            )}

            {/* Uwagi */}
            <div className="form-group">
              <label className="label">{t('add_jump.notes')}</label>
              <textarea className="input" placeholder={t('add_jump.notes_placeholder')} value={form.notes} maxLength={150} onChange={set('notes')} rows={3} style={{ resize: 'vertical', fontFamily: 'var(--font)' }} />
            </div>

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--r)', padding: '0.65rem 0.9rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn ghost" onClick={() => navigate('/')}>{t('add_jump.cancel')}</button>
              <button type="submit" className="btn" disabled={loading}>{loading ? t('add_jump.saving') : t('add_jump.save')}</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}