import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'hero',     label: 'HOME' },
  { id: 'engine1',  label: 'TEAM GEN' },
  { id: 'engine2',  label: 'COUNTER' },
  { id: 'engine3',  label: 'PREDICTOR' },
  { id: 'profile',  label: 'POKEDEX' },
  { id: 'battlelog',label: 'BATTLE LOG' },
  { id: 'analytics',label: 'ANALYTICS' },
  { id: 'audit',    label: 'AUDIT' },
];

export default function Navbar({ activeSection, onNavigate, onLogout, username }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = navRefs.current[activeSection];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parent = el.closest('.nav-items-container');
      const parentRect = parent?.getBoundingClientRect();
      if (parentRect) {
        setIndicatorStyle({ left: rect.left - parentRect.left, width: rect.width });
      }
    }
  }, [activeSection]);

  return (
    <>
      {/* Desktop Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(10, 10, 26, 0.92)',
        borderBottom: '1px solid rgba(67,97,238,0.25)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: '60px', gap: '24px' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              style={{ width: 28, height: 28 }}
            >
              <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
                <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946"/>
                <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#1a1a3a"/>
                <circle cx="50" cy="50" r="48" stroke="#4361ee" strokeWidth="3" fill="none"/>
                <line x1="2" y1="50" x2="98" y2="50" stroke="#4361ee" strokeWidth="3"/>
                <circle cx="50" cy="50" r="12" fill="#1a1a3a" stroke="#4361ee" strokeWidth="3"/>
                <circle cx="50" cy="50" r="5" fill="#ffd60a"/>
              </svg>
            </motion.div>
            <div>
              <div style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#4361ee', lineHeight: 1 }}>3-ISB</div>
              <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#8888bb', lineHeight: 1.5, marginTop: '4px' }}>BATTLE ENGINE</div>
            </div>
          </div>

          {/* Nav Items - Desktop */}
          <div className="nav-items-container" style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, position: 'relative', overflow: 'hidden' }}>
            {/* Active Indicator */}
            <motion.div
              className="nav-indicator"
              animate={indicatorStyle}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'absolute', bottom: '-1px', height: '2px', background: 'linear-gradient(90deg, #4361ee, #e63946)', borderRadius: '2px', boxShadow: '0 0 8px #4361ee' }}
            />
            {NAV_ITEMS.map(item => (
              <motion.button
                key={item.id}
                ref={el => { navRefs.current[item.id] = el; }}
                onClick={() => onNavigate(item.id)}
                whileHover={{ color: '#e8e8ff' }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 14px',
                  fontFamily: 'Press Start 2P', fontSize: '10px',
                  color: activeSection === item.id ? '#e8e8ff' : '#8888bb',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'color 0.2s', whiteSpace: 'nowrap',
                  position: 'relative',
                }}
              >
                <span className="hidden-mobile">{item.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Status dot and Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#e8e8ff', textShadow: '0 0 6px rgba(232,232,255,0.4)', textTransform: 'uppercase' }}>
                {username ? username.split('@')[0] : 'TRAINER'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(6,214,160,0.1)', padding: '4px 6px', borderRadius: '4px', border: '1px solid rgba(6,214,160,0.2)' }}>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#06d6a0', boxShadow: '0 0 6px #06d6a0' }}
                />
                <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#06d6a0' }}>ONLINE</span>
              </div>
            </div>
            <button
              onClick={() => onLogout && onLogout()}
              style={{
                background: 'rgba(230, 57, 70, 0.1)',
                border: '1px solid rgba(230, 57, 70, 0.5)',
                color: '#e63946',
                padding: '4px 8px',
                borderRadius: '4px',
                fontFamily: 'Press Start 2P',
                fontSize: '8px',
                cursor: 'pointer'
              }}
            >
              LOGOUT
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none', background: 'none', border: 'none', cursor: 'pointer',
              color: '#8888bb', fontSize: '18px',
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: 'rgba(10,10,26,0.98)', borderTop: '1px solid rgba(67,97,238,0.2)', overflow: 'hidden' }}
            >
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); setMenuOpen(false); }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '16px 24px',
                    fontFamily: 'Press Start 2P', fontSize: '11px',
                    color: activeSection === item.id ? '#4361ee' : '#8888bb',
                    borderBottom: '1px solid rgba(67,97,238,0.1)',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .nav-items-container { display: none !important; }
          .hidden-mobile { display: none; }
        }
      `}</style>
    </>
  );
}
