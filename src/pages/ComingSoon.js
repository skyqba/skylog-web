import React, { useEffect, useState } from 'react'

export default function ComingSoon() {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      color: '#F1F5F9',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* mesh gradient */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 10% 10%, rgba(139,92,246,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 90% 20%, rgba(59,130,246,0.15) 0%, transparent 55%),
          radial-gradient(ellipse 70% 60% at 50% 90%, rgba(16,185,129,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(139,92,246,0.1) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
      }} />

      {/* karta glass */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(30, 41, 59, 0.65)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderTop: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 24,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        padding: '3rem 2.5rem',
        maxWidth: 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
      }}>

        {/* logo - identyczne jak w Login.js */}
        <div>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '2.8rem',
            fontWeight: 900,
            lineHeight: 1,
          }}>
            <span style={{ color: '#A78BFA' }}>Jump</span>
            <span style={{ color: '#F1F5F9' }}>Log</span>
            <span style={{ color: '#A78BFA' }}>X</span>
          </span>
        </div>

        {/* by SkyQba - jak w Login */}
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.65rem',
          color: 'rgba(148,163,184,0.6)',
          marginTop: '-1rem',
        }}>
          by SkyQba ver 1.0
        </div>

        {/* linia */}
        <div style={{
          width: 48,
          height: 2,
          background: 'linear-gradient(90deg, transparent, #8B5CF6, #3B82F6, transparent)',
          borderRadius: 2,
        }} />

        {/* coming soon */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.72rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: '#94A3B8',
          margin: 0,
        }}>
          Coming Soon{dots}
        </p>

      </div>

      {/* dolna etykieta */}
      <p style={{
        position: 'fixed',
        bottom: '1.5rem',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        color: 'rgba(148,163,184,0.3)',
        letterSpacing: '0.15em',
        margin: 0,
        zIndex: 1,
      }}>
        jumplogx.com
      </p>

    </div>
  )
}
