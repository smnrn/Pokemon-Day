import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAT_COLORS, STAT_ABBREV } from '../pokemon.js';
import { SectionHeader, TypeBadge, StatBar, PokeballLoader } from '../components/UI.jsx';
import { useToast } from '../components/Toast.jsx';

const TABS = ['Stats', 'Moves', 'Abilities'];

function AbilityRow({ ability, index }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchAbility() {
    if (detail) return;
    setLoading(true);
    try {
      const res = await fetch(ability.ability.url);
      const data = await res.json();
      const eng = data.effect_entries.find(e => e.language.name === 'en');
      setDetail(eng?.short_effect || 'No description available.');
    } catch { setDetail('Failed to load.'); }
    finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={fetchAbility}
      style={{
        padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(67,97,238,0.15)',
        marginBottom: '8px', transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: detail ? '8px' : 0 }}>
        <span style={{ fontFamily: 'Exo 2', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', color: '#e8e8ff' }}>
          {ability.ability.name.replace('-', ' ')}
        </span>
        {ability.is_hidden && (
          <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(123,47,255,0.2)', border: '1px solid #7b2fff', fontFamily: 'Press Start 2P', fontSize: '5px', color: '#7b2fff' }}>
            HIDDEN
          </span>
        )}
      </div>
      {loading && <div style={{ fontFamily: 'Exo 2', fontSize: '12px', color: '#8888bb' }}>Loading...</div>}
      {detail && <div style={{ fontFamily: 'Exo 2', fontSize: '12px', color: '#8888bb', lineHeight: 1.7 }}>{detail}</div>}
      {!detail && !loading && <div style={{ fontFamily: 'Exo 2', fontSize: '11px', color: '#4361ee80' }}>Click to expand</div>}
    </motion.div>
  );
}

function MoveRow({ move, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (index % 20) * 0.03 }}
      style={{
        padding: '8px 12px', borderRadius: '6px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '4px', fontFamily: 'Exo 2', fontSize: '12px', color: '#8888bb',
        textTransform: 'capitalize',
      }}
    >
      {move.move.name.replace(/-/g, ' ')}
    </motion.div>
  );
}

export default function PokemonProfile() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shiny, setShiny] = useState(false);
  const [activeTab, setActiveTab] = useState('Stats');
  const [attacking, setAttacking] = useState(false);
  const [imgError, setImgError] = useState(false);

  const playCry = useCallback((dataToUse) => {
    const target = dataToUse || pokemon;
    if (!target) return;
    const cryUrl = target.cries?.latest || target.cries?.legacy;
    if (cryUrl) {
      const audio = new Audio(cryUrl);
      audio.volume = 0.45;
      audio.play().catch(e => console.log('Audio playback failed or was interrupted:', e));
    }
  }, [pokemon]);

  const searchPokemon = useCallback(async (nameOrId) => {
    if (!nameOrId) return;
    setLoading(true);
    setPokemon(null);
    setSpecies(null);
    setImgError(false);
    setShiny(false);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId.toLowerCase().trim()}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setPokemon(data);

      // Fetch species for flavor text
      const specRes = await fetch(data.species.url);
      const specData = await specRes.json();
      setSpecies(specData);

      // Automatically play battle cry on load
      if (data.cries) {
        const cryUrl = data.cries.latest || data.cries.legacy;
        if (cryUrl) {
          const audio = new Audio(cryUrl);
          audio.volume = 0.35;
          setTimeout(() => {
            audio.play().catch(() => {});
          }, 350);
        }
      }
    } catch {
      toast('Pokemon not found. Try a name or Pokedex number.', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  function handleSearch(e) {
    e.preventDefault();
    searchPokemon(query);
  }

  function handleSpriteClick() {
    if (attacking) return;
    setAttacking(true);
    playCry();
    setTimeout(() => setAttacking(false), 600);
  }

  const spriteUrl = pokemon
    ? (shiny
        ? (pokemon.sprites.other?.['official-artwork']?.front_shiny || pokemon.sprites.front_shiny)
        : (pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default))
    : null;

  const flavorText = species?.flavor_text_entries?.find(e => e.language.name === 'en')?.flavor_text?.replace(/\f/g, ' ') || '';

  return (
    <section id="profile" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeader
        icon={null}
        title="POKEMON PROFILE VIEWER"
        subtitle="Search any Pokemon by name or Pokedex number. Explore stats, moves, and abilities with live PokeAPI data."
        accent="#06d6a0"
      />

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '32px', maxWidth: '600px' }}>
        <input
          className="sci-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter Pokémon name or #ID (e.g. charizard or 6)"
          style={{ borderColor: 'rgba(6,214,160,0.4)', flex: 1 }}
        />
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(6,214,160,0.5)' }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          style={{
            padding: '10px 24px', background: 'rgba(6,214,160,0.2)',
            border: '1px solid #06d6a0', borderRadius: '6px', cursor: 'pointer',
            color: '#06d6a0', fontFamily: 'Press Start 2P', fontSize: '8px',
            whiteSpace: 'nowrap', transition: 'all 0.3s',
          }}
        >
          SEARCH
        </motion.button>
      </form>

      {/* Quick Access Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {['pikachu','charizard','mewtwo','gengar','eevee','lucario','garchomp','greninja'].map(name => (
          <motion.button
            key={name}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setQuery(name); searchPokemon(name); }}
            style={{
              padding: '6px 12px', background: 'rgba(67,97,238,0.1)',
              border: '1px solid rgba(67,97,238,0.3)', borderRadius: '20px', cursor: 'pointer',
              color: '#8888bb', fontFamily: 'Exo 2', fontSize: '12px', fontWeight: 600,
              textTransform: 'capitalize', transition: 'all 0.2s',
            }}
          >
            {name}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PokeballLoader size={80}/>
          </motion.div>
        )}

        {pokemon && !loading && (
          <motion.div
            key={pokemon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}
          >
            {/* Left: Sprite Card */}
            <div>
              <div className="glass-card" style={{
                borderRadius: '16px', padding: '28px', textAlign: 'center',
                border: '1px solid rgba(6,214,160,0.3)',
                background: 'linear-gradient(135deg, rgba(13,13,34,0.95), rgba(6,214,160,0.04))',
              }}>
                {/* ID + Name */}
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#8888bb', marginBottom: '4px' }}>
                  #{String(pokemon.id).padStart(4, '0')}
                </div>
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '12px', color: '#e8e8ff', marginBottom: '16px', textTransform: 'capitalize' }}>
                  {pokemon.name}
                </div>

                {/* Sprite */}
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}
                  onClick={handleSpriteClick}
                >
                  {/* Floating Sound Cry Button */}
                  {pokemon.cries && (pokemon.cries.latest || pokemon.cries.legacy) && (
                    <motion.button
                      whileHover={{ scale: 1.15, background: 'rgba(6,214,160,0.35)', boxShadow: '0 0 15px #06d6a0' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleSpriteClick(); }}
                      style={{
                        position: 'absolute', top: 0, right: 0,
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(10,10,26,0.85)', border: '1px solid #06d6a0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                      }}
                      title="Play official battle cry audio"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                    </motion.button>
                  )}

                  {/* Sound Wave Ripple Effect */}
                  <AnimatePresence>
                    {attacking && (
                      <motion.div
                        initial={{ opacity: 0.8, scale: 0.7 }}
                        animate={{ opacity: 0, scale: 1.8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55 }}
                        style={{
                          position: 'absolute',
                          width: '120px',
                          height: '120px',
                          borderRadius: '50%',
                          border: '2px solid #06d6a0',
                          boxShadow: '0 0 20px #06d6a0, inset 0 0 20px #06d6a0',
                          pointerEvents: 'none',
                          zIndex: 1,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {!imgError && spriteUrl ? (
                    <motion.img
                      src={spriteUrl}
                      alt={pokemon.name}
                      onError={() => setImgError(true)}
                      animate={
                        attacking
                          ? { x: [0, 30, -5, 0], scale: [1, 1.2, 1] }
                          : { y: [0, -8, 0] }
                      }
                      transition={
                        attacking
                          ? { duration: 0.5, ease: 'easeOut' }
                          : { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
                      }
                      style={{
                        maxHeight: '180px', maxWidth: '180px', objectFit: 'contain',
                        filter: `drop-shadow(0 8px 20px rgba(6,214,160,0.4)) ${shiny ? 'drop-shadow(0 0 15px rgba(255,214,10,0.6))' : ''}`,
                        zIndex: 2,
                      }}
                    />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(6,214,160,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontFamily: 'Press Start 2P', fontSize: '18px', color: '#06d6a030', zIndex: 2 }}>?</div>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, fontFamily: 'Press Start 2P', fontSize: '5px', color: '#8888bb', zIndex: 3 }}>
                    click to roar & attack
                  </div>
                </div>

                {/* Types */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', margin: '12px 0' }}>
                  {pokemon.types.map(t => <TypeBadge key={t.type.name} type={t.type.name}/>)}
                </div>

                {/* Shiny Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShiny(s => !s)}
                  style={{
                    padding: '8px 20px', borderRadius: '6px', cursor: 'pointer',
                    background: shiny ? 'rgba(255,214,10,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${shiny ? '#ffd60a' : 'rgba(255,255,255,0.15)'}`,
                    color: shiny ? '#ffd60a' : '#8888bb',
                    fontFamily: 'Press Start 2P', fontSize: '7px', transition: 'all 0.3s', width: '100%',
                  }}
                >
                  {shiny ? 'SHINY ON' : 'SHINY OFF'}
                </motion.button>

                {/* Base Info */}
                <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'HEIGHT', value: `${(pokemon.height / 10).toFixed(1)}m` },
                    { label: 'WEIGHT', value: `${(pokemon.weight / 10).toFixed(1)}kg` },
                    { label: 'BASE EXP', value: pokemon.base_experience || '—' },
                    { label: 'BST', value: pokemon.stats.reduce((s, st) => s + st.base_stat, 0) },
                  ].map(info => (
                    <div key={info.label} style={{ padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Press Start 2P', fontSize: '5px', color: '#8888bb', marginBottom: '4px' }}>{info.label}</div>
                      <div style={{ fontFamily: 'Exo 2', fontWeight: 700, fontSize: '14px', color: '#e8e8ff' }}>{info.value}</div>
                    </div>
                  ))}
                </div>

                {/* Flavor Text */}
                {flavorText && (
                  <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', borderLeft: '2px solid #06d6a0' }}>
                    <div style={{ fontFamily: 'Exo 2', fontSize: '11px', color: '#8888bb', lineHeight: 1.7, fontStyle: 'italic' }}>"{flavorText}"</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Tabs */}
            <div>
              {/* Tab Header */}
              <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid rgba(67,97,238,0.2)', paddingBottom: '0' }}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'Press Start 2P', fontSize: '8px',
                      color: activeTab === tab ? '#06d6a0' : '#8888bb',
                      borderBottom: `2px solid ${activeTab === tab ? '#06d6a0' : 'transparent'}`,
                      transition: 'all 0.2s', marginBottom: '-1px',
                    }}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'Stats' && (
                  <motion.div key="stats" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="glass-card" style={{ borderRadius: '12px', padding: '24px', border: '1px solid rgba(6,214,160,0.2)' }}>
                      {pokemon.stats.map((stat, i) => (
                        <StatBar
                          key={stat.stat.name}
                          label={STAT_ABBREV[stat.stat.name] || stat.stat.name}
                          value={stat.base_stat}
                          color={STAT_COLORS[stat.stat.name] || '#4361ee'}
                          delay={i * 0.1}
                        />
                      ))}
                      <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#8888bb' }}>TOTAL</span>
                        <span style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#ffd60a' }}>
                          {pokemon.stats.reduce((s, st) => s + st.base_stat, 0)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'Moves' && (
                  <motion.div key="moves" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="glass-card" style={{ borderRadius: '12px', padding: '24px', maxHeight: '420px', overflowY: 'auto', border: '1px solid rgba(6,214,160,0.2)' }}>
                      <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '12px' }}>
                        {pokemon.moves.length} MOVES AVAILABLE
                      </div>
                      <div style={{ columns: 2, gap: '8px' }}>
                        {pokemon.moves.slice(0, 60).map((move, i) => <MoveRow key={move.move.name} move={move} index={i}/>)}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'Abilities' && (
                  <motion.div key="abilities" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="glass-card" style={{ borderRadius: '12px', padding: '24px', border: '1px solid rgba(6,214,160,0.2)' }}>
                      <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '16px' }}>
                        CLICK AN ABILITY TO SEE DESCRIPTION
                      </div>
                      {pokemon.abilities.map((ability, i) => <AbilityRow key={ability.ability.name} ability={ability} index={i}/>)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {!pokemon && !loading && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card" style={{ borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px solid rgba(6,214,160,0.2)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(6,214,160,0.06)', border: '1px solid rgba(6,214,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'Press Start 2P', fontSize: '10px', color: '#06d6a030' }}>?</div>
            <div style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#8888bb' }}>Search a Pokémon to begin</div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 800px) {
          #profile .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
