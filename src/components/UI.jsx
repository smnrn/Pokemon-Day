import React from 'react';
import { motion } from 'framer-motion';

// ---- Pokeball Loader ----
export function PokeballLoader({ size = 64 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <circle cx="50" cy="50" r="48" stroke="#4361ee" strokeWidth="3" fill="none" opacity="0.3"/>
          <path d="M2 50 Q2 2 50 2 Q98 2 98 50" fill="#e63946" stroke="#e63946" strokeWidth="0"/>
          <path d="M2 50 Q2 98 50 98 Q98 98 98 50" fill="#12122a" stroke="#12122a" strokeWidth="0"/>
          <circle cx="50" cy="50" r="48" stroke="#4361ee" strokeWidth="2" fill="none"/>
          <line x1="2" y1="50" x2="98" y2="50" stroke="#4361ee" strokeWidth="2"/>
          <circle cx="50" cy="50" r="12" fill="#12122a" stroke="#4361ee" strokeWidth="3"/>
          <circle cx="50" cy="50" r="6" fill="#4361ee">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </motion.div>
    </div>
  );
}

// ---- Type Badge ----
export function TypeBadge({ type }) {
  return (
    <span
      className={`type-${type}`}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: 'Press Start 2P, monospace',
        textTransform: 'capitalize',
        color: 'white',
        marginRight: '4px',
        marginBottom: '2px',
      }}
    >
      {type}
    </span>
  );
}

// ---- Role Badge ----
export function RoleBadge({ role }) {
  const cls = `role-${role.toLowerCase()}`;
  return (
    <span
      className={cls}
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '4px',
        fontSize: '8px',
        fontFamily: 'Press Start 2P, monospace',
        textTransform: 'uppercase',
      }}
    >
      {role}
    </span>
  );
}

// ---- Stat Bar ----
export function StatBar({ label, value, max = 255, color = '#4361ee', delay = 0 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'Press Start 2P', color: '#8888bb' }}>{label}</span>
        <span style={{ fontSize: '12px', fontFamily: 'Exo 2', fontWeight: 700, color: color }}>{value}</span>
      </div>
      <div className="stat-bar-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '100%', borderRadius: '4px', background: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
    </div>
  );
}

// ---- Circular Progress ----
export function CircularProgress({ value, max = 100, size = 120, color = '#4361ee', label = '' }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, value / max);
  const dashoffset = circumference * (1 - pct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8"/>
        <motion.circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div style={{ marginTop: `-${size * 0.68}px`, textAlign: 'center', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ fontFamily: 'Press Start 2P', fontSize: '18px', color, lineHeight: 1 }}
        >
          {value}%
        </motion.div>
      </div>
      <div style={{ marginTop: `${size * 0.4}px`, fontFamily: 'Exo 2', fontSize: '12px', color: '#8888bb', textAlign: 'center', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
}

// ---- Section Header ----
export function SectionHeader({ icon, title, subtitle, accent = '#4361ee' }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
        <h2 className="font-pixel pixel-md" style={{ color: accent, textTransform: 'uppercase' }}>
          {title}
        </h2>
      </div>
      {subtitle && (
        <p style={{ color: '#8888bb', fontFamily: 'Exo 2', fontSize: '14px', maxWidth: '600px' }}>
          {subtitle}
        </p>
      )}
      <div className="section-divider" style={{ marginTop: '16px' }}/>
    </div>
  );
}

// ---- Metric Card ----
export function MetricCard({ label, value, sub, color = '#4361ee', icon }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="glass-card"
      style={{
        padding: '20px 24px',
        borderRadius: '12px',
        borderColor: `${color}40`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: color, boxShadow: `0 0 12px ${color}` }}/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'Press Start 2P', fontSize: '7px', color: '#8888bb', marginBottom: '12px', textTransform: 'uppercase' }}>
            {label}
          </div>
          <div style={{ fontFamily: 'Press Start 2P', fontSize: '22px', color, marginBottom: '6px' }}>
            {value}
          </div>
          {sub && <div style={{ fontFamily: 'Exo 2', fontSize: '12px', color: '#8888bb' }}>{sub}</div>}
        </div>
        {icon && <span style={{ fontSize: '28px', opacity: 0.6 }}>{icon}</span>}
      </div>
    </motion.div>
  );
}

// ---- Export Buttons ----
export function ExportButtons({ onExportJSON, onExportCSV, onExportShowdown }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {onExportShowdown && (
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-ghost" onClick={onExportShowdown} style={{ fontSize: '11px', padding: '8px 14px', borderColor: '#4361ee', color: '#4361ee' }}>
          ⬇ SHOWDOWN
        </motion.button>
      )}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-ghost" onClick={onExportJSON} style={{ fontSize: '11px', padding: '8px 14px' }}>
        ⬇ JSON
      </motion.button>
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="btn-ghost" onClick={onExportCSV} style={{ fontSize: '11px', padding: '8px 14px' }}>
        ⬇ CSV
      </motion.button>
    </div>
  );
}

// ---- Corner Frame ----
export function CornerFrame({ children, color = '#4361ee', style = {} }) {
  const cornerStyle = { position: 'absolute', width: 14, height: 14, borderColor: color, borderStyle: 'solid' };
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ ...cornerStyle, top: 0, left: 0, borderWidth: '2px 0 0 2px' }}/>
      <div style={{ ...cornerStyle, top: 0, right: 0, borderWidth: '2px 2px 0 0' }}/>
      <div style={{ ...cornerStyle, bottom: 0, left: 0, borderWidth: '0 0 2px 2px' }}/>
      <div style={{ ...cornerStyle, bottom: 0, right: 0, borderWidth: '0 2px 2px 0' }}/>
      {children}
    </div>
  );
}
