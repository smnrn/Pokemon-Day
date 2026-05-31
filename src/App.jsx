import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider, useToast } from './components/Toast.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './sections/Hero.jsx';
import Engine1 from './sections/Engine1.jsx';
import Engine2 from './sections/Engine2.jsx';
import Engine3 from './sections/Engine3.jsx';
import PokemonProfile from './sections/PokemonProfile.jsx';
import BattleLog from './sections/BattleLog.jsx';
import Analytics from './sections/Analytics.jsx';
import AuditLog from './sections/AuditLog.jsx';
import Auth from './components/Auth.jsx';
import PokeballWipe from './components/PokeballWipe.jsx';
import { supabase } from './db.js';

const SECTIONS = ['hero', 'engine1', 'engine2', 'engine3', 'profile', 'battlelog', 'analytics', 'audit'];

/* ═══════════════════════════════════════
   POKÉBALL SECTION TRANSITION
   ═══════════════════════════════════════ */
function PokeballTransition({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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

/* ═══════════════════════════════════════
   TRAINER WELCOME TOAST
   ═══════════════════════════════════════ */
function TrainerToast({ username, visible, onDismiss }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDismiss, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onDismiss]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          style={{
            position: 'fixed', top: 80, right: 24, zIndex: 8000,
            background: '#0a0a20', borderRadius: 8, padding: '16px 20px',
            borderLeft: '3px solid #06d6a0',
            boxShadow: '0 0 16px rgba(6,214,160,0.3), 0 8px 30px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', gap: 14, maxWidth: 380,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ flexShrink: 0 }}
          >
            <svg viewBox="0 0 100 100" fill="none" style={{ width: 28, height: 28 }}>
              <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946"/>
              <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#1a1a3a"/>
              <circle cx="50" cy="50" r="48" stroke="#06d6a0" strokeWidth="4" fill="none"/>
              <line x1="2" y1="50" x2="98" y2="50" stroke="#06d6a0" strokeWidth="4"/>
              <circle cx="50" cy="50" r="10" fill="#1a1a3a" stroke="#06d6a0" strokeWidth="4"/>
              <circle cx="50" cy="50" r="4" fill="#ffd60a"/>
            </svg>
          </motion.div>
          <div>
            <div style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#e2e8f0', marginBottom: 6 }}>
              WELCOME, {(username || 'TRAINER').split('@')[0].toUpperCase()}!
            </div>
            <div style={{ fontFamily: 'Exo 2', fontSize: '11px', color: '#06d6a0', marginBottom: 4 }}>
              TRAINER AUTHENTICATED ✓
            </div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: '10px', color: '#3a3a5c' }}>
              {timeStr} · 3-ISB SYSTEM
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════
   LOGOUT TOAST
   ═══════════════════════════════════════ */
function LogoutToast({ visible, onDismiss }) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDismiss, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          style={{
            position: 'fixed', top: 80, right: 24, zIndex: 8000,
            background: '#0a0a20', borderRadius: 8, padding: '16px 20px',
            borderLeft: '3px solid #e63946',
            boxShadow: '0 0 16px rgba(230,57,70,0.3), 0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#e63946', marginBottom: 4 }}>SESSION ENDED</div>
          <div style={{ fontFamily: 'Exo 2', fontSize: '11px', color: '#3a3a5c' }}>See you next battle.</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════
   ENTRANCE WRAPPER
   ═══════════════════════════════════════ */
function EntranceBlock({ entering, delay, children, spring = false }) {
  if (!entering) return children;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: spring ? 0.92 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={spring
        ? { delay, type: 'spring', stiffness: 120, damping: 20 }
        : { delay, duration: 0.5, ease: 'easeOut' }
      }
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════ */
function AppContent() {
  // appState: 'init' | 'login' | 'wipe_in' | 'app' | 'wipe_out'
  const [appState, setAppState] = useState('init');
  const [trainerName, setTrainerName] = useState('');
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [dashEntering, setDashEntering] = useState(false);

  const [activeSection, setActiveSection] = useState('hero');
  const [transitioning, setTransitioning] = useState(false);

  const { addToast } = useToast();

  /* ── Auth Session Management ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAppState(session ? 'app' : 'login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // SIGNED_OUT handled by logout flow
      if (event === 'SIGNED_OUT') {
        // Already handled by handleLogout sequence
      }
      // SIGNED_IN handled by Auth.jsx onLoginSuccess callback
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ── Login Success (Auth.jsx Phase 1-2 complete → Phase 3 wipe) ── */
  const handleLoginSuccess = useCallback((username) => {
    setTrainerName(username);
    setAppState('wipe_in');
  }, []);

  /* ── Wipe In Complete → Phase 4 Dashboard Entrance ── */
  const handleWipeInComplete = useCallback(() => {
    setAppState('app');
    setDashEntering(true);
    setTimeout(() => setShowWelcomeToast(true), 400);
    setTimeout(() => setDashEntering(false), 2000);
  }, []);

  /* ── Logout Flow ── */
  const handleLogout = useCallback(async () => {
    setShowLogoutToast(true);
    setAppState('wipe_out');
  }, []);

  const handleWipeOutComplete = useCallback(async () => {
    await supabase.auth.signOut();
    setAppState('login');
    setShowLogoutToast(false);
  }, []);

  /* ── Scroll Spy ── */
  useEffect(() => {
    if (appState !== 'app') return;
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
    // Small delay to let DOM render
    const timer = setTimeout(() => {
      SECTIONS.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [appState]);

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
    <>
      {/* ── Auth Screen ── */}
      {(appState === 'login' || appState === 'wipe_in') && (
        <Auth onLoginSuccess={handleLoginSuccess} />
      )}

      {/* ── Main Dashboard ── */}
      {(appState === 'app' || appState === 'wipe_out') && (
        <div className="pixel-grid" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a1a 0%, #0d0d22 100%)', overflowX: 'hidden' }}>
          <PokeballTransition visible={transitioning}/>

          {/* Navbar with entrance animation */}
          <motion.div
            initial={dashEntering ? { y: -60, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Navbar activeSection={activeSection} onNavigate={navigate} onLogout={handleLogout} username={trainerName} />
          </motion.div>

          <main style={{ paddingTop: '60px' }}>
            <EntranceBlock entering={dashEntering} delay={0.2}>
              <Hero onNavigate={navigate}/>
            </EntranceBlock>

            <div className="section-divider"/>
            <EntranceBlock entering={dashEntering} delay={0.5} spring>
              <Engine1/>
            </EntranceBlock>

            <div className="section-divider"/>
            <EntranceBlock entering={dashEntering} delay={0.65} spring>
              <Engine2/>
            </EntranceBlock>

            <div className="section-divider"/>
            <EntranceBlock entering={dashEntering} delay={0.8} spring>
              <Engine3/>
            </EntranceBlock>

            <div className="section-divider"/>
            <EntranceBlock entering={dashEntering} delay={0.95} spring>
              <PokemonProfile/>
            </EntranceBlock>

            <div className="section-divider"/>
            <EntranceBlock entering={dashEntering} delay={1.1} spring>
              <BattleLog/>
            </EntranceBlock>

            <div className="section-divider"/>
            <EntranceBlock entering={dashEntering} delay={1.25} spring>
              <Analytics/>
            </EntranceBlock>

            <div className="section-divider"/>
            <EntranceBlock entering={dashEntering} delay={1.4} spring>
              <AuditLog/>
            </EntranceBlock>
          </main>

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
      )}

      {/* ── Transition Overlays ── */}
      <PokeballWipe active={appState === 'wipe_in'} onComplete={handleWipeInComplete} />
      <PokeballWipe active={appState === 'wipe_out'} reverse onComplete={handleWipeOutComplete} />

      {/* ── Toasts ── */}
      <TrainerToast username={trainerName} visible={showWelcomeToast} onDismiss={() => setShowWelcomeToast(false)} />
      <LogoutToast visible={showLogoutToast} onDismiss={() => setShowLogoutToast(false)} />
    </>
  );
}

/* ═══════════════════════════════════════
   ROOT WRAPPER (ToastProvider must wrap everything)
   ═══════════════════════════════════════ */
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
