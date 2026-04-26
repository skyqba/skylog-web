import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Login    from './pages/Login'
import Register from './pages/Register'
import Journal  from './pages/Journal'
import AddJump  from './pages/AddJump'
import Profile  from './pages/Profile'
import Import   from './pages/Import'
import Export   from './pages/Export'
import EditJumps from './pages/EditJumps'
import Manual    from './pages/Manual'
import Stats     from './pages/Stats'
import wawelLogo from './wawel.png'

function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)' }}>
      Ładowanie...
    </div>
  )

  return (
    <BrowserRouter>
      {/* Logo WKS Wawel w tle */}
      <img
        src={wawelLogo}
        alt=""
        style={{
          position: 'fixed',
          left: '-80px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '350px',
          height: '350px',
          objectFit: 'contain',
          opacity: 0.07,
          pointerEvents: 'none',
          zIndex: 0,
          userSelect: 'none',
        }}
      />
      <Routes>
        <Route path="/login"    element={!session ? <Login />    : <Navigate to="/" />} />
        <Route path="/register" element={!session ? <Register /> : <Navigate to="/" />} />
        <Route path="/"         element={ session  ? <Journal />  : <Navigate to="/login" />} />
        <Route path="/add"      element={ session  ? <AddJump />  : <Navigate to="/login" />} />
        <Route path="/profile"  element={ session  ? <Profile />  : <Navigate to="/login" />} />
        <Route path="/import"     element={ session  ? <Import />     : <Navigate to="/login" />} />
        <Route path="/export"     element={ session  ? <Export />     : <Navigate to="/login" />} />
        <Route path="/edit-jumps" element={ session  ? <EditJumps /> : <Navigate to="/login" />} />
        <Route path="/manual"     element={ session  ? <Manual />    : <Navigate to="/login" />} />
        <Route path="/stats"      element={ session  ? <Stats />     : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
