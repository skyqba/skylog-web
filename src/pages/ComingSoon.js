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

      {/* mesh gradient - identyczny jak theme-pro */}
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

      {/* karta glass - identyczna jak theme-pro .card */}
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

        {/* ikona */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'rgba(139,92,246,0.15)',
          border: '1px solid rgba(139,92,246,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          boxShadow: '0 0 40px rgba(139,92,246,0.25)',
        }}>
          🪂
        </div>

        {/* nazwa */}
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          margin: 0,
          background: 'linear-gradient(135deg, #F1F5F9 0%, #A78BFA 60%, #60A5FA 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.1,
          textShadow: 'none',
        }}>
          JumpLogX
        </h1>

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

        {/* przycisk - styl theme-pro */}
        <div style={{
          marginTop: '0.5rem',
          padding: '0.6rem 1.8rem',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
          borderRadius: 12,
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
          fontFamily: "'Inter', sans-serif",
        }}>
          Wkrótce
        </div>

      </div>

      {/* dolna etykieta */}
      <p style={{
        position: 'fixed',
        bottom: '1.5rem',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.65rem',
        color: 'rgba(148,163,184,0.35)',
        letterSpacing: '0.15em',
        margin: 0,
        zIndex: 1,
      }}>
        jumplogx.com
      </p>

    </div>
  )
}
