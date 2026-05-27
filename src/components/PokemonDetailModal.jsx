import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAT_COLORS, STAT_ABBREV } from '../pokemon.js';
import { StatBar, TypeBadge, RoleBadge } from './UI.jsx';

const TABS = ['Stats', 'Moves', 'Abilities'];

function assignRole(pokemon) {
  const statObj = {};
  (pokemon.stats || []).forEach(s => { statObj[s.stat.name] = s.base_stat; });
  const atk = statObj['attack'] || 0;
  const spa = statObj['special-attack'] || 0;
  const def = statObj['defense'] || 0;
  const spd = statObj['special-defense'] || 0;
  const spe = statObj['speed'] || 0;
  const hp = statObj['hp'] || 0;
  const offScore = atk + spa + spe;
  const defScore = def + spd + hp;
  if (offScore > defScore * 1.3 && spe > 80) return 'Sweeper';
  if (defScore > offScore * 1.2 && hp > 80) return 'Tank';
  if (hp > 90 && (def + spd) > 130) return 'Support';
  return 'Pivot';
}

// ---- Ability Row ----
function AbilityRow({ ability, index }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleToggle() {
    setOpen(o => !o);
    if (!detail && !loading) {
      setLoading(true);
      try {
        const res = await fetch(ability.ability.url);
        const data = await res.json();
        const eng = data.effect_entries.find(e => e.language.name === 'en');
        setDetail(eng?.short_effect || 'No description available.');
      } catch { setDetail('Unable to load description.'); }
      finally { setLoading(false); }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={handleToggle}
      style={{
        padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(67,97,238,0.2)',
        marginBottom: '8px', transition: 'border-color 0.2s',
      }}
      whileHover={{ borderColor: 'rgba(67,97,238,0.5)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Exo 2', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', color: '#e8e8ff' }}>
          {ability.ability.name.replace(/-/g, ' ')}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {ability.is_hidden && (
            <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(123,47,255,0.2)', border: '1px solid #7b2fff40', fontFamily: 'Press Start 2P', fontSize: '5px', color: '#7b2fff' }}>HIDDEN</span>
          )}
          <span style={{ color: '#4361ee', fontSize: '10px' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ marginTop: '8px', fontFamily: 'Exo 2', fontSize: '12px', color: '#8888bb', lineHeight: 1.7 }}>
              {loading ? 'Loading...' : detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---- Move Chip ----
function MoveChip({ move, index, isBest }) {
  const moveName = typeof move === 'string' ? move : move.move.name.replace(/-/g, ' ');
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.02, 0.6) }}
      style={{
        display: 'inline-block', padding: '6px 12px', margin: '3px',
        borderRadius: '5px', fontSize: '12px', fontFamily: 'Exo 2',
        color: isBest ? '#06d6a0' : '#aaaacc', background: isBest ? 'rgba(6,214,160,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isBest ? 'rgba(6,214,160,0.4)' : 'rgba(255,255,255,0.08)'}`,
        textTransform: 'capitalize', cursor: 'default',
        transition: 'all 0.15s',
      }}
    >
      {moveName}
      {isBest && <span style={{ marginLeft: '8px', fontSize: '8px', fontFamily: 'Press Start 2P', color: '#06d6a0' }}>★ BEST</span>}
    </motion.span>
  );
}

// ---- Main Modal ----
export default function PokemonDetailModal({ pokemon, onClose }) {
  const [tab, setTab] = useState('Stats');
  const [shiny, setShiny] = useState(false);
  const [species, setSpecies] = useState(null);
  const [attacking, setAttacking] = useState(false);

  // Fetch flavor text
  useEffect(() => {
    if (!pokemon) return;
    setTab('Stats');
    setShiny(false);
    setSpecies(null);
    fetch(pokemon.species.url)
      .then(r => r.json())
      .then(d => setSpecies(d))
      .catch(() => {});
  }, [pokemon?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!pokemon) return null;

  const spriteUrl = shiny
    ? (pokemon.sprites?.other?.['official-artwork']?.front_shiny || pokemon.sprites?.front_shiny)
    : (pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default);

  const types = pokemon.types?.map(t => t.type?.name || t) || [];
  const role = pokemon.role || assignRole(pokemon);
  const bst = (pokemon.stats || []).reduce((s, st) => s + st.base_stat, 0);
  const flavorText = species?.flavor_text_entries?.find(e => e.language?.name === 'en')?.flavor_text?.replace(/\f/g, ' ') || '';

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 5000,
          background: 'rgba(5, 5, 20, 0.82)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: '1000px',
            background: '#0d0d1a', // Dark background matching the screenshot
            borderRadius: '8px', overflow: 'hidden',
            boxShadow: '0 0 60px rgba(0,0,0,0.8)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', // 2 columns
            minHeight: '500px', maxHeight: '90vh', position: 'relative'
          }}
        >
          {/* Close button */}
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 24, cursor: 'pointer', zIndex: 10 }}>×</button>

          {/* LEFT COLUMN */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            
            {/* Top Bar inside left column */}
            <div style={{ position: 'absolute', top: '30px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontFamily: 'Exo 2', fontSize: '14px', color: '#fff' }}>#{String(pokemon.id).padStart(4, '0')}</div>
               <button onClick={() => setShiny(!shiny)} style={{ border: '1px solid #ffd60a', background: 'transparent', color: '#ffd60a', padding: '6px 12px', borderRadius: '4px', fontFamily: 'Exo 2', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <span style={{ fontSize: '14px' }}>✦</span> SHINY {shiny ? 'ON' : 'OFF'}
               </button>
            </div>

            {/* Sprite */}
            <motion.img 
              src={spriteUrl} 
              alt={pokemon.name}
              onClick={() => {
                if (attacking) return;
                setAttacking(true);
                const cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy;
                if (cryUrl) {
                  const audio = new Audio(cryUrl);
                  audio.volume = 0.4;
                  audio.play().catch(() => {});
                }
                setTimeout(() => setAttacking(false), 800);
              }}
              whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.2))' }}
              whileTap={{ scale: 0.95 }}
              animate={attacking 
                ? { x: [0, -20, 25, -15, 10, 0], scale: 1.15, filter: 'drop-shadow(0 0 40px rgba(230,57,70,0.6))' } 
                : { y: [-10, 0, -10] }
              }
              transition={attacking
                ? { duration: 0.5, ease: 'easeInOut' }
                : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
              }
              style={{ width: '280px', height: '280px', objectFit: 'contain', marginTop: '40px', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.05))', cursor: 'pointer' }} 
            />
            
            {/* Name */}
            <h2 style={{ fontFamily: 'Exo 2', fontSize: '24px', fontWeight: 600, color: '#fff', marginTop: '30px', marginBottom: '16px', textTransform: 'capitalize' }}>
              {pokemon.name}
            </h2>
            
            {/* Types */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
              {types.map(t => (
                <div key={t} style={{
                  padding: '6px 16px', borderRadius: '4px', fontFamily: 'Exo 2', fontWeight: 600,
                  fontSize: '12px', color: '#000', textTransform: 'uppercase',
                  background: '#ffd60a', // Solid color matching screenshot roughly
                }}>
                  {t}
                </div>
              ))}
            </div>

            {/* Height/Weight */}
            <div style={{ display: 'flex', gap: '20px', fontFamily: 'Exo 2', fontSize: '14px', color: '#fff' }}>
               <div>Height: {(pokemon.height / 10).toFixed(1)}m</div>
               <div>Weight: {(pokemon.weight / 10).toFixed(1)}kg</div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ padding: '40px 40px 40px 0', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
             {/* Tabs */}
             <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                {['Stats', 'Moves', 'Abilities'].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    background: tab === t ? 'rgba(67,97,238,0.2)' : 'transparent',
                    border: tab === t ? '1px solid #4361ee' : '1px solid transparent',
                    color: '#fff', padding: '8px 20px', borderRadius: '4px',
                    fontFamily: 'Exo 2', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
                    transition: 'all 0.2s'
                  }}>
                    {t}
                  </button>
                ))}
             </div>

             {/* Tab Content */}
             <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
               <AnimatePresence mode="wait">
                 {tab === 'Stats' && (
                   <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     {(pokemon.stats || []).map(stat => {
                       const color = STAT_COLORS[stat.stat.name] || '#fff';
                       return (
                         <div key={stat.stat.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <div style={{ fontFamily: 'Exo 2', fontSize: '11px', color: '#fff', textTransform: 'uppercase', fontWeight: 600 }}>
                             {stat.stat.name.replace('-', ' ')}
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                             <div style={{ width: '200px', height: '10px', background: 'transparent', borderRadius: '5px' }}>
                               <motion.div 
                                 initial={{ width: 0 }} animate={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
                                 style={{ height: '100%', background: color, borderRadius: '5px' }} 
                               />
                             </div>
                             <div style={{ fontFamily: 'Exo 2', fontSize: '12px', color: color, width: '30px', textAlign: 'right', fontWeight: 600 }}>
                               {stat.base_stat}
                             </div>
                           </div>
                         </div>
                       );
                     })}
                     
                     <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                       <span style={{ fontFamily: 'Exo 2', fontSize: '12px', color: '#8888bb', fontWeight: 600 }}>BASE STAT TOTAL</span>
                       <span style={{ fontFamily: 'Exo 2', fontSize: '14px', color: '#ffd60a', fontWeight: 700 }}>{bst}</span>
                     </div>
                   </motion.div>
                 )}

                 {tab === 'Moves' && (
                   <motion.div key="moves" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     {pokemon.showdown ? (
                       <>
                         <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#06d6a0', marginBottom: '16px' }}>
                           OPTIMAL COUNTER MOVESET
                         </div>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                           {pokemon.showdown.moves.map((moveName, i) => (
                             <MoveChip key={moveName} move={moveName} index={i} isBest={moveName === pokemon.bestCounterMove} />
                           ))}
                         </div>
                       </>
                     ) : (
                       <>
                         <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '12px' }}>
                           {(pokemon.moves || []).length} MOVES LEARNABLE
                         </div>
                         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0' }}>
                           {(pokemon.moves || []).slice(0, 80).map((move, i) => (
                             <MoveChip key={move.move.name} move={move} index={i}/>
                           ))}
                         </div>
                         {(pokemon.moves || []).length > 80 && (
                           <div style={{ marginTop: '12px', fontFamily: 'Exo 2', fontSize: '11px', color: '#8888bb', textAlign: 'center' }}>
                             + {(pokemon.moves || []).length - 80} more moves
                           </div>
                         )}
                       </>
                     )}
                   </motion.div>
                 )}

                 {tab === 'Abilities' && (
                   <motion.div key="abilities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '14px' }}>
                       CLICK AN ABILITY TO EXPAND DESCRIPTION
                     </div>
                     {(pokemon.abilities || []).map((ability, i) => (
                       <AbilityRow key={ability.ability.name} ability={ability} index={i}/>
                     ))}
                     
                     {flavorText && (
                       <div style={{ marginTop: '30px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                         <p style={{ fontFamily: 'Exo 2', fontSize: '13px', color: '#aaaacc', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                           "{flavorText}"
                         </p>
                       </div>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
