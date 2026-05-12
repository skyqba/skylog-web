import React from 'react'

export default function ComingSoon() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d0d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif",
      color: '#ffffff',
      gap: '2rem',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '0.5rem',
      }}>🪂</div>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 200,
        letterSpacing: '0.25em',
        margin: 0,
        textTransform: 'uppercase',
      }}>
        JumpLogX
      </h1>
      <p style={{
        fontSize: '0.95rem',
        color: '#888',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        margin: 0,
      }}>
        Coming Soon
      </p>
      <div style={{
        width: 60,
        height: 1,
        background: '#333',
        marginTop: '0.5rem',
      }} />
      <p style={{ color: '#444', fontSize: '0.8rem', margin: 0 }}>
        jumplogx.com
      </p>
    </div>
  )
}
