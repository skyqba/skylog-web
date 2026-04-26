import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.85rem 1.5rem',
      background: 'rgba(8,9,12,0.9)', backdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/manual" style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none' }}>
        <div>
          <span style={{ fontFamily:'var(--head)', fontSize:'1.35rem', fontWeight:900, color:'var(--text)', letterSpacing:'-0.5px' }}>
            Jump<span style={{ color:'var(--accent2)' }}>Log</span>
          </span>
          <span style={{ display:'block', fontFamily:'var(--font)', fontSize:'0.62rem', color:'var(--muted)', letterSpacing:'0.5px', marginTop:'-2px' }}>by SkyQba ver 1.0</span>
        </div>
      </Link>

      <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
        <NavLink to="/"        label="Dziennik" active={pathname === '/'} />
        <NavLink to="/profile" label="Profil"   active={pathname === '/profile'} />
        <button onClick={logout} style={{
          padding:'0.4rem 0.9rem',
          background:'transparent',
          border:'1px solid var(--border)',
          borderRadius:8,
          color:'var(--muted)',
          fontFamily:'var(--font)',
          fontSize:'0.82rem',
          fontWeight:500,
          cursor:'pointer',
          transition:'all 0.2s',
        }}
          onMouseEnter={e => { e.target.style.borderColor='var(--danger)'; e.target.style.color='var(--danger)' }}
          onMouseLeave={e => { e.target.style.borderColor='var(--border)';  e.target.style.color='var(--muted)'  }}
        >Wyloguj</button>
      </div>
    </nav>
  )
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{
      padding: '0.4rem 0.9rem',
      background: active ? 'var(--accent)' : 'transparent',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 8,
      color: active ? '#fff' : 'var(--muted)',
      fontFamily: 'var(--font)',
      fontSize: '0.82rem',
      fontWeight: active ? 600 : 400,
      textDecoration: 'none',
      transition: 'all 0.2s',
    }}>
      {label}
    </Link>
  )
}
