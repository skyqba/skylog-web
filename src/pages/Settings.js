import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Navbar from '../components/Navbar'

const ALERT_KEYS = [
  { key: 'alert_rigs',      label: 'Sprzet - ulozenie zapasowego',  icon: '🪂', desc: 'Alert gdy konczy sie waznosc ulozenia spadochronu zapasowego' },
  { key: 'alert_insurance', label: 'Ubezpieczenie',                 icon: '📋', desc: 'Alert gdy konczy sie waznosc ubezpieczenia' },
  { key: 'alert_medical',   label: 'Badania lotnicze',              icon: '🏥', desc: 'Alert gdy konczy sie waznosc badan lotniczych' },
  { key: 'alert_cert',      label: 'Swiadectwo kwalifikacji',       icon: '📜', desc: 'Alert dla swiadectwa kwalifikacji' },
  { key: 'alert_tandem',    label: 'Uprawnienie Tandem',            icon: '👥', desc: 'Alert dla uprawnienia tandem' },
  { key: 'alert_ins',       label: 'Uprawnienia INS (SL/AFF/T)',    icon: '🎓', desc: 'Alert dla uprawnien instruktorskich INS' },
  { key: 'alert_uspa',      label: 'Licencja i uprawnienia USPA',   icon: '🌐', desc: 'Alert dla licencji i uprawnien USPA' },
]

const DEFAULT_SETTINGS = Object.fromEntries(ALERT_KEYS.map(a => [a.key, true]))

const pl = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
}

const fmt = (d) => {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${day}.${m}.${y}`
}

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('alertSettings')
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch { return DEFAULT_SETTINGS }
  })
  const [saved, setSaved] = useState(false)
  const [deleteStep, setDeleteStep] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [backupFormat, setBackupFormat] = useState('csv')
  const [backupLoading, setBackupLoading] = useState(false)
  const [backupSent, setBackupSent] = useState(false)

  const toggle = (key) => {
    setSettings(s => ({ ...s, [key]: !s[key] }))
    setSaved(false)
  }

  const save = () => {
    localStorage.setItem('alertSettings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetAll = (value) => {
    const reset = Object.fromEntries(ALERT_KEYS.map(a => [a.key, value]))
    setSettings(reset)
    setSaved(false)
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const { error } = await supabase.rpc('delete_user')
      if (error) {
        setDeleteError('Błąd usuwania konta: ' + error.message)
        setDeleteLoading(false)
        return
      }
      await supabase.auth.signOut()
      localStorage.clear()
      navigate('/login')
    } catch (e) {
      setDeleteError('Wystąpił błąd. Spróbuj ponownie.')
      setDeleteLoading(false)
    }
  }

  const fetchJumps = async (userId) => {
    const { data } = await supabase
      .from('jumps')
      .select('*')
      .eq('user_id', userId)
      .order('number', { ascending: false })
    return data || []
  }

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('name,surname')
      .eq('id', userId)
      .single()
    return data
  }

  const downloadCSV = (jumps, profile) => {
    const name = profile ? `${profile.name || ''} ${profile.surname || ''}`.trim() : ''
    const today = new Date().toLocaleDateString('pl-PL')
    const metaRows = [
      `"Kopia zapasowa JumpLogX"`,
      `"Skoczek:","${name}"`,
      `"Data eksportu:","${today}"`,
      `"Liczba skoków:","${jumps.length}"`,
      `""`,
    ]
    const headers = ['Lp.', 'Nr skoku', 'Data', 'Miejscowosc', 'Spadochron', 'Wysokosc (m)', 'Opoznienie (s)', 'Samolot', 'Typ skoku', 'Wynik', 'Uwagi']
    const rows = jumps.map((j, i) => [
      i + 1, j.number, j.jump_date || '',
      j.city || '', j.parachute || '',
      j.altitude || '', j.delay || '',
      j.aircraft || '', j.jump_type || '',
      j.result || '', j.notes || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const csv = [...metaRows, headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `JumpLogX_kopia_zapasowa_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = async (jumps, profile) => {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const name = profile ? pl(`${profile.name || ''} ${profile.surname || ''}`.trim()) : ''
    const today = new Date().toLocaleDateString('pl-PL')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('JumpLogX — Kopia zapasowa', 14, 16)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    let y = 24
    if (name) { doc.text(pl(`Skoczek: ${name}`), 14, y); y += 6 }
    doc.text(pl(`Data eksportu: ${today}`), 14, y); y += 6
    doc.text(pl(`Liczba skokow: ${jumps.length}`), 14, y); y += 6

    autoTable(doc, {
      startY: y + 4,
      head: [['Lp.', 'Nr skoku', 'Data', 'Miejscowosc', 'Spadochron', 'Wys. (m)', 'Opoz. (s)', 'Samolot', 'Typ skoku', 'Wynik', 'Uwagi']],
      body: jumps.map((j, i) => [
        i + 1, j.number, fmt(j.jump_date),
        pl(j.city) || '', pl(j.parachute) || '',
        j.altitude || '', j.delay || '',
        pl(j.aircraft) || '', pl(j.jump_type) || '',
        pl(j.result) || '', pl(j.notes) || '',
      ]),
      styles: { fontSize: 7, cellPadding: 2, font: 'helvetica' },
      headStyles: { fillColor: [108, 99, 255], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 245, 250] },
      columnStyles: {
        0: { cellWidth: 8 }, 1: { cellWidth: 14 }, 2: { cellWidth: 20 },
        3: { cellWidth: 30 }, 4: { cellWidth: 25 }, 5: { cellWidth: 16 },
        6: { cellWidth: 16 }, 7: { cellWidth: 25 }, 8: { cellWidth: 22 },
        9: { cellWidth: 18 }, 10: { cellWidth: 'auto' },
      },
      didDrawPage: (data) => {
        doc.setFontSize(7)
        doc.setTextColor(150)
        doc.text(`Strona ${data.pageNumber} | JumpLogX — Kopia zapasowa`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 6, { align: 'center' })
        doc.setTextColor(0)
      }
    })
    doc.save(`JumpLogX_kopia_zapasowa_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  const sendEmail = async (jumps, profile, userEmail) => {
    // Pobierz oba pliki
    downloadCSV(jumps, profile)
    await downloadPDF(jumps, profile)

    // Otwórz klienta email z gotową wiadomością
    const name = profile ? `${profile.name || ''} ${profile.surname || ''}`.trim() : ''
    const today = new Date().toLocaleDateString('pl-PL')
    const fileDate = new Date().toISOString().split('T')[0]
    const subject = encodeURIComponent(`JumpLogX — Kopia zapasowa dziennika skoków (${today})`)
    const body = encodeURIComponent(
      `Kopia zapasowa dziennika skoków JumpLogX\n` +
      `Skoczek: ${name}\n` +
      `Data: ${today}\n` +
      `Liczba skoków: ${jumps.length}\n\n` +
      `Pliki zostały automatycznie pobrane na Twoje urządzenie:\n` +
      `• JumpLogX_kopia_zapasowa_${fileDate}.csv\n` +
      `• JumpLogX_kopia_zapasowa_${fileDate}.pdf\n\n` +
      `Załącz je do tej wiadomości przed wysłaniem.`
    )
    setTimeout(() => {
      window.location.href = `mailto:${userEmail}?subject=${subject}&body=${body}`
    }, 2000)
  }

  const handleBackup = async () => {
    setBackupLoading(true)
    setDeleteError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const [jumps, profile] = await Promise.all([fetchJumps(user.id), fetchProfile(user.id)])

      if (jumps.length === 0) {
        setDeleteError('Brak skoków do eksportu.')
        setBackupLoading(false)
        return
      }

      if (backupFormat === 'csv') {
        downloadCSV(jumps, profile)
      } else if (backupFormat === 'pdf') {
        await downloadPDF(jumps, profile)
      } else if (backupFormat === 'email') {
        await sendEmail(jumps, profile, user.email)
      }

      setBackupSent(true)
      setBackupLoading(false)
      setDeleteStep('final')
    } catch (e) {
      setBackupLoading(false)
      setDeleteError('Błąd podczas tworzenia kopii: ' + e.message)
    }
  }

  const closeModal = () => {
    setDeleteStep(null)
    setDeleteError('')
    setBackupSent(false)
    setBackupLoading(false)
  }

  const activeCount = Object.values(settings).filter(Boolean).length

  const formatOptions = [
    { key: 'csv',   icon: '📊', label: 'Pobierz CSV',   desc: 'Plik .csv do Excela lub Numbers' },
    { key: 'pdf',   icon: '📄', label: 'Pobierz PDF',   desc: 'Gotowy dokument do druku lub archiwum' },
    { key: 'email', icon: '📧', label: 'Wyślij e-mail', desc: 'Pobiera CSV i PDF, następnie otwiera klienta email' },
  ]

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* ===== MODAL ===== */}
        {deleteStep && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
            <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', padding:'1.75rem', maxWidth:420, width:'100%' }}>

              {/* KROK 1 */}
              {deleteStep === 'confirm' && (
                <>
                  <div style={{ fontSize:'2rem', textAlign:'center', marginBottom:'0.75rem' }}>⚠️</div>
                  <div style={{ fontFamily:'var(--head)', fontSize:'1.15rem', fontWeight:800, marginBottom:'0.75rem', textAlign:'center' }}>Usunąć konto?</div>
                  <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem', textAlign:'center', lineHeight:1.6 }}>
                    Usunięcie konta jest <strong style={{ color:'var(--danger)' }}>nieodwracalne</strong>. Wszystkie Twoje dane — skoki, profil, dokumenty i uprawnienia — zostaną trwale usunięte.<br /><br />
                    Zalecamy zrobienie kopii zapasowej. Możesz to zrobić w następnym kroku.
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <button className="btn" onClick={() => setDeleteStep('backup')} style={{ width:'100%', padding:'0.75rem' }}>
                      📦 Utwórz kopię zapasową przed usunięciem
                    </button>
                    <button onClick={() => setDeleteStep('final')} style={{ width:'100%', padding:'0.65rem', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontFamily:'var(--font)', fontSize:'0.85rem', cursor:'pointer' }}>
                      Usuń bez kopii zapasowej
                    </button>
                    <button onClick={closeModal} style={{ width:'100%', padding:'0.5rem', background:'transparent', border:'none', color:'var(--muted)', fontFamily:'var(--font)', fontSize:'0.82rem', cursor:'pointer' }}>
                      Anuluj
                    </button>
                  </div>
                </>
              )}

              {/* KROK 2 */}
              {deleteStep === 'backup' && (
                <>
                  <div style={{ fontSize:'2rem', textAlign:'center', marginBottom:'0.75rem' }}>📦</div>
                  <div style={{ fontFamily:'var(--head)', fontSize:'1.1rem', fontWeight:800, marginBottom:'0.5rem', textAlign:'center' }}>
                    Zanim odejdziesz, zabezpiecz swoje dane
                  </div>
                  <p style={{ fontSize:'0.82rem', color:'var(--muted)', marginBottom:'1rem', textAlign:'center' }}>
                    Dziennik skoków posortowany od najnowszych. Wybierz format:
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1.25rem' }}>
                    {formatOptions.map(opt => (
                      <div
                        key={opt.key}
                        onClick={() => setBackupFormat(opt.key)}
                        style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background: backupFormat === opt.key ? 'rgba(108,99,255,0.08)' : 'var(--bg3)', border:`1px solid ${backupFormat === opt.key ? 'rgba(108,99,255,0.35)' : 'var(--border)'}`, borderRadius:'var(--r)', cursor:'pointer', transition:'all 0.15s' }}
                      >
                        <span style={{ fontSize:20 }}>{opt.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'0.88rem', fontWeight:600, color: backupFormat === opt.key ? 'var(--text)' : 'var(--muted)' }}>{opt.label}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--muted)' }}>{opt.desc}</div>
                        </div>
                        <div style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${backupFormat === opt.key ? 'var(--accent)' : 'var(--border2)'}`, background: backupFormat === opt.key ? 'var(--accent)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {backupFormat === opt.key && <div style={{ width:8, height:8, borderRadius:'50%', background:'#fff' }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                  {deleteError && (
                    <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.65rem', color:'var(--danger)', fontSize:'0.82rem', marginBottom:'1rem' }}>
                      {deleteError}
                    </div>
                  )}
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <button className="btn" onClick={handleBackup} disabled={backupLoading} style={{ width:'100%', padding:'0.75rem' }}>
                      {backupLoading ? '⏳ Przygotowywanie...' : `${formatOptions.find(f => f.key === backupFormat)?.icon} ${formatOptions.find(f => f.key === backupFormat)?.label} i przejdź dalej`}
                    </button>
                    <button onClick={() => setDeleteStep('final')} style={{ width:'100%', padding:'0.65rem', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontFamily:'var(--font)', fontSize:'0.85rem', cursor:'pointer' }}>
                      Kontynuuj usuwanie bez kopii
                    </button>
                    <button onClick={closeModal} style={{ width:'100%', padding:'0.5rem', background:'transparent', border:'none', color:'var(--muted)', fontFamily:'var(--font)', fontSize:'0.82rem', cursor:'pointer' }}>
                      Anuluj
                    </button>
                  </div>
                </>
              )}

              {/* KROK 3 */}
              {deleteStep === 'final' && (
                <>
                  <div style={{ fontSize:'2rem', textAlign:'center', marginBottom:'0.75rem' }}>🗑</div>
                  <div style={{ fontFamily:'var(--head)', fontSize:'1.1rem', fontWeight:800, marginBottom:'0.75rem', textAlign:'center' }}>Ostatnia szansa</div>
                  {backupSent && (
                    <div style={{ background:'rgba(52,211,153,0.1)', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'var(--r)', padding:'0.65rem', color:'var(--success)', fontSize:'0.82rem', marginBottom:'1rem', textAlign:'center' }}>
                      ✓ Kopia zapasowa została {backupFormat === 'email' ? 'pobrana — załącz pliki do emaila' : 'pobrana'}
                    </div>
                  )}
                  <p style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:'1.25rem', textAlign:'center', lineHeight:1.6 }}>
                    Czy na pewno chcesz trwale usunąć swoje konto? Tej operacji <strong style={{ color:'var(--danger)' }}>nie można cofnąć</strong>.
                  </p>
                  {deleteError && (
                    <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'var(--r)', padding:'0.65rem', color:'var(--danger)', fontSize:'0.82rem', marginBottom:'1rem' }}>
                      {deleteError}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:'0.75rem' }}>
                    <button onClick={closeModal} style={{ flex:1, padding:'0.65rem', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontFamily:'var(--font)', fontSize:'0.85rem', cursor:'pointer' }} disabled={deleteLoading}>
                      Anuluj
                    </button>
                    <button className="btn danger" style={{ flex:1 }} onClick={handleDeleteAccount} disabled={deleteLoading}>
                      {deleteLoading ? 'Usuwanie...' : 'Tak, usuń konto'}
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* ===== NAGŁÓWEK ===== */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <button onClick={() => navigate('/profile')} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', padding: '0.4rem 0.75rem', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: '0.82rem' }}>Wróć</button>
          <h2 style={{ fontFamily: 'var(--head)', fontSize: '1.3rem', fontWeight: 800 }}>Ustawienia</h2>
        </div>

        {/* ===== ALERTY ===== */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <h3 style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800 }}>Powiadomienia i alerty</h3>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--muted)', background: 'var(--bg3)', borderRadius: 20, padding: '0.15rem 0.6rem', border: '1px solid var(--border)' }}>
              {activeCount} / {ALERT_KEYS.length}
            </span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            Zarządzaj alertami widocznymi na stronie głównej dziennika
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button onClick={() => resetAll(true)} style={{ flex: 1, padding: '0.4rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--accent2)', fontFamily: 'var(--font)', fontSize: '0.78rem', cursor: 'pointer' }}>
              Włącz wszystkie
            </button>
            <button onClick={() => resetAll(false)} style={{ flex: 1, padding: '0.4rem', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontFamily: 'var(--font)', fontSize: '0.78rem', cursor: 'pointer' }}>
              Wyłącz wszystkie
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {ALERT_KEYS.map(function(alert) {
              return (
                <div key={alert.key}
                  onClick={() => toggle(alert.key)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: settings[alert.key] ? 'rgba(108,99,255,0.06)' : 'var(--bg3)', border: '1px solid ' + (settings[alert.key] ? 'rgba(108,99,255,0.3)' : 'var(--border)'), borderRadius: 'var(--r)', cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{alert.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: settings[alert.key] ? 'var(--text)' : 'var(--muted)', marginBottom: 2 }}>{alert.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{alert.desc}</div>
                  </div>
                  <div style={{ flexShrink: 0, width: 42, height: 24, borderRadius: 12, background: settings[alert.key] ? 'var(--accent)' : 'var(--bg3)', border: '2px solid ' + (settings[alert.key] ? 'var(--accent)' : 'var(--border2)'), position: 'relative', transition: 'all 0.2s' }}>
                    <div style={{ position: 'absolute', top: 2, left: settings[alert.key] ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: settings[alert.key] ? '#fff' : 'var(--muted)', transition: 'left 0.2s' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ===== PRÓG OSTRZEŻEŃ ===== */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--head)', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>Próg ostrzeżeń</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            Alerty pojawiają się gdy do wygaśnięcia pozostało mniej niż 60 dni.
          </p>
          <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '0.75rem 1rem', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--muted)' }}>
            Możliwość zmiany progu będzie dostępna w przyszłej wersji.
          </div>
        </div>

        <button onClick={save} className="btn" style={{ width: '100%', fontSize: '0.95rem', padding: '0.75rem', marginBottom: '1rem' }}>
          {saved ? 'Zapisano!' : 'Zapisz ustawienia'}
        </button>

        {/* ===== STREFA NIEBEZPIECZNA ===== */}
        <div style={{ background:'rgba(248,113,113,0.05)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:'var(--r2)', padding:'1.25rem' }}>
          <h3 style={{ fontFamily:'var(--head)', fontSize:'1rem', fontWeight:800, color:'var(--danger)', marginBottom:'0.5rem' }}>
            Strefa niebezpieczna
          </h3>
          <p style={{ fontSize:'0.82rem', color:'var(--muted)', marginBottom:'1rem', lineHeight:1.6 }}>
            Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane — skoki, profil, dokumenty i uprawnienia — zostaną trwale usunięte. Zalecamy zrobienie kopii zapasowej — możesz to zrobić w następnym kroku.
          </p>
          <button
            onClick={() => setDeleteStep('confirm')}
            style={{ background:'transparent', border:'1px solid var(--danger)', borderRadius:8, color:'var(--danger)', padding:'0.55rem 1.25rem', fontFamily:'var(--font)', fontSize:'0.88rem', cursor:'pointer', fontWeight:600, transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            🗑 Usuń konto
          </button>
        </div>

      </div>
    </div>
  )
}