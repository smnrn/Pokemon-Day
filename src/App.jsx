import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './components/Toast.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './sections/Hero.jsx';
import Engine1 from './sections/Engine1.jsx';
import Engine2 from './sections/Engine2.jsx';
import Engine3 from './sections/Engine3.jsx';
import PokemonProfile from './sections/PokemonProfile.jsx';
import BattleLog from './sections/BattleLog.jsx';
import Analytics from './sections/Analytics.jsx';
import AuditLog from './sections/AuditLog.jsx';

const SECTIONS = ['hero', 'engine1', 'engine2', 'engine3', 'profile', 'battlelog', 'analytics', 'audit'];

function PokeballTransition({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ rotate: { repeat: Infinity, duration: 0.5, ease: 'linear' }, scale: { repeat: Infinity, duration: 0.8 } }}
            style={{ width: 80, height: 80 }}
          >
            <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
              <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946"/>
              <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#12122a"/>
              <circle cx="50" cy="50" r="48" stroke="#4361ee" strokeWidth="3" fill="none"/>
              <line x1="2" y1="50" x2="98" y2="50" stroke="#4361ee" strokeWidth="3"/>
              <circle cx="50" cy="50" r="12" fill="#0a0a1a" stroke="#4361ee" strokeWidth="3"/>
              <circle cx="50" cy="50" r="5" fill="#ffd60a"/>
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Maintenance() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d22 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      color: '#e8e8ff',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(230, 57, 70, 0.1)',
        border: '1px solid rgba(230, 57, 70, 0.3)',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🚧</div>
        <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '16px', color: '#e63946', marginBottom: '24px', lineHeight: '1.5' }}>
          SYSTEM OFFLINE
        </h1>
        <p style={{ fontFamily: 'Exo 2', fontSize: '14px', color: '#8888bb', lineHeight: '1.6' }}>
          The Pokémon Battle Engine System is currently locked and undergoing maintenance.
          Access has been temporarily disabled by the administrator.
        </p>
      </div>
    </div>
  );
}

function App() {
  return <Maintenance />;
}

export default App;
