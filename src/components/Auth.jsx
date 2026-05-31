import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../db.js';
import { useToast } from './Toast.jsx';

// Pokeball SVG component
const PokeballLogo = ({ size = 60, spinning = false }) => (
  <motion.svg 
    viewBox="0 0 100 100" 
    fill="none" 
    style={{ width: size, height: size }}
    animate={spinning ? { rotate: 360 } : { rotate: 0 }}
    transition={spinning ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
  >
    <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946"/>
    <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#1a1a3a"/>
    <circle cx="50" cy="50" r="48" stroke="#4361ee" strokeWidth="4" fill="none"/>
    <line x1="2" y1="50" x2="98" y2="50" stroke="#4361ee" strokeWidth="4"/>
    <circle cx="50" cy="50" r="14" fill="#1a1a3a" stroke="#4361ee" strokeWidth="4"/>
    <circle cx="50" cy="50" r="6" fill="#ffd60a"/>
  </motion.svg>
);

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLoginState, setIsLoginState] = useState(true);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Validation / Error State
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({ username: false, password: false });
  const [authSuccess, setAuthSuccess] = useState(false);
  
  const { addToast } = useToast();

  const triggerError = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validateForm = () => {
    const newErrors = { username: false, password: false };
    let valid = true;
    
    if (username.length < 3 || username.length > 20) {
      newErrors.username = true;
      valid = false;
    }
    if (password.length < 6) {
      newErrors.password = true;
      valid = false;
    }
    
    setErrors(newErrors);
    if (!valid) triggerError();
    return valid;
  };

  const handleSubmit = async (e, isRegistering = false) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    let authError = null;

    if (isRegistering) {
      const { error } = await supabase.auth.signUp({ email: username, password });
      authError = error;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: username, password });
      authError = error;
    }

    if (authError) {
      setErrors({ username: true, password: true });
      triggerError();
      addToast(authError.message, 'error');
      setLoading(false);
    } else {
      setAuthSuccess(true);
      // Wait a moment for success animation before redirect happens implicitly via App.jsx session state change
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#050510',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Texture & Orbs */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.8, pointerEvents: 'none'
      }} />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(67,97,238,0.15) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none'
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2], x: [0, -50, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 70%)',
          filter: 'blur(100px)', pointerEvents: 'none'
        }}
      />

      <style>{`
        @media (max-width: 768px) {
          .split-container { flex-direction: column !important; }
          .left-panel { width: 100% !important; height: 30vh !important; border-right: none !important; border-bottom: 1px solid rgba(67,97,238,0.2) !important; }
          .right-panel { width: 100% !important; }
        }
        .form-input::placeholder { color: #64748b; }
      `}</style>

      <div className="split-container" style={{ display: 'flex', width: '100%', zIndex: 1 }}>
        
        {/* LEFT PANEL */}
        <motion.div 
          className="left-panel"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            width: '40%',
            borderRight: '1px solid rgba(67,97,238,0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            background: 'rgba(5, 5, 16, 0.6)',
            backdropFilter: 'blur(10px)',
            padding: '40px',
            textAlign: 'center'
          }}
        >
          {/* Particles */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: '100vh', opacity: 0, x: Math.random() * 400 - 200 }}
                animate={{ y: '-10vh', opacity: [0, 0.8, 0] }}
                transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: 'linear', delay: Math.random() * 5 }}
                style={{
                  position: 'absolute', bottom: 0, left: '50%',
                  width: '2px', height: '2px', background: '#ffd60a', borderRadius: '50%',
                  boxShadow: '0 0 4px #ffd60a'
                }}
              />
            ))}
          </div>

          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ marginBottom: '30px', filter: 'drop-shadow(0 0 20px rgba(67,97,238,0.5))' }}
          >
            <PokeballLogo size={120} />
          </motion.div>

          <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(67,97,238,0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(67,97,238,0.3)' }}>
            <span style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#4361ee' }}>3-ISB</span>
          </div>

          <h2 style={{ fontFamily: 'Press Start 2P', fontSize: '18px', color: '#e2e8f0', lineHeight: '1.5', marginBottom: '16px', textShadow: '0 0 10px rgba(226,232,240,0.3)' }}>
            BATTLE ENGINE<br/>SYSTEM
          </h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 2 }}
            style={{ fontFamily: 'Exo 2', fontSize: '16px', color: '#00b4d8', letterSpacing: '2px', textTransform: 'uppercase' }}
          >
            Predict. Counter. Dominate.
          </motion.div>

          {/* Legendary Watermark */}
          <div style={{
            position: 'absolute', bottom: -50, right: -50, width: '300px', height: '300px',
            opacity: 0.03, pointerEvents: 'none',
            background: 'url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png") no-repeat center/contain',
            filter: 'grayscale(100%) contrast(200%)'
          }}/>
        </motion.div>

        {/* RIGHT PANEL */}
        <motion.div 
          className="right-panel"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', damping: 20 }}
          style={{
            width: '60%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px'
          }}
        >
          <motion.div
            animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            style={{
              width: '100%', maxWidth: '440px',
              background: '#0f0f2a',
              border: `1px solid ${authSuccess ? '#06d6a0' : 'rgba(99,102,241,0.3)'}`,
              borderRadius: '16px',
              padding: '40px',
              boxShadow: authSuccess 
                ? '0 0 40px rgba(6,214,160,0.2)' 
                : '0 10px 40px rgba(0,0,0,0.5)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.3s'
            }}
          >
            {/* Inner hover glow */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(67,97,238,0.1), rgba(230,57,70,0.05))',
                pointerEvents: 'none'
              }}
            />

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <PokeballLogo size={40} spinning={loading} />
              </div>
              <h1 style={{ fontFamily: 'Press Start 2P', fontSize: '16px', color: '#4361ee', textShadow: '0 0 12px rgba(67,97,238,0.4)', marginBottom: '12px' }}>
                3-ISB LOGIN
              </h1>
              <p style={{ fontFamily: 'Exo 2', color: '#64748b', fontSize: '14px' }}>
                Enter your trainer credentials
              </p>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Username Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                style={{ position: 'relative' }}
              >
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: errors.username ? '#e63946' : '#4361ee' }}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setErrors({...errors, username: false}) }}
                  style={{
                    width: '100%', padding: '14px 14px 14px 44px',
                    background: 'rgba(5,5,16,0.8)', color: '#e2e8f0',
                    border: `1px solid ${errors.username ? '#e63946' : 'rgba(67,97,238,0.3)'}`,
                    borderRadius: '8px', outline: 'none', fontSize: '14px',
                    transition: 'all 0.3s',
                    boxShadow: errors.username ? '0 0 10px rgba(230,57,70,0.2)' : 'none'
                  }}
                  onFocus={e => !errors.username && (e.target.style.borderColor = '#4361ee', e.target.style.boxShadow = '0 0 10px rgba(67,97,238,0.2)')}
                  onBlur={e => !errors.username && (e.target.style.borderColor = 'rgba(67,97,238,0.3)', e.target.style.boxShadow = 'none')}
                />
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ position: 'relative' }}
              >
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#e63946' : '#4361ee' }}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors({...errors, password: false}) }}
                  style={{
                    width: '100%', padding: '14px 44px 14px 44px',
                    background: 'rgba(5,5,16,0.8)', color: '#e2e8f0',
                    border: `1px solid ${errors.password ? '#e63946' : 'rgba(67,97,238,0.3)'}`,
                    borderRadius: '8px', outline: 'none', fontSize: '14px',
                    transition: 'all 0.3s',
                    boxShadow: errors.password ? '0 0 10px rgba(230,57,70,0.2)' : 'none'
                  }}
                  onFocus={e => !errors.password && (e.target.style.borderColor = '#e63946', e.target.style.boxShadow = '0 0 10px rgba(230,57,70,0.2)')}
                  onBlur={e => !errors.password && (e.target.style.borderColor = 'rgba(67,97,238,0.3)', e.target.style.boxShadow = 'none')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </motion.div>

              {/* Remember Me */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '-4px' }}
              >
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: `2px solid ${rememberMe ? '#4361ee' : '#64748b'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', background: rememberMe ? '#4361ee' : 'transparent'
                  }}
                >
                  {rememberMe && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span style={{ color: '#64748b', fontSize: '13px', cursor: 'pointer' }} onClick={() => setRememberMe(!rememberMe)}>
                  Remember this trainer
                </span>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}
              >
                {isLoginState ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(67,97,238,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={e => handleSubmit(e, false)}
                      disabled={loading || authSuccess}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                        background: authSuccess ? '#06d6a0' : 'linear-gradient(90deg, #4361ee, #7209b7)',
                        color: '#fff', fontFamily: 'Exo 2', fontWeight: 700, fontSize: '15px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                      }}
                    >
                      {authSuccess ? 'Battle Ready!' : loading ? 'Authenticating...' : 'LOGIN'}
                    </motion.button>
                    <motion.button
                      whileHover={{ background: 'rgba(67,97,238,0.1)' }}
                      onClick={() => { setIsLoginState(false); setErrors({username: false, password: false}); }}
                      type="button"
                      style={{
                        width: '100%', padding: '14px', borderRadius: '8px', 
                        border: '1px solid rgba(67,97,238,0.3)', background: 'transparent',
                        color: '#4361ee', fontFamily: 'Exo 2', fontWeight: 600, fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      New Trainer? Register
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(230,57,70,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={e => handleSubmit(e, true)}
                      disabled={loading || authSuccess}
                      style={{
                        width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                        background: authSuccess ? '#06d6a0' : 'linear-gradient(90deg, #e63946, #7209b7)',
                        color: '#fff', fontFamily: 'Exo 2', fontWeight: 700, fontSize: '15px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                      }}
                    >
                      {authSuccess ? 'Registered & Ready!' : loading ? 'Registering...' : 'REGISTER'}
                    </motion.button>
                    <motion.button
                      whileHover={{ background: 'rgba(230,57,70,0.1)' }}
                      onClick={() => { setIsLoginState(true); setErrors({username: false, password: false}); }}
                      type="button"
                      style={{
                        width: '100%', padding: '14px', borderRadius: '8px', 
                        border: '1px solid rgba(230,57,70,0.3)', background: 'transparent',
                        color: '#e63946', fontFamily: 'Exo 2', fontWeight: 600, fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Back to Login
                    </motion.button>
                  </>
                )}
              </motion.div>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <a href="#" style={{ color: '#64748b', fontSize: '12px', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
