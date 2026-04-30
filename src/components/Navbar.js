import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = async () => {
    sessionStorage.removeItem('dismissedRigs')
    sessionStorage.removeItem('dismissedQuals')
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
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
              <span style={{ color:'var(--accent2)' }}>Jump</span>Log<span style={{ color:'var(--accent2)' }}>X</span>
            </span>
            <span style={{ display:'block', fontFamily:'var(--font)', fontSize:'0.62rem', color:'var(--muted)', letterSpacing:'0.5px', marginTop:'-2px' }}>by SkyQba ver 1.0</span>
          </div>
        </Link>

        {/* Desktop menu */}
        <div className="desktop-nav" style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <NavLink to="/"        label={t('nav.journal')} active={pathname === '/'} />
          <NavLink to="/profile" label={t('nav.profile')} active={pathname === '/profile'} />
          <button onClick={logout} style={{
            padding:'0.4rem 0.9rem', background:'transparent',
            border:'1px solid var(--border)', borderRadius:8,
            color:'var(--muted)', fontFamily:'var(--font)',
            fontSize:'0.82rem', fontWeight:500, cursor:'pointer', transition:'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.borderColor='var(--danger)'; e.target.style.color='var(--danger)' }}
            onMouseLeave={e => { e.target.style.borderColor='var(--border)';  e.target.style.color='var(--muted)'  }}
          >{t('nav.logout')}</button>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            gap: '5px', background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, padding: '0.45rem 0.6rem', cursor: 'pointer',
          }}
        >
          <span style={{ display:'block', width:20, height:2, background: menuOpen ? 'var(--accent2)' : 'var(--text)', borderRadius:2, transition:'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display:'block', width:20, height:2, background: menuOpen ? 'transparent' : 'var(--text)', borderRadius:2, transition:'all 0.2s' }} />
          <span style={{ display:'block', width:20, height:2, background: menuOpen ? 'var(--accent2)' : 'var(--text)', borderRadius:2, transition:'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'rgba(8,9,12,0.97)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          padding: '1rem 1.5rem',
        }}>
          <MobileNavLink to="/"        label={t('nav.journal')} active={pathname === '/'}        onClick={() => setMenuOpen(false)} />
          <MobileNavLink to="/profile" label={t('nav.profile')} active={pathname === '/profile'} onClick={() => setMenuOpen(false)} />
          <button onClick={() => { setMenuOpen(false); logout() }} style={{
            padding:'0.75rem 1rem', background:'transparent',
            border:'1px solid var(--danger)', borderRadius:8,
            color:'var(--danger)', fontFamily:'var(--font)',
            fontSize:'0.9rem', fontWeight:500, cursor:'pointer', textAlign:'left',
          }}>
            {t('nav.logout')}
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{
      padding: '0.4rem 0.9rem',
      background: active ? 'var(--accent)' : 'transparent',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 8, color: active ? '#fff' : 'var(--muted)',
      fontFamily: 'var(--font)', fontSize: '0.82rem',
      fontWeight: active ? 600 : 400, textDecoration: 'none', transition: 'all 0.2s',
    }}>
      {label}
    </Link>
  )
}

function MobileNavLink({ to, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      padding: '0.75rem 1rem',
      background: active ? 'var(--accent)' : 'transparent',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 8, color: active ? '#fff' : 'var(--muted)',
      fontFamily: 'var(--font)', fontSize: '0.9rem',
      fontWeight: active ? 600 : 400, textDecoration: 'none', transition: 'all 0.2s',
    }}>
      {label}
    </Link>
  )
}