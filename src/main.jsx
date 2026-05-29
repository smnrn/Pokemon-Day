import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const MaintenanceScreen = () => (
  <div style={{
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00e5ff',
    fontFamily: 'Inter, sans-serif'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textShadow: '0 0 10px #00e5ff' }}>MAINTENANCE MODE</h1>
    <p style={{ color: '#8892b0', fontSize: '1.2rem' }}>The Pokémon Battle Engine is currently offline.</p>
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MaintenanceScreen />
  </StrictMode>,
)
