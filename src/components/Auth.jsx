import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Check } from 'lucide-react';
import { supabase } from '../db.js';
import { useToast } from './Toast.jsx';

/* ═══════════════════════════════════════
   POKÉBALL SVG
   ═══════════════════════════════════════ */
const PokeballSVG = ({ size = 60 }) => (
  <svg viewBox="0 0 100 100" fill="none" style={{ width: size, height: size }}>
    <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946"/>
    <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#1a1a3a"/>
    <circle cx="50" cy="50" r="48" stroke="#4361ee" strokeWidth="3" fill="none"/>
    <line x1="2" y1="50" x2="98" y2="50" stroke="#4361ee" strokeWidth="3"/>
    <circle cx="50" cy="50" r="14" fill="#1a1a3a" stroke="#4361ee" strokeWidth="3"/>
    <circle cx="50" cy="50" r="6" fill="#ffd60a"/>
  </svg>
);

/* ═══════════════════════════════════════
   POKÉBALL CHECKBOX SVG
   ═══════════════════════════════════════ */
const PokeballCheckbox = ({ checked }) => (
  <svg viewBox="0 0 100 100" fill="none" style={{ width: 18, height: 18 }}>
    {checked ? (
      <>
        <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946"/>
        <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#e2e8f0"/>
        <circle cx="50" cy="50" r="48" stroke="#4361ee" strokeWidth="5" fill="none"/>
        <line x1="2" y1="50" x2="98" y2="50" stroke="#4361ee" strokeWidth="5"/>
        <circle cx="50" cy="50" r="12" fill="#1a1a3a" stroke="#4361ee" strokeWidth="5"/>
        <circle cx="50" cy="50" r="5" fill="#ffd60a"/>
      </>
    ) : (
      <>
        <circle cx="50" cy="50" r="48" stroke="#3a3a5c" strokeWidth="5" fill="none"/>
        <line x1="2" y1="50" x2="98" y2="50" stroke="#3a3a5c" strokeWidth="5"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="#3a3a5c" strokeWidth="5"/>
      </>
    )}
  </svg>
);

/* ═══════════════════════════════════════
   TYPEWRITER HOOK
   ═══════════════════════════════════════ */
function useTypewriter(text, speed = 60, delay = 1200) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return { displayed, done };
}

/* ═══════════════════════════════════════
   STAR PARTICLES (global background)
   ═══════════════════════════════════════ */
function StarField({ accelerate }) {
  const stars = useRef([...Array(50)].map(() => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.5 + 0.1,
    dur: Math.random() * 20 + 20,
  }))).current;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {stars.map((s, i) => (
        <motion.div key={i}
          initial={{ x: `${s.x}vw`, y: `${s.y}vh`, opacity: 0 }}
          animate={{ y: [`${s.y}vh`, `${s.y - 15}vh`], opacity: [0, s.opacity, 0] }}
          transition={{ duration: accelerate ? s.dur / 5 : s.dur, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
          style={{ position: 'absolute', width: s.size, height: s.size, borderRadius: '50%', background: '#e2e8f0' }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN AUTH COMPONENT
   ═══════════════════════════════════════ */
export default function Auth({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Animation states
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({ username: false, password: false });
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authFail, setAuthFail] = useState(false);
  const [btnText, setBtnText] = useState(null);
  const [progress, setProgress] = useState(0);
  const [checkboxSpin, setCheckboxSpin] = useState(false);
  const [focusFlash, setFocusFlash] = useState({ username: false, password: false });

  // Phase 1-2 enhanced states
  const [fieldSurge, setFieldSurge] = useState(false);
  const [cardFlash, setCardFlash] = useState(false);
  const [screenScanlines, setScreenScanlines] = useState(false);
  const [screenRedFlash, setScreenRedFlash] = useState(false);
  const [pokeballExploding, setPokeballExploding] = useState(false);
  const [pokeballWobble, setPokeballWobble] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orbSurge, setOrbSurge] = useState(false);
  const [starsAccelerate, setStarsAccelerate] = useState(false);

  const { addToast } = useToast();
  const { displayed: taglineText, done: taglineDone } = useTypewriter('PREDICT. COUNTER. DOMINATE.', 60, 1200);

  // Fragment data for pokeball explosion
  const fragments = useRef([...Array(14)].map((_, i) => {
    const angle = (i / 14) * 360 * (Math.PI / 180);
    const dist = 60 + Math.random() * 50;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, color: ['#e63946', '#4361ee', '#ffd60a'][i % 3], size: 4 + Math.random() * 4 };
  })).current;

  const triggerError = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const validateForm = () => {
    const e = { username: username.length < 3 || username.length > 40, password: password.length < 6 };
    setErrors(e);
    if (e.username || e.password) { triggerError(); return false; }
    return true;
  };

  const handleSubmit = async (ev, registering = false) => {
    ev.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setAuthFail(false);
    setErrorMessage('');
    setBtnText(registering ? 'REGISTERING' : 'AUTHENTICATING');
    setFieldSurge(true);

    // Progress bar fill
    let p = 0;
    const iv = setInterval(() => { p += 1.5; if (p > 85) clearInterval(iv); setProgress(p); }, 30);

    // Supabase call
    const fn = registering ? supabase.auth.signUp : supabase.auth.signInWithPassword;
    const { error } = await fn.call(supabase.auth, { email: username, password });
    clearInterval(iv);

    if (error) {
      /* ════ ERROR PATH ════ */
      setProgress(100);
      setErrors({ username: true, password: true });
      setAuthFail(true);
      setBtnText('ACCESS DENIED ✗');
      setScreenRedFlash(true);
      setPokeballWobble(true);
      setPassword('');
      setErrorMessage('⚠ INVALID TRAINER CREDENTIALS');
      triggerError();
      addToast(error.message, 'error');

      setTimeout(() => setScreenRedFlash(false), 200);
      setTimeout(() => setPokeballWobble(false), 600);
      setTimeout(() => {
        setLoading(false); setBtnText(null); setProgress(0);
        setAuthFail(false); setFieldSurge(false); setErrorMessage('');
      }, 2000);
    } else {
      /* ════ SUCCESS PATH — PHASE 2 ════ */
      setProgress(90);

      // Card border white flash + screen scanlines + star acceleration
      setTimeout(() => {
        setCardFlash(true);
        setScreenScanlines(true);
        setStarsAccelerate(true);
        setOrbSurge(true);
      }, 100);
      setTimeout(() => setCardFlash(false), 400);
      setTimeout(() => setScreenScanlines(false), 600);

      // Button turns green, pokeball explodes
      setTimeout(() => {
        setProgress(100);
        setAuthSuccess(true);
        setBtnText('BATTLE READY! ▶');
        setPokeballExploding(true);
      }, 500);

      // Signal to parent — hand off to App.jsx for Phase 3 (wipe)
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(username);
      }, 1300);
    }
  };

  const handleFocus = (field) => {
    setFocusFlash(p => ({ ...p, [field]: true }));
    setTimeout(() => setFocusFlash(p => ({ ...p, [field]: false })), 80);
  };

  const handleCheckboxToggle = () => {
    setCheckboxSpin(true);
    setTimeout(() => { setRememberMe(!rememberMe); setCheckboxSpin(false); }, 350);
  };

  // Compute field border color based on surge state
  const getFieldBorder = (field) => {
    if (errors[field]) return '#e63946';
    if (fieldSurge && !authFail) return authSuccess ? '#06d6a0' : '#ffd60a';
    return '#4361ee';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#050510', position: 'relative', overflow: 'hidden' }}>

      {/* ═══ GLOBAL STYLES ═══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Exo+2:wght@400;600;700&family=Share+Tech+Mono&display=swap');
        .form-input::placeholder { color: #3a3a5c; font-family: 'Exo 2', sans-serif; }
        .form-input:focus { outline: none; }
        @keyframes scanDown { 0% { transform: translateY(-100%); } 100% { transform: translateY(2000%); } }
        @keyframes gridPulse { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.07; } }
        @keyframes dashSpin { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes solidSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes auraPulse { 0%, 100% { transform: translate(-50%,-50%) scale(0.95); opacity: 0.6; } 50% { transform: translate(-50%,-50%) scale(1.15); opacity: 1; } }
        @keyframes sparkOrbit1 { from { transform: rotate(0deg) translateX(145px) rotate(0deg); } to { transform: rotate(360deg) translateX(145px) rotate(-360deg); } }
        @keyframes sparkOrbit2 { from { transform: rotate(0deg) translateX(155px) rotate(0deg); } to { transform: rotate(360deg) translateX(155px) rotate(-360deg); } }
        @keyframes sparkOrbit3 { from { transform: rotate(0deg) translateX(135px) rotate(0deg); } to { transform: rotate(360deg) translateX(135px) rotate(-360deg); } }
        @keyframes sparkOrbit4 { from { transform: rotate(0deg) translateX(160px) rotate(0deg); } to { transform: rotate(360deg) translateX(160px) rotate(-360deg); } }
        @keyframes sparkOrbit5 { from { transform: rotate(0deg) translateX(140px) rotate(0deg); } to { transform: rotate(360deg) translateX(140px) rotate(-360deg); } }
        @keyframes shimmerSweep { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes flickerGlow { 0%, 93%, 97%, 100% { text-shadow: 0 0 8px #ffd60a, 0 0 16px rgba(255,214,10,0.4); opacity: 1; } 94%, 96% { text-shadow: 0 0 2px #ffd60a; opacity: 0.7; } }
        @keyframes marqueeGlow { 0%, 100% { opacity: 0.6; box-shadow: 0 0 8px #4361ee; } 50% { opacity: 1; box-shadow: 0 0 16px #4361ee, 0 0 32px rgba(67,97,238,0.3); } }
        @keyframes diagonalStripes { 0% { background-position: 0 0; } 100% { background-position: 40px 0; } }
        @keyframes blinkSlow { 0%, 69% { opacity: 1; } 70%, 100% { opacity: 0.3; } }
        @keyframes separatorPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes mewtwoScan { 0% { top: -20%; opacity: 0; } 10% { opacity: 0.35; } 90% { opacity: 0.35; } 100% { top: 120%; opacity: 0; } }
        @keyframes screenScanFlash { 0% { top: -2px; opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } 100% { top: 100vh; opacity: 0; } }
        @media (max-width: 768px) {
          .split-container { flex-direction: column !important; }
          .left-panel { width: 100% !important; min-height: 160px !important; height: auto !important; padding: 30px 20px !important; border-right: none !important; border-bottom: 1px solid rgba(67,97,238,0.15) !important; }
          .right-panel { width: 100% !important; }
          .left-panel .pokeball-cage { transform: scale(0.45) !important; margin: -40px 0 !important; }
          .left-panel .title-block { display: none !important; }
          .left-panel .tagline-block { display: none !important; }
          .mobile-title { display: block !important; }
        }
      `}</style>

      {/* ═══ SCREEN-WIDE EFFECTS ═══ */}

      {/* Red flash overlay (error) */}
      <AnimatePresence>
        {screenRedFlash && (
          <motion.div key="red-flash"
            initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{ position: 'fixed', inset: 0, background: '#e63946', zIndex: 100, pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Screen-wide scanline flashes (Phase 2 success) */}
      <AnimatePresence>
        {screenScanlines && [0, 1, 2].map(i => (
          <motion.div key={`scanline-${i}`}
            initial={{ top: '-2px', opacity: 0 }}
            animate={{ top: '100vh', opacity: [0, 0.8, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.06, delay: i * 0.15 }}
            style={{ position: 'fixed', left: 0, right: 0, height: 2, background: '#fff', zIndex: 100, pointerEvents: 'none', boxShadow: '0 0 8px #fff' }}
          />
        ))}
      </AnimatePresence>

      {/* ═══ GLOBAL BACKGROUND ═══ */}
      <StarField accelerate={starsAccelerate} />
      <motion.div
        animate={orbSurge ? { scale: [1, 1.4, 1], opacity: [0.06, 0.15, 0.06] } : { scale: [1, 1.2, 1], x: [0, 40, 0], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: orbSurge ? 0.6 : 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-15%', left: '-15%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, #4361ee 0%, transparent 70%)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }}
      />
      <motion.div
        animate={orbSurge ? { scale: [1, 1.4, 1], opacity: [0.04, 0.12, 0.04] } : { scale: [1, 1.1, 1], x: [0, -40, 0], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: orbSurge ? 0.6 : 10, repeat: Infinity, ease: 'easeInOut', delay: orbSurge ? 0 : 2 }}
        style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, #e63946 0%, transparent 70%)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }}
      />

      {/* ═══ SPLIT LAYOUT ═══ */}
      <div className="split-container" style={{ display: 'flex', width: '100%', zIndex: 1 }}>

        {/* Vertical separator */}
        <div style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, width: '1px', zIndex: 5, background: 'linear-gradient(to bottom, transparent 5%, #4361ee 40%, #e63946 60%, transparent 95%)', animation: 'separatorPulse 3s ease-in-out infinite' }} className="separator-line" />

        {/* ╔═══════════════════════════════════╗
           ║       LEFT PANEL — BATTLE ARENA     ║
           ╚═══════════════════════════════════╝ */}
        <motion.div className="left-panel"
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}
          style={{ width: '40%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '50px 30px', background: 'rgba(5,5,16,0.7)', overflow: 'hidden' }}
        >
          {/* Scanlines */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)' }}/>
          {/* Pixel Grid */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: 'linear-gradient(rgba(67,97,238,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(67,97,238,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px', animation: 'gridPulse 6s ease-in-out infinite' }}/>

          {/* Corner Brackets */}
          {[{ top: 12, left: 12 }, { top: 12, right: 12 }, { bottom: 12, left: 12 }, { bottom: 12, right: 12 }].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos, width: 40, height: 40, zIndex: 3, pointerEvents: 'none',
              borderColor: '#4361ee', borderStyle: 'solid', borderWidth: 0,
              ...(i === 0 ? { borderTopWidth: 2, borderLeftWidth: 2 } : {}),
              ...(i === 1 ? { borderTopWidth: 2, borderRightWidth: 2 } : {}),
              ...(i === 2 ? { borderBottomWidth: 2, borderLeftWidth: 2 } : {}),
              ...(i === 3 ? { borderBottomWidth: 2, borderRightWidth: 2 } : {}),
              boxShadow: '0 0 8px rgba(67,97,238,0.4)',
            }}/>
          ))}

          {/* 3-ISB Badge */}
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 4, background: 'linear-gradient(135deg, rgba(67,97,238,0.15), rgba(67,97,238,0.05))', border: '1px solid rgba(67,97,238,0.5)', borderRadius: '20px', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmerSweep 4s ease-in-out infinite', boxShadow: '0 0 12px rgba(67,97,238,0.2)' }}>
            <svg viewBox="0 0 100 100" fill="none" style={{ width: 10, height: 10 }}>
              <circle cx="50" cy="50" r="48" fill="#e63946"/><circle cx="50" cy="50" r="6" fill="#ffd60a"/>
            </svg>
            <span style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#4361ee', textShadow: '0 0 8px rgba(67,97,238,0.6)' }}>3-ISB</span>
          </div>

          {/* POKÉBALL CENTERPIECE */}
          <div className="pokeball-cage" style={{ position: 'relative', width: 260, height: 260, zIndex: 3, marginBottom: 24 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(230,57,70,0.35) 0%, transparent 60%)', animation: 'auraPulse 3s ease-in-out infinite', pointerEvents: 'none' }}/>
            <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', border: '2px dashed rgba(67,97,238,0.4)', animation: `dashSpin ${screenScanlines ? '3s' : '12s'} linear infinite`, pointerEvents: 'none' }}/>
            <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(0,180,216,0.25)', animation: `solidSpin ${screenScanlines ? '1.5s' : '6s'} linear infinite`, pointerEvents: 'none' }}/>
            {[
              { anim: 'sparkOrbit1', dur: '3s', color: '#ffd60a' },
              { anim: 'sparkOrbit2', dur: '4.5s', color: '#4361ee' },
              { anim: 'sparkOrbit3', dur: '2.8s', color: '#e63946' },
              { anim: 'sparkOrbit4', dur: '5s', color: '#00b4d8' },
              { anim: 'sparkOrbit5', dur: '3.5s', color: '#ffd60a' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, animation: `${s.anim} ${s.dur} linear infinite` }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}`, marginTop: -2, marginLeft: -2 }}/>
              </div>
            ))}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              whileHover={{ rotate: [0, -8, 8, -5, 5, 0] }}
              style={{ position: 'absolute', inset: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', filter: 'drop-shadow(0 0 30px rgba(230,57,70,0.3))' }}
            >
              <PokeballSVG size={220} />
            </motion.div>
          </div>

          {/* Title */}
          <div className="title-block" style={{ textAlign: 'center', zIndex: 3, marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '18px', color: '#e2e8f0', lineHeight: 1.6, margin: 0, textShadow: '0 0 10px rgba(226,232,240,0.2)' }}>BATTLE ENGINE</h2>
            <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '18px', color: '#e63946', lineHeight: 1.6, margin: 0, textShadow: '0 0 12px rgba(230,57,70,0.4)' }}>
              SYSTEM<span style={{ animation: 'blink 1s step-end infinite', color: '#e63946' }}>█</span>
            </h2>
          </div>

          {/* Tagline */}
          <div className="tagline-block" style={{ zIndex: 3, minHeight: 24 }}>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: '14px', letterSpacing: '3px', color: '#ffd60a', textTransform: 'uppercase', ...(taglineDone ? { animation: 'flickerGlow 3s ease-in-out infinite' } : { textShadow: '0 0 6px #ffd60a' }) }}>
              {taglineText}{!taglineDone && <span style={{ animation: 'blink 0.5s step-end infinite' }}>_</span>}
            </span>
          </div>

          {/* Mobile only title */}
          <div className="mobile-title" style={{ display: 'none', zIndex: 3, textAlign: 'center' }}>
            <span style={{ fontFamily: 'Press Start 2P', fontSize: '11px', color: '#4361ee' }}>3-ISB </span>
            <span style={{ fontFamily: 'Press Start 2P', fontSize: '11px', color: '#e63946' }}>BATTLE ENGINE</span>
          </div>

          {/* Mewtwo Watermark */}
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 400, height: 400, opacity: 0.12, pointerEvents: 'none', zIndex: 2, background: 'url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png") no-repeat center/contain', filter: 'grayscale(100%) contrast(200%)' }}>
            <div style={{ position: 'absolute', inset: -40, background: 'radial-gradient(circle, rgba(114,9,183,0.15) 0%, transparent 60%)', pointerEvents: 'none' }}/>
            <div style={{ position: 'absolute', left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, rgba(67,97,238,0.6), transparent)', animation: 'mewtwoScan 3s linear infinite' }}/>
          </div>

          {/* Embers */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
            {[...Array(18)].map((_, i) => (
              <motion.div key={i}
                initial={{ y: '110%', opacity: 0, x: `${Math.random() * 100}%` }}
                animate={{ y: '-10%', opacity: [0, 0.7, 0] }}
                transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: 'linear', delay: Math.random() * 5 }}
                style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: '#ffd60a', boxShadow: '0 0 4px #ffd60a' }}
              />
            ))}
          </div>
        </motion.div>

        {/* ╔═══════════════════════════════════╗
           ║    RIGHT PANEL — ARCADE FORM        ║
           ╚═══════════════════════════════════╝ */}
        <motion.div className="right-panel"
          initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
          style={{ width: '60%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 30px' }}
        >
          <motion.div
            animate={shake ? { x: [0, -14, 14, -10, 10, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ width: '100%', maxWidth: 460, position: 'relative', background: '#080818', clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)', padding: '3px' }}
          >
            {/* Animated gradient border */}
            <motion.div
              animate={cardFlash ? { borderColor: ['#fff', '#fff', 'rgba(99,102,241,0.3)'], boxShadow: ['0 0 40px rgba(255,255,255,0.4)', '0 0 60px rgba(255,255,255,0.6)', '0 0 0px transparent'] } : {}}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0, clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)', border: `2px solid ${authSuccess ? '#06d6a0' : authFail ? '#e63946' : 'rgba(99,102,241,0.3)'}`, zIndex: 0, pointerEvents: 'none', transition: 'border-color 0.3s' }}
            />

            <div style={{ background: '#080818', position: 'relative', padding: '36px 32px 32px', clipPath: 'polygon(7px 0, calc(100% - 7px) 0, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px)' }}>
              {/* Marquee stripe */}
              <div style={{ position: 'absolute', top: 0, left: 8, right: 8, height: 3, background: authSuccess ? '#06d6a0' : '#4361ee', borderRadius: '0 0 2px 2px', animation: 'marqueeGlow 2s ease-in-out infinite', transition: 'background 0.3s' }}/>
              {/* Noise */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}/>
              {/* INSERT COIN */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontFamily: 'Press Start 2P', fontSize: '40px', color: 'rgba(67,97,238,0.03)', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: 8 }}>INSERT COIN</div>
              {/* PLAYER 1 */}
              <div style={{ position: 'absolute', top: 12, right: 16, fontFamily: 'Press Start 2P', fontSize: '8px', color: '#ffd60a', animation: 'blinkSlow 2s ease-in-out infinite', textShadow: '0 0 6px rgba(255,214,10,0.4)' }}>PLAYER 1</div>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, position: 'relative', height: 40 }}>
                  {/* Pokeball explosion fragments */}
                  <AnimatePresence>
                    {pokeballExploding && fragments.map((f, i) => (
                      <motion.div key={`frag-${i}`}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{ x: f.x, y: f.y, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{ position: 'absolute', top: 16, left: '50%', marginLeft: -3, width: f.size, height: f.size, background: f.color, borderRadius: 1, zIndex: 5 }}
                      />
                    ))}
                  </AnimatePresence>

                  <motion.div
                    animate={
                      authSuccess ? { scale: [1, 0, 1.2, 1], rotate: [0, 720] } :
                      loading ? { rotate: 360 } :
                      pokeballWobble ? { rotate: [0, -15, 15, -10, 10, -5, 5, 0] } :
                      {}
                    }
                    transition={
                      authSuccess ? { duration: 0.6 } :
                      loading ? { repeat: Infinity, duration: 0.3, ease: 'linear' } :
                      pokeballWobble ? { duration: 0.5 } :
                      {}
                    }
                    style={{
                      filter: loading
                        ? `drop-shadow(0 0 ${20 + progress * 0.3}px ${progress > 50 ? '#7209b7' : '#4361ee'})`
                        : authSuccess ? 'drop-shadow(0 0 16px #06d6a0)'
                        : 'drop-shadow(0 0 10px rgba(67,97,238,0.3))',
                    }}
                  >
                    {authSuccess && !pokeballExploding ? null : authSuccess ? null : <PokeballSVG size={40} />}
                    {authSuccess && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        style={{ width: 40, height: 40, borderRadius: '50%', background: '#06d6a0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(6,214,160,0.5)' }}
                      >
                        <Check size={24} color="#fff" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.div>
                </div>
                <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '15px', color: '#4361ee', margin: '0 0 10px', textShadow: '2px 2px 0 rgba(230,57,70,0.3), 0 0 12px rgba(67,97,238,0.4)' }}>3-ISB LOGIN</h1>
                <p style={{ fontFamily: 'Share Tech Mono', color: '#3a3a5c', fontSize: '13px', margin: 0, letterSpacing: 1 }}>ENTER YOUR TRAINER CREDENTIALS</p>
              </div>

              {/* FORM */}
              <form onSubmit={e => handleSubmit(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'relative', zIndex: 1 }}>

                {/* Username */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.username ? '#e63946' : getFieldBorder('username'), zIndex: 2, transition: 'color 0.3s' }}>
                    <User size={16} />
                  </div>
                  <input type="text" className="form-input" placeholder="Enter your username" value={username} disabled={loading}
                    onChange={e => { setUsername(e.target.value); setErrors(p => ({ ...p, username: false })); }}
                    onFocus={() => handleFocus('username')}
                    style={{ width: '100%', padding: '14px 14px 14px 42px', fontFamily: 'Exo 2', fontSize: 14, background: '#0a0a20', color: '#e2e8f0', border: 'none', borderLeft: `3px solid ${getFieldBorder('username')}`, borderRadius: 0, transition: 'all 0.3s', boxShadow: errors.username ? 'inset 0 0 10px rgba(230,57,70,0.1)' : fieldSurge && !authFail ? 'inset 0 0 8px rgba(255,214,10,0.08)' : 'none', opacity: loading ? 0.7 : 1 }}
                  />
                  {focusFlash.username && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}/>}
                </motion.div>

                {/* Password */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#e63946' : getFieldBorder('password'), zIndex: 2, transition: 'color 0.3s' }}>
                    <Lock size={16} />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={password} disabled={loading}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: false })); }}
                    onFocus={() => handleFocus('password')}
                    style={{ width: '100%', padding: '14px 44px 14px 42px', fontFamily: 'Exo 2', fontSize: 14, background: '#0a0a20', color: '#e2e8f0', border: 'none', borderLeft: `3px solid ${getFieldBorder('password')}`, borderRadius: 0, transition: 'all 0.3s', boxShadow: errors.password ? 'inset 0 0 10px rgba(230,57,70,0.1)' : fieldSurge && !authFail ? 'inset 0 0 8px rgba(255,214,10,0.08)' : 'none', opacity: loading ? 0.7 : 1 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#3a3a5c', cursor: 'pointer' }}>
                    {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                  {focusFlash.password && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}/>}
                </motion.div>

                {/* Error message */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#e63946', textAlign: 'center', textShadow: '0 0 8px rgba(230,57,70,0.4)' }}
                    >
                      {errorMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Remember Me */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={handleCheckboxToggle}>
                  <motion.div animate={checkboxSpin ? { rotate: 360 } : {}} transition={{ duration: 0.35 }}>
                    <PokeballCheckbox checked={rememberMe} />
                  </motion.div>
                  <span style={{ fontFamily: 'Exo 2', color: '#3a3a5c', fontSize: 13 }}>Remember this trainer</span>
                </motion.div>

                {/* ACTION BUTTONS */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 8 }}>

                  <motion.button
                    whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 24px rgba(67,97,238,0.5)' } : {}}
                    whileTap={!loading ? { scale: 0.94 } : {}}
                    type={isLogin ? 'submit' : 'button'}
                    onClick={isLogin ? undefined : (e) => handleSubmit(e, true)}
                    disabled={loading || authSuccess}
                    style={{
                      width: '100%', height: 56, position: 'relative', overflow: 'hidden',
                      border: authFail ? '1px solid #e63946' : authSuccess ? '1px solid #06d6a0' : '1px solid rgba(226,232,240,0.15)',
                      borderRadius: 0, background: authFail ? '#e63946' : authSuccess ? '#06d6a0' : 'linear-gradient(90deg, #4361ee, #7209b7)',
                      cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Press Start 2P', fontSize: 13, letterSpacing: 3,
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.3s, border-color 0.3s',
                    }}
                  >
                    {!authSuccess && !authFail && (
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 20px)', backgroundSize: '40px 40px', animation: `diagonalStripes ${loading ? '0.5s' : '2s'} linear infinite` }}/>
                    )}
                    {loading && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: `${progress}%`, transition: 'width 0.1s linear', background: authFail ? '#ff6b6b' : authSuccess ? '#06d6a0' : '#00b4d8', boxShadow: `0 0 8px ${authSuccess ? '#06d6a0' : '#00b4d8'}` }}/>
                    )}
                    <span style={{ position: 'relative', zIndex: 1 }}>
                      {btnText ? btnText : (
                        <><span style={{ animation: 'blink 1.2s step-end infinite', marginRight: 4 }}>▶</span>{isLogin ? 'LOGIN' : 'REGISTER'}</>
                      )}
                      {loading && !authSuccess && !authFail && (
                        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>...</motion.span>
                      )}
                    </span>
                  </motion.button>

                  {/* OR divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0', color: '#3a3a5c', fontFamily: 'Share Tech Mono', fontSize: 11 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(58,58,92,0.4)' }}/>
                    <svg viewBox="0 0 100 100" fill="none" style={{ width: 12, height: 12, flexShrink: 0 }}><circle cx="50" cy="50" r="48" stroke="#3a3a5c" strokeWidth="6" fill="none"/><line x1="2" y1="50" x2="98" y2="50" stroke="#3a3a5c" strokeWidth="6"/></svg>
                    <span>OR</span>
                    <svg viewBox="0 0 100 100" fill="none" style={{ width: 12, height: 12, flexShrink: 0 }}><circle cx="50" cy="50" r="48" stroke="#3a3a5c" strokeWidth="6" fill="none"/><line x1="2" y1="50" x2="98" y2="50" stroke="#3a3a5c" strokeWidth="6"/></svg>
                    <div style={{ flex: 1, height: 1, background: 'rgba(58,58,92,0.4)' }}/>
                  </div>

                  {/* Toggle button */}
                  <motion.button type="button"
                    whileHover={{ borderColor: '#4361ee', background: 'rgba(67,97,238,0.05)', boxShadow: '0 0 12px rgba(67,97,238,0.2)' }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => { setIsLogin(!isLogin); setErrors({ username: false, password: false }); setBtnText(null); setAuthFail(false); setErrorMessage(''); }}
                    disabled={loading}
                    style={{ width: '100%', height: 48, border: '2px dashed #3a3a5c', borderRadius: 0, background: 'transparent', color: '#4361ee', fontFamily: 'Press Start 2P', fontSize: 9, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.3s' }}
                  >
                    {isLogin ? '⊕ NEW TRAINER? REGISTER' : '◀ BACK TO LOGIN'}
                  </motion.button>
                </motion.div>

                {/* Forgot */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: 'center', marginTop: 4 }}>
                  <motion.a href="#" whileHover={{ letterSpacing: '3px' }} style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#3a3a5c', textDecoration: 'none', letterSpacing: 1, transition: 'all 0.3s' }}>
                    <span style={{ textShadow: '0 0 4px rgba(67,97,238,0.2)' }}>[ FORGOT PASSWORD? ]</span>
                  </motion.a>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
