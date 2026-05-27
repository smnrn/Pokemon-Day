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

// ---- HP Bar Component ----
function HpBar({ name, level, hpPercent, color }) {
  return (
    <div style={{
      width: '160px', background: '#f8f8f8', border: '3px solid #2a2a3a',
      borderRadius: '8px', padding: '6px 10px',
      fontFamily: 'Press Start 2P', fontSize: '8px', color: '#1a1a2e',
      boxShadow: '4px 4px 0 rgba(0,0,0,0.5)',
      textAlign: 'left'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{name}</span>
        <span><span style={{ fontSize: '6px' }}>Lv</span>{level}</span>
      </div>
      <div style={{ 
        width: '100%', padding: '2px', background: '#444', borderRadius: '10px',
        display: 'flex', alignItems: 'center'
      }}>
        <div style={{ fontSize: '6px', color: '#ffd60a', marginRight: '4px', textShadow: '1px 1px 0 #000' }}>HP</div>
        <div style={{ 
          flex: 1, height: '6px', background: '#e0e0e0', borderRadius: '4px',
          border: '1px solid #111', overflow: 'hidden'
        }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${hpPercent}%` }}
            transition={{ duration: 1.5, delay: 1.5, ease: 'easeOut' }}
            style={{ height: '100%', background: color || (hpPercent > 50 ? '#06d6a0' : hpPercent > 20 ? '#ffd60a' : '#e63946') }}
          />
        </div>
      </div>
    </div>
  );
}

// ---- Animated Battle Scene ----
function AnimatedBattleScene() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8, type: 'spring' }}
      style={{
        position: 'relative', width: '100%', maxWidth: '700px', height: '350px', margin: '20px auto 0', transform: 'scale(0.85)', transformOrigin: 'top center'
      }}
    >
      {/* 3D Battle Platform */}
      <div style={{
        position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%) rotateX(70deg)',
        width: '550px', height: '550px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(67,97,238,0.25) 0%, rgba(10,10,26,0.95) 60%, transparent 70%)',
        border: '3px solid rgba(67,97,238,0.5)',
        boxShadow: '0 0 50px rgba(67,97,238,0.3), inset 0 0 40px rgba(67,97,238,0.4)',
        zIndex: 0
      }}/>

      {/* Opponent HP Bar (Top Right aligned with Charizard) */}
      <div style={{ position: 'absolute', top: '30px', right: '145px', zIndex: 3 }}>
        <HpBar name="Charizard" level="75" hpPercent={100} color="#ffb703" />
      </div>

      {/* Player HP Bar (Top Left aligned with Gengar) */}
      <div style={{ position: 'absolute', bottom: '210px', left: '145px', zIndex: 3 }}>
        <HpBar name="Gengar" level="80" hpPercent={85} color="#b19cd9" />
      </div>

      {/* Charizard Container (Floating) */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.1, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '60px', right: '160px', zIndex: 1 }}
      >
        <motion.img 
          animate={{ filter: [
            'drop-shadow(0 20px 10px rgba(0,0,0,0.8)) brightness(1)', 
            'drop-shadow(0 20px 10px rgba(0,0,0,0.8)) brightness(1)', 
            'drop-shadow(0 20px 10px rgba(0,0,0,0.8)) brightness(2.5)', 
            'drop-shadow(0 20px 10px rgba(0,0,0,0.8)) brightness(1)'
          ] }}
          transition={{ repeat: Infinity, duration: 3, times: [0, 0.14, 0.15, 0.25], delay: 0 }}
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/6.gif" 
          alt="Charizard" 
          style={{ width: '130px', imageRendering: 'pixelated' }}
        />
      </motion.div>

      {/* Gengar Container (Floating) */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        style={{ position: 'absolute', bottom: '60px', left: '160px', zIndex: 2 }}
      >
        <motion.img 
          animate={{ filter: [
            'drop-shadow(0 25px 15px rgba(0,0,0,0.9)) brightness(1)', 
            'drop-shadow(0 25px 15px rgba(0,0,0,0.9)) brightness(1)', 
            'drop-shadow(0 25px 15px rgba(0,0,0,0.9)) brightness(2.5)', 
            'drop-shadow(0 25px 15px rgba(0,0,0,0.9)) brightness(1)'
          ] }}
          transition={{ repeat: Infinity, duration: 3, times: [0, 0.64, 0.65, 0.75], delay: 0 }}
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/94.gif" 
          alt="Gengar" 
          style={{ width: '150px', imageRendering: 'pixelated' }}
        />
      </motion.div>

      {/* Shadow Ball (Gengar to Charizard) */}
      <motion.div
        animate={{ 
          x: [0, 170, 180, 0], 
          y: [0, -60, -65, 0], 
          opacity: [0, 1, 0, 0],
          scale: [0.5, 1.2, 2.5, 0]
        }}
        transition={{ repeat: Infinity, duration: 3, times: [0, 0.14, 0.15, 1], delay: 0 }}
        style={{
          position: 'absolute', bottom: '150px', left: '240px', zIndex: 4,
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'radial-gradient(circle, #e0b0ff 0%, #4b0082 70%)',
          boxShadow: '0 0 20px #8a2be2',
        }}
      />

      {/* Flamethrower (Charizard to Gengar) */}
      <motion.div
        animate={{ 
          x: [0, -170, -180, 0], 
          y: [0, 60, 65, 0], 
          opacity: [0, 1, 0, 0],
          scale: [0.5, 1.2, 2.5, 0]
        }}
        transition={{ repeat: Infinity, duration: 3, times: [0, 0.14, 0.15, 1], delay: 1.5 }}
        style={{
          position: 'absolute', top: '130px', right: '240px', zIndex: 4,
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'radial-gradient(circle, #fff 0%, #ff4500 70%)',
          boxShadow: '0 0 20px #ff4500',
        }}
      />

      {/* VS Badge */}
      <motion.div
        animate={{ scale: [1, 1, 1.3, 1, 1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 3, times: [0, 0.14, 0.15, 0.25, 0.64, 0.65, 1] }}
        style={{
          position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)',
          fontFamily: 'Press Start 2P', fontSize: '24px',
          color: '#ffd60a',
          textShadow: '3px 3px 0px #d90429, 0 0 15px rgba(255,214,10,0.8)',
          zIndex: 4
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
      <FloatingPokemon id={483} x={25} y={10} size={100} floatDuration={6.5} floatDelay={1.5} opacity={0.2} /> {/* Dialga */}
      <FloatingPokemon id={484} x={75} y={65} size={110} floatDuration={5.8} floatDelay={2.5} opacity={0.18} flip={true} /> {/* Palkia */}
      <FloatingPokemon id={487} x={20} y={85} size={130} floatDuration={7} floatDelay={0.8} opacity={0.15} /> {/* Giratina */}
      <FloatingPokemon id={382} x={60} y={15} size={100} floatDuration={6.2} floatDelay={2.1} opacity={0.2} /> {/* Kyogre */}
      <FloatingPokemon id={383} x={35} y={75} size={100} floatDuration={5.3} floatDelay={1.2} opacity={0.18} /> {/* Groudon */}
      <FloatingPokemon id={493} x={65} y={85} size={90} floatDuration={4.8} floatDelay={0.4} opacity={0.2} flip={true} /> {/* Arceus */}

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
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '10px 24px 0', maxWidth: '900px' }}>
        
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-pixel" style={{ marginBottom: '4px' }}>
            <motion.span
              animate={{ textShadow: ['0 0 20px #4361ee', '0 0 40px #4361ee, 0 0 80px #4361ee40', '0 0 20px #4361ee'] }}
              transition={{ repeat: Infinity, duration: 3 }}
              style={{ display: 'block', fontSize: 'clamp(12px, 3vw, 18px)', color: '#4361ee', marginBottom: '4px' }}
            >
              3-ISB
            </motion.span>
            <span style={{ display: 'block', fontSize: 'clamp(20px, 5vw, 42px)', color: '#e8e8ff', lineHeight: 1.4 }}>
              POKÉMON BATTLE
            </span>
            <motion.span
              animate={{ textShadow: ['0 0 20px #e63946', '0 0 40px #e63946, 0 0 80px #e6394640', '0 0 20px #e63946'] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1 }}
              style={{ display: 'block', fontSize: 'clamp(20px, 5vw, 42px)', color: '#e63946' }}
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
            height: '1px', margin: '16px auto',
            background: 'linear-gradient(90deg, transparent, #4361ee, #e63946, transparent)',
            maxWidth: '500px',
          }}
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ fontFamily: 'Exo 2', fontSize: '13px', color: '#8888bb', maxWidth: '600px', margin: '0 auto 20px', lineHeight: 1.6 }}
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
          style={{ marginTop: '0px', color: '#8888bb', fontSize: '11px', fontFamily: 'Exo 2' }}
        >
          ▼ scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
