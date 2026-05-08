import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function JumpsMap({ jumps }) {
  const jumpsWithCoords = jumps.filter(j => j.lat && j.lng)
  
  const cityGroups = {}
  jumps.filter(j => j.city).forEach(j => {
    if (!cityGroups[j.city]) cityGroups[j.city] = 0
    cityGroups[j.city]++
  })

  if (Object.keys(cityGroups).length === 0) return null

  return (
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'var(--r2)', marginBottom:'1rem', overflow:'hidden' }}>
      <div style={{ padding:'0.85rem 1.1rem', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'0.75rem' }}>
        <span style={{ fontSize:15 }}>🗺</span>
        <span style={{ fontSize:'0.88rem', fontWeight:500 }}>Strefy zrzutu</span>
        <span style={{ fontSize:'0.72rem', color:'var(--muted)', marginLeft:'auto' }}>{Object.keys(cityGroups).length} lokalizacji</span>
      </div>
      <div style={{ padding:'0.75rem 1.1rem', display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
        {Object.entries(cityGroups).sort((a,b) => b[1]-a[1]).map(([city, count]) => (
          <div key={city} style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:20, padding:'0.25rem 0.75rem', fontSize:'0.78rem' }}>
            <span style={{ color:'var(--accent2)', fontWeight:700, fontFamily:'var(--mono)' }}>{count}×</span>
            <span style={{ color:'var(--muted)' }}>📍 {city}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
