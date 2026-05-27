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

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [transitioning, setTransitioning] = useState(false);
  const sectionRefs = useRef({});

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (SECTIONS.includes(id)) setActiveSection(id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-60px 0px 0px 0px' }
    );
    SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const navigate = useCallback((sectionId) => {
    setTransitioning(true);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
      setTimeout(() => setTransitioning(false), 400);
    }, 200);
  }, []);

  return (
    <ToastProvider>
      <div className="pixel-grid" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d22 100%)' }}>
        <PokeballTransition visible={transitioning}/>
        <Navbar activeSection={activeSection} onNavigate={navigate}/>

        <main style={{ paddingTop: '60px' }}>
          <Hero onNavigate={navigate}/>
          
          {/* Section dividers */}
          <div className="section-divider"/>
          <Engine1/>
          
          <div className="section-divider"/>
          <Engine2/>
          
          <div className="section-divider"/>
          <Engine3/>
          
          <div className="section-divider"/>
          <PokemonProfile/>
          
          <div className="section-divider"/>
          <BattleLog/>
          
          <div className="section-divider"/>
          <Analytics/>
          
          <div className="section-divider"/>
          <AuditLog/>
        </main>

        {/* Footer */}
        <footer style={{
          background: 'rgba(10,10,26,0.95)', borderTop: '1px solid rgba(67,97,238,0.2)',
          padding: '24px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'Press Start 2P', fontSize: '7px', color: '#8888bb', marginBottom: '6px' }}>
            3-ISB POKEMON BATTLE ENGINE SYSTEM
          </div>
          <div style={{ fontFamily: 'Exo 2', fontSize: '12px', color: '#4361ee80' }}>
            Developed by Simon Ron Joshua Roaring
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}

export default App;
