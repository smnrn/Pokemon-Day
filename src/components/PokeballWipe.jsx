import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PokeballWipe({ active, reverse = false, onComplete }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="pokeball-wipe"
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'all',
          }}
        >
          <motion.div
            initial={{ scale: reverse ? 30 : 0, rotate: reverse ? 180 : 0 }}
            animate={{ scale: reverse ? 0 : 30, rotate: reverse ? 0 : 180 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={onComplete}
            style={{
              width: 200, height: 200, borderRadius: '50%',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 0 80px rgba(230,57,70,0.5), 0 0 160px rgba(67,97,238,0.3)',
            }}
          >
            {/* Top red half */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '47%',
              background: 'linear-gradient(180deg, #ff4d5a 0%, #e63946 100%)',
            }}/>
            {/* Bottom dark half */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '47%',
              background: 'linear-gradient(180deg, #12122a 0%, #0a0a1a 100%)',
            }}/>
            {/* Center band */}
            <div style={{
              position: 'absolute', top: '50%', left: 0, right: 0, height: 10,
              background: '#4361ee', transform: 'translateY(-50%)', zIndex: 2,
              boxShadow: '0 0 20px rgba(67,97,238,0.6)',
            }}/>
            {/* Center button */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', width: 30, height: 30,
              borderRadius: '50%', background: '#0a0a1a',
              border: '5px solid #4361ee', transform: 'translate(-50%, -50%)', zIndex: 3,
              boxShadow: '0 0 15px rgba(67,97,238,0.5)',
            }}>
              <div style={{
                position: 'absolute', inset: 3, borderRadius: '50%',
                background: '#ffd60a', boxShadow: '0 0 8px #ffd60a',
              }}/>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
