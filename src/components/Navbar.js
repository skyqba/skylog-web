import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../supabase'
import { useProfile } from '../useProfile'

const isPro = () => document.body.classList.contains('theme-pro')

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const { isAdmin, isPremium, profile } = useProfile()
  const pro = isPro()
  const avatarRef = useRef(null)

  const logout = async () => {
    sessionStorage.removeItem('dismissedRigs')
    sessionStorage.removeItem('dismissedQuals')
    await supabase.auth.signOut()
    navigate('/login')
  }

  useEffect(() => {
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (pro) {
    return (
      <>
        <div style={{ position:'sticky', top:0, zIndex:100, padding:'10px 16px 0', pointerEvents:'none' }}>
          <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.65rem 1.25rem', background:'rgba(15,23,42,0.75)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, boxShadow:'inset 0 1px 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.4)', pointerEvents:'all', maxWidth:780, margin:'0 auto' }}>
            <Link to="/manual" style={{ textDecoration:'none', flexShrink:0 }}>
              <div>
                <span style={{ fontFamily:'var(--head)', fontSize:'1.2rem', fontWeight:900, letterSpacing:'-0.5px' }}>
                  <span style={{ color:'#A78BFA' }}>Jump</span><span style={{ color:'#fff' }}>Log</span><span style={{ color:'#A78BFA' }}>X</span>
                  {isPremium && <span style={{ background:'linear-gradient(135deg,#8B5CF6,#3B82F6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', fontSize:'0.8rem', fontWeight:900, marginLeft:'0.3rem' }}>PRO</span>}
                </span>
                <span style={{ display:'block', fontFamily:'var(--font)', fontSize:'0.58rem', color:'#64748B', letterSpacing:'0.5px', marginTop:'-2px' }}>by SkyQba</span>
              </div>
            </Link>

            <div className="desktop-nav" style={{ display:'flex', gap:'0.25rem', alignItems:'center' }}>
              <ProNavLink to="/" label={t('nav.journal')} active={pathname==='/'} />
              <ProNavLink to="/profile" label={t('nav.profile')} active={pathname==='/profile'} />
              <ProNavLink to="/settings" label={t('nav.settings')} active={pathname==='/settings'} />
              {isAdmin && <ProNavLink to="/admin" label="Admin" active={pathname==='/admin'} isAdmin />}
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexShrink:0 }}>
              {isPremium ? (
                <div ref={avatarRef} style={{ position:'relative' }}>
                  <PremiumAvatar profile={profile} onClick={() => setAvatarMenuOpen(o => !o)} />
                  {avatarMenuOpen && (
                    <div style={{ position:'absolute', top:'calc(100% + 12px)', right:0, background:'rgba(15,23,42,0.97)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'0.5rem', minWidth:160, boxShadow:'0 16px 40px rgba(0,0,0,0.5)', zIndex:200 }}>
                      <AvatarMenuItem to="/profile" label="👤 Profil" onClick={() => setAvatarMenuOpen(false)} />
                      <AvatarMenuItem to="/settings" label="⚙️ Ustawienia" onClick={() => setAvatarMenuOpen(false)} />
                      {isAdmin && <AvatarMenuItem to="/admin" label="🛡 Admin" onClick={() => setAvatarMenuOpen(false)} />}
                      <div style={{ height:1, background:'rgba(255,255,255,0.07)', margin:'0.35rem 0' }} />
                      <button onClick={() => { setAvatarMenuOpen(false); logout() }} style={{ width:'100%', padding:'0.6rem 0.9rem', background:'transparent', border:'none', color:'#F87171', fontSize:'0.82rem', textAlign:'left', cursor:'pointer', borderRadius:10, fontFamily:'var(--font)' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.08)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        ⏻ Wyloguj
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={logout} className="desktop-nav" style={{ padding:'0.4rem 0.9rem', background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, color:'#64748B', fontFamily:'var(--font)', fontSize:'0.78rem', cursor:'pointer' }} onMouseEnter={e=>{e.target.style.borderColor='#F87171';e.target.style.color='#F87171'}} onMouseLeave={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';e.target.style.color='#64748B'}}>
                  {t('nav.logout')}
                </button>
              )}
              <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)} style={{ display:'none', flexDirection:'column', gap:5, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'0.45rem 0.6rem', cursor:'pointer' }}>
                <span style={{ display:'block', width:18, height:2, background:'#fff', borderRadius:2, transition:'all 0.2s', transform: menuOpen?'rotate(45deg) translate(4px,4px)':'none' }} />
                <span style={{ display:'block', width:18, height:2, background: menuOpen?'transparent':'#fff', borderRadius:2 }} />
                <span style={{ display:'block', width:18, height:2, background:'#fff', borderRadius:2, transition:'all 0.2s', transform: menuOpen?'rotate(-45deg) translate(4px,-4px)':'none' }} />
              </button>
            </div>
          </nav>
        </div>

        {menuOpen && (
          <div style={{ position:'fixed', top:80, left:16, right:16, zIndex:99, background:'rgba(15,23,42,0.97)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'1rem', boxShadow:'0 16px 40px rgba(0,0,0,0.5)' }}>
            <MobileNavLink to="/" label={t('nav.journal')} active={pathname==='/'} onClick={()=>setMenuOpen(false)} />
            <MobileNavLink to="/profile" label={t('nav.profile')} active={pathname==='/profile'} onClick={()=>setMenuOpen(false)} />
            <MobileNavLink to="/settings" label={t('nav.settings')} active={pathname==='/settings'} onClick={()=>setMenuOpen(false)} />
            {isAdmin && <MobileNavLink to="/admin" label="🛡 Admin" active={pathname==='/admin'} onClick={()=>setMenuOpen(false)} />}
            <div style={{ height:1, background:'rgba(255,255,255,0.07)', margin:'0.5rem 0' }} />
            <button onClick={()=>{setMenuOpen(false);logout()}} style={{ width:'100%', padding:'0.75rem 1rem', background:'transparent', border:'1px solid rgba(248,113,113,0.3)', borderRadius:12, color:'#F87171', fontFamily:'var(--font)', fontSize:'0.88rem', cursor:'pointer', textAlign:'left' }}>
              ⏻ {t('nav.logout')}
            </button>
          </div>
        )}
        <style>{`.desktop-nav{display:flex !important} @media(max-width:600px){.desktop-nav{display:none !important}.hamburger-btn{display:flex !important}}`}</style>
      </>
    )
  }

  return (
    <>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.85rem 1.5rem', background:'rgba(8,9,12,0.9)', backdropFilter:'blur(24px)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 }}>
        <Link to="/manual" style={{ display:'flex', alignItems:'center', gap:'0.5rem', textDecoration:'none' }}>
          <div>
            <span style={{ fontFamily:'var(--head)', fontSize:'1.35rem', fontWeight:900, color:'var(--text)', letterSpacing:'-0.5px' }}>
              <span style={{ color:'var(--accent2)' }}>Jump</span>Log<span style={{ color:'var(--accent2)' }}>X</span>
              {isPremium && <span style={{ color:'#F59E0B', fontSize:'0.85rem', fontWeight:800, marginLeft:'0.3rem' }}>Pro</span>}
            </span>
            <span style={{ display:'block', fontFamily:'var(--font)', fontSize:'0.62rem', color:'var(--muted)', letterSpacing:'0.5px', marginTop:'-2px' }}>by SkyQba ver 1.0</span>
          </div>
        </Link>

        <div className="desktop-nav" style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <NavLink to="/" label={t('nav.journal')} active={pathname==='/'} />
          <NavLink to="/profile" label={t('nav.profile')} active={pathname==='/profile'} />
          <NavLink to="/settings" label={t('nav.settings')} active={pathname==='/settings'} />
          {isAdmin && <NavLink to="/admin" label="🛡 Admin" active={pathname==='/admin'} />}
          <button onClick={logout} style={{ padding:'0.4rem 0.9rem', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontFamily:'var(--font)', fontSize:'0.82rem', cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e=>{e.target.style.borderColor='var(--danger)';e.target.style.color='var(--danger)'}} onMouseLeave={e=>{e.target.style.borderColor='var(--border)';e.target.style.color='var(--muted)'}}>
            {t('nav.logout')}
          </button>
        </div>
        <button className="hamburger-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{ display:'none', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:5, background:'transparent', border:'1px solid var(--border)', borderRadius:8, padding:'0.45rem 0.6rem', cursor:'pointer' }}>
          <span style={{ display:'block', width:20, height:2, background: menuOpen?'var(--accent2)':'var(--text)', borderRadius:2, transition:'all 0.2s', transform: menuOpen?'rotate(45deg) translate(5px,5px)':'none' }} />
          <span style={{ display:'block', width:20, height:2, background: menuOpen?'transparent':'var(--text)', borderRadius:2, transition:'all 0.2s' }} />
          <span style={{ display:'block', width:20, height:2, background: menuOpen?'var(--accent2)':'var(--text)', borderRadius:2, transition:'all 0.2s', transform: menuOpen?'rotate(-45deg) translate(5px,-5px)':'none' }} />
        </button>
      </nav>
      {menuOpen && (
        <div style={{ position:'fixed', top:64, left:0, right:0, zIndex:99, background:'rgba(8,9,12,0.97)', backdropFilter:'blur(24px)', borderBottom:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'0.5rem', padding:'1rem 1.5rem' }}>
          <MobileNavLink to="/" label={t('nav.journal')} active={pathname==='/'} onClick={()=>setMenuOpen(false)} />
          <MobileNavLink to="/profile" label={t('nav.profile')} active={pathname==='/profile'} onClick={()=>setMenuOpen(false)} />
          <MobileNavLink to="/settings" label={t('nav.settings')} active={pathname==='/settings'} onClick={()=>setMenuOpen(false)} />
          {isAdmin && <MobileNavLink to="/admin" label="🛡 Admin" active={pathname==='/admin'} onClick={()=>setMenuOpen(false)} />}
          <button onClick={()=>{setMenuOpen(false);logout()}} style={{ padding:'0.75rem 1rem', background:'transparent', border:'1px solid var(--danger)', borderRadius:8, color:'var(--danger)', fontFamily:'var(--font)', fontSize:'0.9rem', cursor:'pointer', textAlign:'left' }}>
            {t('nav.logout')}
          </button>
        </div>
      )}
      <style>{`@media(max-width:600px){.desktop-nav{display:none !important}.hamburger-btn{display:flex !important}}`}</style>
    </>
  )
}

function AvatarMenuItem({ to, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{ display:'block', padding:'0.6rem 0.9rem', color:'#94A3B8', textDecoration:'none', fontSize:'0.82rem', borderRadius:10, transition:'all 0.15s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.06)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
      {label}
    </Link>
  )
}

function ProNavLink({ to, label, active, isAdmin: admin }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link to={to} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} style={{ padding:'0.45rem 0.85rem', background: active?'rgba(139,92,246,0.15)':hovered?'rgba(255,255,255,0.06)':'transparent', border:`1px solid ${active?'rgba(139,92,246,0.4)':'transparent'}`, borderRadius:50, color: active?'#A78BFA':hovered?'#fff':'#94A3B8', fontFamily:'var(--font)', fontSize:'0.82rem', fontWeight: active?600:400, textDecoration:'none', transition:'all 0.2s', filter: hovered&&!active?'drop-shadow(0 0 6px rgba(139,92,246,0.4))':'none' }}>
      {admin && '🛡 '}{label}
    </Link>
  )
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{ padding:'0.4rem 0.9rem', background: active?'var(--accent)':'transparent', border:`1px solid ${active?'var(--accent)':'var(--border)'}`, borderRadius:8, color: active?'#fff':'var(--muted)', fontFamily:'var(--font)', fontSize:'0.82rem', fontWeight: active?600:400, textDecoration:'none', transition:'all 0.2s' }}>
      {label}
    </Link>
  )
}

function MobileNavLink({ to, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{ padding:'0.75rem 1rem', background: active?'rgba(139,92,246,0.15)':'transparent', border:`1px solid ${active?'rgba(139,92,246,0.4)':'rgba(255,255,255,0.07)'}`, borderRadius:12, color: active?'#A78BFA':'#94A3B8', fontFamily:'var(--font)', fontSize:'0.9rem', fontWeight: active?600:400, textDecoration:'none', display:'block', marginBottom:'0.4rem' }}>
      {label}
    </Link>
  )
}

function PremiumAvatar({ profile, onClick }) {
  const [hovered, setHovered] = useState(false)
  const initials = `${profile?.name?.[0]||''}${profile?.surname?.[0]||''}`.toUpperCase() || '?'
  const avatar = profile?.avatar_url
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onClick={onClick} style={{ position:'relative', width:48, height:48, borderRadius:'50%', padding:2, background:'linear-gradient(135deg,#8B5CF6,#3B82F6)', boxShadow: hovered?'0 0 0 3px rgba(139,92,246,0.3), 0 0 20px rgba(139,92,246,0.5)':'none', transition:'box-shadow 0.25s ease', flexShrink:0, cursor:'pointer' }}>
      <div style={{ width:'100%', height:'100%', borderRadius:'50%', overflow:'hidden', background:'#1E293B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.82rem', fontWeight:700, color:'#fff' }}>
        {avatar ? <img src={avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
      </div>

    </div>
  )
}
