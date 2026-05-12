import ComingSoon from './pages/ComingSoon'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { syncQueue } from './offlineQueue'
import AnnouncementPopup from './components/AnnouncementPopup'
import Login          from './pages/Login'
import Register       from './pages/Register'
import Journal        from './pages/Journal'
import AddJump        from './pages/AddJump'
import Profile        from './pages/Profile'
import Import         from './pages/Import'
import Export         from './pages/Export'
import EditJumps      from './pages/EditJumps'
import Manual         from './pages/Manual'
import Stats          from './pages/Stats'
import Qualifications from './pages/Qualifications'
import Settings       from './pages/Settings'
import ResetPassword  from './pages/ResetPassword'
import AdminPanel     from './pages/AdminPanel'

const savedTheme = localStorage.getItem('jumplogx_theme')
if (savedTheme === 'pro') document.body.classList.add('theme-pro')

const DEV_SECRET = process.env.REACT_APP_DEV_SECRET || ''

function checkDevAccess() {
  const params = new URLSearchParams(window.location.search)
  const secret = params.get('dev')
  if (DEV_SECRET && secret === DEV_SECRET) {
    localStorage.setItem('jumplogx_dev_access', DEV_SECRET)
    window.history.replaceState({}, '', window.location.pathname)
    return true
  }
  return localStorage.getItem('jumplogx_dev_access') === DEV_SECRET && DEV_SECRET !== ''
}

function App() {
  const [session, setSession] = useState(undefined)
  const [online, setOnline]   = useState(navigator.onLine)
  const [devAccess]           = useState(() => checkDevAccess())

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      window.location.replace('/reset-password' + hash)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const handleOnline = async () => {
      setOnline(true)
      await syncQueue(supabase)
    }
    const handleOffline = () => setOnline(false)
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (process.env.REACT_APP_COMING_SOON === 'true' && !devAccess) return <ComingSoon />

  if (session === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)' }}>
      Ładowanie...
    </div>
  )

  return (
    <BrowserRouter>
      <AnnouncementPopup session={session} />
      {!online && (
        <div style={{ background:'#FBBF24', color:'#000', textAlign:'center', padding:'0.4rem', fontSize:'0.82rem', fontWeight:600, position:'sticky', top:0, zIndex:999 }}>
          ⚡ Tryb offline — zmiany zostaną zsynchronizowane po powrocie połączenia
        </div>
      )}
      <Routes>
        <Route path="/login"          element={!session ? <Login />          : <Navigate to="/" />} />
        <Route path="/register"       element={!session ? <Register />       : <Navigate to="/" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/"               element={ session  ? <Journal />        : <Navigate to="/login" />} />
        <Route path="/add"            element={ session  ? <AddJump />        : <Navigate to="/login" />} />
        <Route path="/profile"        element={ session  ? <Profile />        : <Navigate to="/login" />} />
        <Route path="/import"         element={ session  ? <Import />         : <Navigate to="/login" />} />
        <Route path="/export"         element={ session  ? <Export />         : <Navigate to="/login" />} />
        <Route path="/edit-jumps"     element={ session  ? <EditJumps />      : <Navigate to="/login" />} />
        <Route path="/manual"         element={ session  ? <Manual />         : <Navigate to="/login" />} />
        <Route path="/stats"          element={ session  ? <Stats />          : <Navigate to="/login" />} />
        <Route path="/qualifications" element={ session  ? <Qualifications /> : <Navigate to="/login" />} />
        <Route path="/settings"       element={ session  ? <Settings />       : <Navigate to="/login" />} />
        <Route path="/admin"          element={ session  ? <AdminPanel />     : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
