import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Check, Users } from 'lucide-react';
import { supabase } from '../db.js';
import { useToast } from './Toast.jsx';

/* ═══════════════════════════════════════
   THEME DEFINITIONS
   ═══════════════════════════════════════ */
const THEMES = {
  login: {
    primary: '#4361ee', secondary: '#7209b7', glow: 'rgba(67,97,238,0.5)',
    cardBg: '#080818', gridTint: 'rgba(67,97,238,0.05)', bracketColor: '#4361ee',
    orb1: '#4361ee', orb2: '#7209b7',
    silhouetteId: '150', // Mewtwo
    badge: 'PLAYER 1', badgePulse: '2s',
    title: '3-ISB LOGIN', subtitle: 'ENTER YOUR TRAINER CREDENTIALS',
    taglineColor: '#ffd60a', taglineSpeed: 60,
    spinDir: 1, // clockwise
    btnGrad: 'linear-gradient(90deg, #4361ee, #7209b7)',
    toggleText: '⊕ NEW TRAINER? REGISTER', toggleBorder: '#4361ee',
    sepGrad: 'linear-gradient(to bottom, transparent 5%, #4361ee 40%, #7209b7 60%, transparent 95%)',
    sparkColors: ['#4361ee', '#00b4d8', '#4361ee', '#7209b7', '#4361ee'],
    scanTint: 'rgba(67,97,238,0.02)',
    marqueeColor: '#4361ee',
    auroraBg: 'rgba(67,97,238,0.15)',
  },
  register: {
    primary: '#e63946', secondary: '#fb8500', glow: 'rgba(230,57,70,0.5)',
    cardBg: '#100808', gridTint: 'rgba(230,57,70,0.05)', bracketColor: '#e63946',
    orb1: '#e63946', orb2: '#fb8500',
    silhouetteId: '6', // Charizard
    badge: 'NEW TRAINER', badgePulse: '1.2s',
    title: '3-ISB REGISTER', subtitle: 'CREATE YOUR TRAINER PROFILE',
    taglineColor: '#fb8500', taglineSpeed: 45,
    spinDir: -1, // counter-clockwise
    btnGrad: 'linear-gradient(90deg, #e63946, #fb8500)',
    toggleText: '◀ BACK TO LOGIN', toggleBorder: '#e63946',
    sepGrad: 'linear-gradient(to bottom, transparent 5%, #e63946 40%, #fb8500 60%, transparent 95%)',
    sparkColors: ['#e63946', '#fb8500', '#e63946', '#ff6b6b', '#fb8500'],
    scanTint: 'rgba(230,57,70,0.02)',
    marqueeColor: '#e63946',
    auroraBg: 'rgba(230,57,70,0.15)',
  },
};

/* ═══════════════════════════════════════
   POKÉBALL SVGs
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

const FireBallSVG = ({ size = 40 }) => (
  <svg viewBox="0 0 100 100" fill="none" style={{ width: size, height: size }}>
    <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#b71c1c"/>
    <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#1a0a0a"/>
    <circle cx="50" cy="50" r="48" stroke="#e63946" strokeWidth="3" fill="none"/>
    <line x1="2" y1="50" x2="98" y2="50" stroke="#fb8500" strokeWidth="3"/>
    <circle cx="50" cy="50" r="14" fill="#1a0a0a" stroke="#e63946" strokeWidth="3"/>
    <circle cx="50" cy="50" r="6" fill="#fb8500"/>
  </svg>
);

const PokeballCheckbox = ({ checked, color = '#4361ee' }) => (
  <svg viewBox="0 0 100 100" fill="none" style={{ width: 18, height: 18 }}>
    {checked ? (
      <>
        <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946"/>
        <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#e2e8f0"/>
        <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="5" fill="none"/>
        <line x1="2" y1="50" x2="98" y2="50" stroke={color} strokeWidth="5"/>
        <circle cx="50" cy="50" r="12" fill="#1a1a3a" stroke={color} strokeWidth="5"/>
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
    setDisplayed(''); setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++; setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return { displayed, done };
}

/* ═══════════════════════════════════════
   STAR FIELD
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
  const [slideDir, setSlideDir] = useState(0);

  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [section, setSection] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Animation states
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({});
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authFail, setAuthFail] = useState(false);
  const [btnText, setBtnText] = useState(null);
  const [progress, setProgress] = useState(0);
  const [checkboxSpin, setCheckboxSpin] = useState(false);
  const [focusFlash, setFocusFlash] = useState({});
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
  const t = isLogin ? THEMES.login : THEMES.register;
  const { displayed: taglineText, done: taglineDone } = useTypewriter('PREDICT. COUNTER. DOMINATE.', t.taglineSpeed, 1200);

  const fragments = useRef([...Array(14)].map((_, i) => {
    const angle = (i / 14) * 360 * (Math.PI / 180);
    const dist = 60 + Math.random() * 50;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, size: 4 + Math.random() * 4 };
  })).current;

  const triggerError = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const validateForm = () => {
    const e = {};
    if (username.length < 3 || username.length > 40) e.username = true;
    if (password.length < 6) e.password = true;
    if (!isLogin) {
      if (confirmPassword !== password) e.confirm = true;
    }
    setErrors(e);
    if (Object.keys(e).length > 0) { triggerError(); return false; }
    return true;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) return;
    setLoading(true); setAuthFail(false); setErrorMessage('');
    setBtnText(isLogin ? 'AUTHENTICATING' : 'REGISTERING');
    setFieldSurge(true);

    let p = 0;
    const iv = setInterval(() => { p += 1.5; if (p > 85) clearInterval(iv); setProgress(p); }, 30);

    const fn = isLogin ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const safeUsername = username.trim();
    const emailFormat = safeUsername.includes('@') ? safeUsername : `${safeUsername}@pokemon-day.com`;
    const opts = isLogin ? { email: emailFormat, password } : {
      email: emailFormat, password,
      options: { data: { section: section || null } },
    };
    const { error } = await fn.call(supabase.auth, opts);
    clearInterval(iv);

    if (error) {
      setProgress(100); setErrors({ username: true, password: true });
      setAuthFail(true); setBtnText('ACCESS DENIED ✗');
      setScreenRedFlash(true); setPokeballWobble(true);
      setPassword(''); setConfirmPassword('');
      let msg = error.message || 'INVALID TRAINER CREDENTIALS';
      msg = msg.replace(emailFormat, safeUsername);
      msg = msg.replace(/email address/ig, 'username');
      msg = msg.replace(/email/ig, 'username');

      setErrorMessage(`⚠ ${msg.toUpperCase()}`);
      triggerError(); addToast(msg, 'error');
      setTimeout(() => setScreenRedFlash(false), 200);
      setTimeout(() => setPokeballWobble(false), 600);
      setTimeout(() => { setLoading(false); setBtnText(null); setProgress(0); setAuthFail(false); setFieldSurge(false); setErrorMessage(''); }, 2000);
    } else {
      setProgress(90);
      setTimeout(() => { setCardFlash(true); setScreenScanlines(true); setStarsAccelerate(true); setOrbSurge(true); }, 100);
      setTimeout(() => setCardFlash(false), 400);
      setTimeout(() => setScreenScanlines(false), 600);
      setTimeout(() => { setProgress(100); setAuthSuccess(true); setBtnText('BATTLE READY! ▶'); setPokeballExploding(true); }, 500);
      setTimeout(() => { if (onLoginSuccess) onLoginSuccess(username); }, 1300);
    }
  };

  const switchMode = (toLogin) => {
    setSlideDir(toLogin ? -1 : 1);
    setIsLogin(toLogin);
    setErrors({}); setBtnText(null); setAuthFail(false); setErrorMessage('');
    setPassword(''); setConfirmPassword(''); setSection('');
  };

  const handleFocus = (field) => { setFocusFlash(p => ({ ...p, [field]: true })); setTimeout(() => setFocusFlash(p => ({ ...p, [field]: false })), 80); };
  const handleCheckboxToggle = () => { setCheckboxSpin(true); setTimeout(() => { setRememberMe(!rememberMe); setCheckboxSpin(false); }, 350); };
  const getFieldBorder = (field) => errors[field] ? '#e63946' : fieldSurge && !authFail ? (authSuccess ? '#06d6a0' : '#ffd60a') : t.primary;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#050510', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Exo+2:wght@400;600;700&family=Share+Tech+Mono&display=swap');
        .form-input::placeholder { color: #3a3a5c; font-family: 'Exo 2', sans-serif; }
        .form-input:focus { outline: none; }
        @keyframes gridPulse { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.07; } }
        @keyframes auraPulse { 0%, 100% { transform: translate(-50%,-50%) scale(0.95); opacity: 0.6; } 50% { transform: translate(-50%,-50%) scale(1.15); opacity: 1; } }
        @keyframes sparkOrbit1 { from { transform: rotate(0deg) translateX(145px) rotate(0deg); } to { transform: rotate(360deg) translateX(145px) rotate(-360deg); } }
        @keyframes sparkOrbit2 { from { transform: rotate(0deg) translateX(155px) rotate(0deg); } to { transform: rotate(360deg) translateX(155px) rotate(-360deg); } }
        @keyframes sparkOrbit3 { from { transform: rotate(0deg) translateX(135px) rotate(0deg); } to { transform: rotate(360deg) translateX(135px) rotate(-360deg); } }
        @keyframes sparkOrbit4 { from { transform: rotate(0deg) translateX(160px) rotate(0deg); } to { transform: rotate(360deg) translateX(160px) rotate(-360deg); } }
        @keyframes sparkOrbit5 { from { transform: rotate(0deg) translateX(140px) rotate(0deg); } to { transform: rotate(360deg) translateX(140px) rotate(-360deg); } }
        @keyframes shimmerSweep { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes flickerGlow { 0%, 93%, 97%, 100% { opacity: 1; } 94%, 96% { opacity: 0.7; } }
        @keyframes marqueeGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes diagonalStripes { 0% { background-position: 0 0; } 100% { background-position: 40px 0; } }
        @keyframes blinkSlow { 0%, 69% { opacity: 1; } 70%, 100% { opacity: 0.3; } }
        @keyframes separatorPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes mewtwoScan { 0% { top: -20%; opacity: 0; } 10% { opacity: 0.35; } 90% { opacity: 0.35; } 100% { top: 120%; opacity: 0; } }
        @media (max-width: 768px) {
          .split-container { flex-direction: column !important; }
          .left-panel { width: 100% !important; min-height: 160px !important; height: auto !important; padding: 30px 20px !important; }
          .right-panel { width: 100% !important; }
          .left-panel .pokeball-cage { transform: scale(0.45) !important; margin: -40px 0 !important; }
          .left-panel .title-block, .left-panel .tagline-block { display: none !important; }
          .mobile-title { display: block !important; }
        }
      `}</style>

      {/* Screen effects */}
      <AnimatePresence>
        {screenRedFlash && <motion.div key="rf" initial={{ opacity: 0 }} animate={{ opacity: 0.08 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} style={{ position: 'fixed', inset: 0, background: '#e63946', zIndex: 100, pointerEvents: 'none' }}/>}
      </AnimatePresence>
      <AnimatePresence>
        {screenScanlines && [0,1,2].map(i => (
          <motion.div key={`sl-${i}`} initial={{ top: '-2px', opacity: 0 }} animate={{ top: '100vh', opacity: [0,0.8,0.8,0] }} exit={{ opacity: 0 }} transition={{ duration: 0.06, delay: i * 0.15 }} style={{ position: 'fixed', left: 0, right: 0, height: 2, background: '#fff', zIndex: 100, pointerEvents: 'none', boxShadow: '0 0 8px #fff' }}/>
        ))}
      </AnimatePresence>

      {/* Background */}
      <StarField accelerate={starsAccelerate} />
      <motion.div animate={orbSurge ? { scale: [1,1.4,1], opacity: [0.06,0.15,0.06] } : { scale: [1,1.2,1], x: [0,40,0], opacity: [0.06,0.1,0.06] }} transition={{ duration: orbSurge ? 0.6 : 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-15%', left: '-15%', width: '50vw', height: '50vw', background: `radial-gradient(circle, ${t.orb1} 0%, transparent 70%)`, filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, transition: 'background 0.6s' }}/>
      <motion.div animate={orbSurge ? { scale: [1,1.4,1], opacity: [0.04,0.12,0.04] } : { scale: [1,1.1,1], x: [0,-40,0], opacity: [0.04,0.08,0.04] }} transition={{ duration: orbSurge ? 0.6 : 10, repeat: Infinity, ease: 'easeInOut', delay: orbSurge ? 0 : 2 }}
        style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: '55vw', height: '55vw', background: `radial-gradient(circle, ${t.orb2} 0%, transparent 70%)`, filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, transition: 'background 0.6s' }}/>

      {/* Split layout */}
      <div className="split-container" style={{ display: 'flex', width: '100%', zIndex: 1 }}>
        {/* Separator */}
        <div style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, width: '1px', zIndex: 5, background: t.sepGrad, animation: 'separatorPulse 3s ease-in-out infinite', transition: 'background 0.4s' }} className="separator-line"/>

        {/* ══ LEFT PANEL ══ */}
        <motion.div className="left-panel" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}
          style={{ width: '40%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '50px 30px', background: 'rgba(5,5,16,0.7)', overflow: 'hidden' }}>
          {/* Scanlines */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${t.scanTint} 2px, ${t.scanTint} 4px)`, transition: 'background-image 0.4s' }}/>
          {/* Pixel grid */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1, backgroundImage: `linear-gradient(${t.gridTint} 1px, transparent 1px), linear-gradient(90deg, ${t.gridTint} 1px, transparent 1px)`, backgroundSize: '32px 32px', animation: 'gridPulse 6s ease-in-out infinite' }}/>

          {/* Corner brackets */}
          {[{ top: 12, left: 12 }, { top: 12, right: 12 }, { bottom: 12, left: 12 }, { bottom: 12, right: 12 }].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos, width: 40, height: 40, zIndex: 3, pointerEvents: 'none',
              borderColor: t.bracketColor, borderStyle: 'solid', borderWidth: 0, transition: 'border-color 0.4s',
              ...(i === 0 ? { borderTopWidth: 2, borderLeftWidth: 2 } : {}), ...(i === 1 ? { borderTopWidth: 2, borderRightWidth: 2 } : {}),
              ...(i === 2 ? { borderBottomWidth: 2, borderLeftWidth: 2 } : {}), ...(i === 3 ? { borderBottomWidth: 2, borderRightWidth: 2 } : {}),
              boxShadow: `0 0 8px ${t.glow}`,
            }}/>
          ))}

          {/* 3-ISB Badge */}
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 4, background: t.auroraBg, border: `1px solid ${t.primary}50`, borderRadius: '20px', padding: '5px 14px', display: 'flex', alignItems: 'center', gap: 6, backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmerSweep 4s ease-in-out infinite', boxShadow: `0 0 12px ${t.glow}`, transition: 'all 0.4s' }}>
            <svg viewBox="0 0 100 100" fill="none" style={{ width: 10, height: 10 }}><circle cx="50" cy="50" r="48" fill="#e63946"/><circle cx="50" cy="50" r="6" fill="#ffd60a"/></svg>
            <span style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: t.primary, textShadow: `0 0 8px ${t.glow}`, transition: 'color 0.4s' }}>3-ISB</span>
          </div>

          {/* Pokeball centerpiece */}
          <div className="pokeball-cage" style={{ position: 'relative', width: 260, height: 260, zIndex: 3, marginBottom: 24 }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: 280, height: 280, background: `radial-gradient(circle, ${t.primary}40 0%, transparent 60%)`, animation: 'auraPulse 3s ease-in-out infinite', pointerEvents: 'none', transition: 'background 0.4s' }}/>
            {/* Dashed ring */}
            <motion.div animate={{ rotate: t.spinDir * -360 }} transition={{ duration: screenScanlines ? 3 : 12, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: -15, borderRadius: '50%', border: `2px dashed ${t.primary}66`, pointerEvents: 'none', transition: 'border-color 0.4s' }}/>
            {/* Solid ring */}
            <motion.div animate={{ rotate: t.spinDir * 360 }} transition={{ duration: screenScanlines ? 1.5 : 6, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `1px solid ${t.secondary}40`, pointerEvents: 'none', transition: 'border-color 0.4s' }}/>
            {/* Sparks */}
            {['sparkOrbit1','sparkOrbit2','sparkOrbit3','sparkOrbit4','sparkOrbit5'].map((anim, i) => (
              <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, animation: `${anim} ${[3,4.5,2.8,5,3.5][i]}s linear infinite` }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: t.sparkColors[i], boxShadow: `0 0 6px ${t.sparkColors[i]}`, marginTop: -2, marginLeft: -2, transition: 'background 0.4s, box-shadow 0.4s' }}/>
              </div>
            ))}
            {/* Ball */}
            <motion.div animate={{ rotate: t.spinDir * 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} whileHover={{ rotate: [0, -8, 8, -5, 5, 0] }}
              style={{ position: 'absolute', inset: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', filter: `drop-shadow(0 0 30px ${t.primary}50)` }}>
              <PokeballSVG size={220} />
            </motion.div>
          </div>

          {/* Title */}
          <div className="title-block" style={{ textAlign: 'center', zIndex: 3, marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '18px', color: '#e2e8f0', lineHeight: 1.6, margin: 0, textShadow: '0 0 10px rgba(226,232,240,0.2)' }}>BATTLE ENGINE</h2>
            <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '18px', color: t.primary, lineHeight: 1.6, margin: 0, textShadow: `0 0 12px ${t.glow}`, transition: 'color 0.4s' }}>
              SYSTEM<span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
            </h2>
          </div>

          {/* Tagline */}
          <div className="tagline-block" style={{ zIndex: 3, minHeight: 24 }}>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: '14px', letterSpacing: '3px', color: t.taglineColor, textTransform: 'uppercase', textShadow: `0 0 8px ${t.taglineColor}`, transition: 'color 0.4s', ...(taglineDone ? { animation: 'flickerGlow 3s ease-in-out infinite' } : {}) }}>
              {taglineText}{!taglineDone && <span style={{ animation: 'blink 0.5s step-end infinite' }}>_</span>}
            </span>
          </div>

          <div className="mobile-title" style={{ display: 'none', zIndex: 3, textAlign: 'center' }}>
            <span style={{ fontFamily: 'Press Start 2P', fontSize: '11px', color: t.primary }}>{isLogin ? '3-ISB LOGIN' : '3-ISB REGISTER'}</span>
          </div>

          {/* Silhouette — Mewtwo or Charizard */}
          <AnimatePresence mode="wait">
            <motion.div key={t.silhouetteId}
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 0.12, y: 0 }} exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'absolute', bottom: -30, left: -30, width: 400, height: 400, pointerEvents: 'none', zIndex: 2, background: `url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${t.silhouetteId}.png") no-repeat center/contain`, filter: 'grayscale(100%) contrast(200%)' }}>
              <div style={{ position: 'absolute', inset: -40, background: `radial-gradient(circle, ${t.secondary}25 0%, transparent 60%)`, pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${t.primary}99, transparent)`, animation: 'mewtwoScan 3s linear infinite' }}/>
            </motion.div>
          </AnimatePresence>

          {/* Embers */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2 }}>
            {[...Array(18)].map((_, i) => (
              <motion.div key={i} initial={{ y: '110%', opacity: 0, x: `${Math.random() * 100}%` }} animate={{ y: '-10%', opacity: [0, 0.7, 0] }} transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: 'linear', delay: Math.random() * 5 }}
                style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: isLogin ? '#ffd60a' : '#fb8500', boxShadow: `0 0 4px ${isLogin ? '#ffd60a' : '#fb8500'}`, transition: 'background 0.4s' }}/>
            ))}
          </div>
        </motion.div>

        {/* ══ RIGHT PANEL ══ */}
        <motion.div className="right-panel" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6, type: 'spring', damping: 20 }}
          style={{ width: '60%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 30px' }}>
          <motion.div animate={shake ? { x: [0,-14,14,-10,10,-6,6,-3,3,0] } : {}} transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ width: '100%', maxWidth: 460, position: 'relative', background: t.cardBg, clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)', padding: '3px', transition: 'background 0.4s' }}>

            {/* Border */}
            <motion.div animate={cardFlash ? { borderColor: ['#fff','#fff','rgba(99,102,241,0.3)'], boxShadow: ['0 0 40px rgba(255,255,255,0.4)','0 0 60px rgba(255,255,255,0.6)','0 0 0px transparent'] } : {}} transition={{ duration: 0.3 }}
              style={{ position: 'absolute', inset: 0, clipPath: 'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)', border: `2px solid ${authSuccess ? '#06d6a0' : authFail ? '#e63946' : t.primary + '50'}`, zIndex: 0, pointerEvents: 'none', transition: 'border-color 0.4s' }}/>

            <div style={{ background: t.cardBg, position: 'relative', padding: '36px 32px 32px', clipPath: 'polygon(7px 0, calc(100% - 7px) 0, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px)', transition: 'background 0.4s', overflow: 'hidden' }}>
              {/* Marquee */}
              <div style={{ position: 'absolute', top: 0, left: 8, right: 8, height: 3, background: authSuccess ? '#06d6a0' : t.marqueeColor, borderRadius: '0 0 2px 2px', animation: 'marqueeGlow 2s ease-in-out infinite', transition: 'background 0.4s', boxShadow: `0 0 12px ${t.marqueeColor}` }}/>
              {/* Noise */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}/>
              {/* INSERT COIN */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-30deg)', fontFamily: 'Press Start 2P', fontSize: '40px', color: `${t.primary}08`, whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: 8, transition: 'color 0.4s' }}>INSERT COIN</div>

              {/* Badge */}
              <div style={{ position: 'absolute', top: 12, right: 16, fontFamily: 'Press Start 2P', fontSize: '8px', color: t.primary, animation: `blinkSlow ${t.badgePulse} ease-in-out infinite`, textShadow: `0 0 6px ${t.glow}`, transition: 'color 0.4s' }}>{t.badge}</div>

              {/* ── CARD CONTENT (animated swap) ── */}
              <AnimatePresence mode="wait">
                <motion.div key={isLogin ? 'login' : 'register'}
                  initial={{ x: slideDir * 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -slideDir * 80, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}>

                  {/* Header */}
                  <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, position: 'relative', height: 40 }}>
                      <AnimatePresence>
                        {pokeballExploding && fragments.map((f, i) => (
                          <motion.div key={`f-${i}`} initial={{ x: 0, y: 0, scale: 1, opacity: 1 }} animate={{ x: f.x, y: f.y, scale: 0, opacity: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{ position: 'absolute', top: 16, left: '50%', marginLeft: -3, width: f.size, height: f.size, background: t.sparkColors[i % 5], borderRadius: 1, zIndex: 5 }}/>
                        ))}
                      </AnimatePresence>
                      <motion.div
                        animate={authSuccess ? { scale: [1,0,1.2,1], rotate: [0,720] } : loading ? { rotate: 360 } : pokeballWobble ? { rotate: [0,-15,15,-10,10,-5,5,0] } : {}}
                        transition={authSuccess ? { duration: 0.6 } : loading ? { repeat: Infinity, duration: 0.3, ease: 'linear' } : pokeballWobble ? { duration: 0.5 } : {}}
                        style={{ filter: authSuccess ? 'drop-shadow(0 0 16px #06d6a0)' : `drop-shadow(0 0 10px ${t.glow})` }}>
                        {authSuccess ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                            style={{ width: 40, height: 40, borderRadius: '50%', background: '#06d6a0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(6,214,160,0.5)' }}>
                            <Check size={24} color="#fff" strokeWidth={3}/>
                          </motion.div>
                        ) : isLogin ? <PokeballSVG size={40}/> : <FireBallSVG size={40}/>}
                      </motion.div>
                    </div>
                    <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '15px', color: t.primary, margin: '0 0 10px', textShadow: `2px 2px 0 ${t.secondary}50, 0 0 12px ${t.glow}` }}>{t.title}</h1>
                    <p style={{ fontFamily: 'Share Tech Mono', color: '#3a3a5c', fontSize: '13px', margin: 0, letterSpacing: 1 }}>{t.subtitle}</p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
                    {/* Username */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: getFieldBorder('username'), zIndex: 2, transition: 'color 0.3s' }}><User size={16}/></div>
                      <input type="text" className="form-input" placeholder="Enter your username" value={username} disabled={loading}
                        onChange={e => { setUsername(e.target.value); setErrors(p => ({ ...p, username: false })); }} onFocus={() => handleFocus('username')}
                        style={{ width: '100%', padding: '14px 14px 14px 42px', fontFamily: 'Exo 2', fontSize: 14, background: '#0a0a20', color: '#e2e8f0', border: 'none', borderLeft: `3px solid ${getFieldBorder('username')}`, borderRadius: 0, transition: 'all 0.3s', opacity: loading ? 0.7 : 1 }}/>
                      {focusFlash.username && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}/>}
                    </motion.div>

                    {/* Password */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: getFieldBorder('password'), zIndex: 2, transition: 'color 0.3s' }}><Lock size={16}/></div>
                      <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Enter your password" value={password} disabled={loading}
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: false })); }} onFocus={() => handleFocus('password')}
                        style={{ width: '100%', padding: '14px 44px 14px 42px', fontFamily: 'Exo 2', fontSize: 14, background: '#0a0a20', color: '#e2e8f0', border: 'none', borderLeft: `3px solid ${getFieldBorder('password')}`, borderRadius: 0, transition: 'all 0.3s', opacity: loading ? 0.7 : 1 }}/>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#3a3a5c', cursor: 'pointer' }}>
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                      {focusFlash.password && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }}/>}
                    </motion.div>

                    {/* Register-only fields */}
                    {!isLogin && (
                      <>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: errors.confirm ? '#e63946' : t.primary, zIndex: 2 }}><Lock size={16}/></div>
                          <input type={showConfirm ? 'text' : 'password'} className="form-input" placeholder="Confirm your password" value={confirmPassword} disabled={loading}
                            onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirm: false })); }} onFocus={() => handleFocus('confirm')}
                            style={{ width: '100%', padding: '14px 44px 14px 42px', fontFamily: 'Exo 2', fontSize: 14, background: '#0a0a20', color: '#e2e8f0', border: 'none', borderLeft: `3px solid ${errors.confirm ? '#e63946' : t.primary}`, borderRadius: 0, transition: 'all 0.3s', opacity: loading ? 0.7 : 1 }}/>
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#3a3a5c', cursor: 'pointer' }}>
                            {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} style={{ position: 'relative' }}>
                          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: t.primary, zIndex: 2 }}><Users size={16}/></div>
                          <input type="text" className="form-input" placeholder="Section / Group (optional)" value={section} disabled={loading}
                            onChange={e => setSection(e.target.value)}
                            style={{ width: '100%', padding: '14px 14px 14px 42px', fontFamily: 'Exo 2', fontSize: 14, background: '#0a0a20', color: '#e2e8f0', border: 'none', borderLeft: `3px solid ${t.primary}`, borderRadius: 0, transition: 'all 0.3s', opacity: loading ? 0.7 : 1 }}/>
                        </motion.div>
                      </>
                    )}

                    {/* Error message */}
                    <AnimatePresence>
                      {errorMessage && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                          style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#e63946', textAlign: 'center', textShadow: '0 0 8px rgba(230,57,70,0.4)' }}>{errorMessage}</motion.div>
                      )}
                    </AnimatePresence>

                    {/* Remember */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isLogin ? 0.24 : 0.4 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={handleCheckboxToggle}>
                      <motion.div animate={checkboxSpin ? { rotate: 360 } : {}} transition={{ duration: 0.35 }}><PokeballCheckbox checked={rememberMe} color={t.primary}/></motion.div>
                      <span style={{ fontFamily: 'Exo 2', color: '#3a3a5c', fontSize: 13 }}>Remember this trainer</span>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: isLogin ? 0.32 : 0.48 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: 4 }}>
                      <motion.button whileHover={!loading ? { scale: 1.02, boxShadow: `0 0 24px ${t.glow}` } : {}} whileTap={!loading ? { scale: 0.94 } : {}}
                        type="submit" disabled={loading || authSuccess}
                        style={{ width: '100%', height: 56, position: 'relative', overflow: 'hidden', border: authFail ? '1px solid #e63946' : authSuccess ? '1px solid #06d6a0' : `1px solid rgba(226,232,240,0.15)`, borderRadius: 0, background: authFail ? '#e63946' : authSuccess ? '#06d6a0' : t.btnGrad, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Press Start 2P', fontSize: 13, letterSpacing: 3, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.3s, border-color 0.3s' }}>
                        {!authSuccess && !authFail && <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 20px)', backgroundSize: '40px 40px', animation: `diagonalStripes ${loading ? '0.5s' : '2s'} linear infinite` }}/>}
                        {loading && <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: `${progress}%`, transition: 'width 0.1s linear', background: authFail ? '#ff6b6b' : authSuccess ? '#06d6a0' : '#00b4d8', boxShadow: `0 0 8px ${authSuccess ? '#06d6a0' : '#00b4d8'}` }}/>}
                        <span style={{ position: 'relative', zIndex: 1 }}>
                          {btnText || (<><span style={{ animation: 'blink 1.2s step-end infinite', marginRight: 4 }}>▶</span>{isLogin ? 'LOGIN' : 'REGISTER'}</>)}
                          {loading && !authSuccess && !authFail && <motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 0.8, repeat: Infinity }}>...</motion.span>}
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
                        whileHover={{ borderColor: t.primary, background: `${t.primary}0D`, boxShadow: `0 0 12px ${t.glow}` }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => switchMode(!isLogin)} disabled={loading}
                        style={{ width: '100%', height: 48, border: `2px dashed ${t.toggleBorder}50`, borderRadius: 0, background: 'transparent', color: t.primary, fontFamily: 'Press Start 2P', fontSize: 9, letterSpacing: 1, cursor: 'pointer', transition: 'all 0.3s' }}>
                        {t.toggleText}
                      </motion.button>
                    </motion.div>

                    {/* Forgot */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: 'center', marginTop: 4 }}>
                      <motion.a href="#" whileHover={{ letterSpacing: '3px' }} style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#3a3a5c', textDecoration: 'none', letterSpacing: 1, transition: 'all 0.3s' }}>
                        <span style={{ textShadow: `0 0 4px ${t.primary}33` }}>[ FORGOT PASSWORD? ]</span>
                      </motion.a>
                    </motion.div>
                  </form>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
