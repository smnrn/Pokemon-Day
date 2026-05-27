import React from 'react';
import { motion } from 'framer-motion';

// ---- Pokéball SVG ----
function PokeballSVG({ opacity = 0.55 }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" style={{ width: '100%', height: '100%' }}>
      {/* Top half — red */}
      <path d="M2 50 A48 48 0 0 1 98 50" fill="#c0392b"/>
      {/* Bottom half — dark */}
      <path d="M2 50 A48 48 0 0 0 98 50" fill="#1a1a2e"/>
      {/* Outer ring */}
      <circle cx="50" cy="50" r="48" stroke="#2a2a3a" strokeWidth="3.5" fill="none"/>
      {/* Center divider line */}
      <line x1="2" y1="50" x2="98" y2="50" stroke="#2a2a3a" strokeWidth="3.5"/>
      {/* Center button ring */}
      <circle cx="50" cy="50" r="13" fill="#0d0d1a" stroke="#2a2a3a" strokeWidth="3.5"/>
      {/* Center button highlight */}
      <circle cx="50" cy="50" r="7" fill="#222235"/>
      {/* Shine */}
      <ellipse cx="36" cy="30" rx="7" ry="4" fill="rgba(255,255,255,0.12)" transform="rotate(-30 36 30)"/>
    </svg>
  );
}

// ---- Single floating Pokéball ----
function FloatingPokeball({ x, y, size, floatDuration, floatDelay, rotateDuration, rotateDelay, floatAmount, opacity }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        pointerEvents: 'none',
        opacity,
        zIndex: 0,
      }}
      animate={{
        y: [`${-floatAmount}px`, `${floatAmount}px`, `${-floatAmount}px`],
        rotate: [0, 360],
      }}
      transition={{
        y: {
          duration: floatDuration,
          delay: floatDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        },
        rotate: {
          duration: rotateDuration,
          delay: rotateDelay,
          repeat: Infinity,
          ease: 'linear',
        },
      }}
    >
      <PokeballSVG/>
    </motion.div>
  );
}

// ---- Floating Background Pokemon ----
function FloatingPokemon({ id, x, y, size, floatDuration, floatDelay, opacity, flip = false }) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: `${x}%`, top: `${y}%`,
        opacity, zIndex: 0, pointerEvents: 'none'
      }}
      animate={{ y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: floatDuration, delay: floatDelay, ease: "easeInOut" }}
    >
      <img 
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`}
        alt="Background Pokemon"
        style={{ 
          width: `${size}px`, 
          filter: 'grayscale(20%) brightness(0.7)', 
          imageRendering: 'pixelated',
          transform: flip ? 'scaleX(-1)' : 'none'
        }}
      />
    </motion.div>
  );
}

// ---- Animated Battle Scene ----
function AnimatedBattleScene() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.8, type: 'spring' }}
      style={{
        position: 'relative', width: '100%', maxWidth: '400px', height: '180px', margin: '30px auto 0',
        background: 'radial-gradient(ellipse at center, rgba(67,97,238,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
      }}
    >
      {/* Player Side (Back Sprite) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        style={{ position: 'absolute', bottom: '15px', left: '10px', zIndex: 2 }}
      >
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/94.gif" 
          alt="Gengar" 
          style={{ width: '110px', imageRendering: 'pixelated', filter: 'drop-shadow(0 15px 8px rgba(0,0,0,0.6))' }}
        />
      </motion.div>

      {/* Opponent Side (Front Sprite) */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}
      >
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif" 
          alt="Charizard" 
          style={{ width: '110px', imageRendering: 'pixelated', filter: 'drop-shadow(0 15px 8px rgba(0,0,0,0.6))' }}
        />
      </motion.div>

      {/* VS Badge */}
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: 'Press Start 2P', fontSize: '24px',
          color: '#ffd60a',
          textShadow: '3px 3px 0px #d90429, 0 0 15px rgba(255,214,10,0.8)',
          zIndex: 3
        }}
      >
        VS
      </motion.div>
    </motion.div>
  );
}

// ---- 22 scattered pokéballs across the full viewport ----
const POKEBALLS = [
  // Left side
  { x: 2,  y: 18, size: 28, floatDuration: 4.2, floatDelay: 0,    rotateDuration: 18, rotateDelay: 0,    floatAmount: 10, opacity: 0.50 },
  { x: 6,  y: 55, size: 20, floatDuration: 5.1, floatDelay: 1.2,  rotateDuration: 25, rotateDelay: 2,    floatAmount: 8,  opacity: 0.40 },
  { x: 3,  y: 78, size: 34, floatDuration: 3.8, floatDelay: 0.5,  rotateDuration: 20, rotateDelay: 0.5,  floatAmount: 12, opacity: 0.48 },
  { x: 10, y: 35, size: 18, floatDuration: 6.0, floatDelay: 2.0,  rotateDuration: 30, rotateDelay: 1,    floatAmount: 7,  opacity: 0.35 },
  { x: 14, y: 88, size: 26, floatDuration: 4.5, floatDelay: 3.0,  rotateDuration: 22, rotateDelay: 3,    floatAmount: 9,  opacity: 0.45 },

  // Center-left
  { x: 22, y: 12, size: 22, floatDuration: 5.5, floatDelay: 0.8,  rotateDuration: 28, rotateDelay: 0,    floatAmount: 8,  opacity: 0.38 },
  { x: 28, y: 72, size: 30, floatDuration: 4.0, floatDelay: 1.5,  rotateDuration: 16, rotateDelay: 1.5,  floatAmount: 11, opacity: 0.50 },
  { x: 18, y: 50, size: 16, floatDuration: 7.0, floatDelay: 2.5,  rotateDuration: 35, rotateDelay: 2.5,  floatAmount: 6,  opacity: 0.30 },

  // Center
  { x: 38, y: 8,  size: 20, floatDuration: 5.0, floatDelay: 0.3,  rotateDuration: 24, rotateDelay: 0.3,  floatAmount: 8,  opacity: 0.35 },
  { x: 44, y: 82, size: 24, floatDuration: 4.8, floatDelay: 1.8,  rotateDuration: 19, rotateDelay: 1,    floatAmount: 10, opacity: 0.42 },
  { x: 50, y: 20, size: 18, floatDuration: 6.5, floatDelay: 0.7,  rotateDuration: 32, rotateDelay: 0.7,  floatAmount: 7,  opacity: 0.32 },
  { x: 55, y: 65, size: 28, floatDuration: 3.9, floatDelay: 2.2,  rotateDuration: 15, rotateDelay: 2.2,  floatAmount: 11, opacity: 0.48 },

  // Center-right
  { x: 63, y: 10, size: 22, floatDuration: 5.3, floatDelay: 1.1,  rotateDuration: 27, rotateDelay: 1.1,  floatAmount: 9,  opacity: 0.40 },
  { x: 68, y: 48, size: 16, floatDuration: 4.7, floatDelay: 3.5,  rotateDuration: 38, rotateDelay: 3.5,  floatAmount: 6,  opacity: 0.30 },
  { x: 72, y: 85, size: 32, floatDuration: 4.1, floatDelay: 0.9,  rotateDuration: 17, rotateDelay: 0.9,  floatAmount: 12, opacity: 0.52 },
  { x: 60, y: 30, size: 26, floatDuration: 5.8, floatDelay: 2.8,  rotateDuration: 23, rotateDelay: 2.8,  floatAmount: 9,  opacity: 0.44 },

  // Right side
  { x: 80, y: 15, size: 20, floatDuration: 4.4, floatDelay: 1.4,  rotateDuration: 29, rotateDelay: 1.4,  floatAmount: 8,  opacity: 0.38 },
  { x: 85, y: 42, size: 36, floatDuration: 3.7, floatDelay: 0.2,  rotateDuration: 14, rotateDelay: 0.2,  floatAmount: 13, opacity: 0.55 },
  { x: 88, y: 70, size: 22, floatDuration: 6.2, floatDelay: 2.4,  rotateDuration: 26, rotateDelay: 2.4,  floatAmount: 8,  opacity: 0.40 },
  { x: 93, y: 25, size: 18, floatDuration: 5.6, floatDelay: 1.7,  rotateDuration: 33, rotateDelay: 1.7,  floatAmount: 7,  opacity: 0.33 },
  { x: 96, y: 60, size: 28, floatDuration: 4.3, floatDelay: 3.2,  rotateDuration: 20, rotateDelay: 3.2,  floatAmount: 10, opacity: 0.46 },
  { x: 91, y: 90, size: 16, floatDuration: 7.5, floatDelay: 0.6,  rotateDuration: 40, rotateDelay: 0.6,  floatAmount: 6,  opacity: 0.28 },
];

export default function Hero({ onNavigate }) {
  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(67,97,238,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 20%, rgba(230,57,70,0.1) 0%, transparent 60%), #0a0a1a',
      }}/>
      
      {/* Grid overlay */}
      <div className="pixel-grid" style={{ position: 'absolute', inset: 0, opacity: 0.6 }}/>

      {/* Scan line */}
      <div className="scan-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div className="scan-line"/>
      </div>

      {/* Floating Pokéballs — scattered across viewport */}
      {POKEBALLS.map((p, i) => <FloatingPokeball key={i} {...p}/>)}

      {/* Background Animated Pokemon */}
      <FloatingPokemon id={150} x={8} y={15} size={90} floatDuration={4.2} floatDelay={0} opacity={0.2} /> {/* Mewtwo */}
      <FloatingPokemon id={249} x={85} y={12} size={100} floatDuration={5.5} floatDelay={1} opacity={0.2} flip={true} /> {/* Lugia */}
      <FloatingPokemon id={384} x={4} y={70} size={120} floatDuration={6} floatDelay={2} opacity={0.15} /> {/* Rayquaza */}
      <FloatingPokemon id={448} x={88} y={75} size={80} floatDuration={4.5} floatDelay={0.5} opacity={0.2} flip={true} /> {/* Lucario */}
      <FloatingPokemon id={230} x={45} y={5} size={70} floatDuration={5} floatDelay={3} opacity={0.15} /> {/* Kingdra */}

      {/* Center glow */}
      <div style={{
        position: 'absolute',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(67,97,238,0.08) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        animation: 'pulse-glow 4s ease-in-out infinite',
      }}/>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px 24px', maxWidth: '900px' }}>
        
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-pixel" style={{ marginBottom: '8px' }}>
            <motion.span
              animate={{ textShadow: ['0 0 20px #4361ee', '0 0 40px #4361ee, 0 0 80px #4361ee40', '0 0 20px #4361ee'] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{ display: 'block', fontSize: 'clamp(12px, 3vw, 22px)', color: '#4361ee', marginBottom: '4px' }}
            >
              3-ISB
            </motion.span>
            <span style={{ display: 'block', fontSize: 'clamp(18px, 4.5vw, 36px)', color: '#e8e8ff', lineHeight: 1.4 }}>
              POKÉMON BATTLE
            </span>
            <motion.span
              animate={{ textShadow: ['0 0 20px #e63946', '0 0 40px #e63946, 0 0 80px #e6394640', '0 0 20px #e63946'] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
              style={{ display: 'block', fontSize: 'clamp(18px, 4.5vw, 36px)', color: '#e63946' }}
            >
              ENGINE SYSTEM
            </motion.span>
          </h1>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          style={{
            height: '1px', margin: '28px auto',
            background: 'linear-gradient(90deg, transparent, #4361ee, #e63946, transparent)',
            maxWidth: '500px',
          }}
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ fontFamily: 'Exo 2', fontSize: '15px', color: '#8888bb', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.8 }}
        >
          A high-tech AI battle command center powered by machine learning. Generate optimal gym leader teams,
          counter-pick opponents, predict battle outcomes, and analyze your performance — all in one system.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: '0 0 30px rgba(67,97,238,0.7)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('engine1')}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #4361ee 0%, #2d47d0 100%)',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'Press Start 2P', fontSize: '9px', color: 'white',
              boxShadow: '0 0 20px rgba(67,97,238,0.4)',
              transition: 'all 0.3s',
            }}
          >
            LAUNCH ENGINES
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: '0 0 30px rgba(230,57,70,0.5)', background: 'rgba(230,57,70,0.15)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('profile')}
            style={{
              padding: '16px 32px',
              background: 'transparent',
              border: '2px solid #e63946', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'Press Start 2P', fontSize: '9px', color: '#e63946',
              transition: 'all 0.3s',
            }}
          >
            VIEW PROFILE
          </motion.button>
        </motion.div>

        {/* Dynamic Animated Battle Scene */}
        <AnimatedBattleScene />



        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ marginTop: '60px', color: '#8888bb', fontSize: '11px', fontFamily: 'Exo 2' }}
        >
          ▼ scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
