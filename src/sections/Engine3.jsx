import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { predictBattle, parseTeamInput, exportJSON } from '../pokemon.js';
import { savePrediction, saveBattleResult, getStats } from '../db.js';
import { CircularProgress, SectionHeader, PokeballLoader } from '../components/UI.jsx';
import { useToast } from '../components/Toast.jsx';

function TeamInput({ label, value, onChange, color }) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onChange(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  return (
    <div style={{ flex: 1 }}>
      <div style={{
        padding: '8px 16px', borderRadius: '8px 8px 0 0',
        background: color === 'A' ? 'rgba(67,97,238,0.2)' : 'rgba(230,57,70,0.2)',
        borderBottom: `2px solid ${color === 'A' ? '#4361ee' : '#e63946'}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: color === 'A' ? '#4361ee' : '#e63946' }}>
          {label.toUpperCase()}
        </span>
        <input type="file" accept=".txt,.csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            background: 'none', border: `1px solid ${color === 'A' ? '#4361ee' : '#e63946'}`,
            color: color === 'A' ? '#4361ee' : '#e63946', borderRadius: '4px', padding: '4px 8px',
            fontFamily: 'Exo 2', fontSize: '10px', cursor: 'pointer', fontWeight: 600
          }}
        >
          Upload CSV / TXT
        </button>
      </div>
      <div className="glass-card" style={{ borderRadius: '0 0 8px 8px', padding: '16px', borderTop: 'none' }}>
        <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '8px' }}>
          TEAM (one per line)
        </label>
        <textarea
          className="sci-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={'charizard\nblastoise\nvenusaur\npikachu\ngengar\nsnorlax'}
          rows={6}
          style={{ fontSize: '12px' }}
        />
      </div>
    </div>
  );
}

export default function Engine3() {
  const toast = useToast();
  const [teamAInput, setTeamAInput] = useState('');
  const [teamBInput, setTeamBInput] = useState('');
  const [battlerAName, setBattlerAName] = useState('');
  const [battlerBName, setBattlerBName] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [locked, setLocked] = useState(false);

  // Ground truth form
  const [actualWinner, setActualWinner] = useState('A');
  const [finalScore, setFinalScore] = useState('');
  const [replayLink, setReplayLink] = useState('');
  const [mvpPokemon, setMvpPokemon] = useState('');
  const [logResult, setLogResult] = useState(null);

  async function handlePredict() {
    const parsedA = parseTeamInput(teamAInput);
    const parsedB = parseTeamInput(teamBInput);

    if (parsedA.length === 0 || parsedB.length === 0) {
      toast('Enter or upload at least one valid Pokemon for each battler.', 'warning'); return;
    }
    setLoading(true);
    setPrediction(null);
    setLocked(false);
    setLogResult(null);
    try {
      const [teamAData, teamBData] = await Promise.all([
        Promise.all(parsedA.slice(0,6).map(p => fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`).then(r=>r.json()).then(data => ({ ...data, parsed: p })).catch(()=>null))),
        Promise.all(parsedB.slice(0,6).map(p => fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`).then(r=>r.json()).then(data => ({ ...data, parsed: p })).catch(()=>null))),
      ]);
      const teamA = teamAData.filter(Boolean);
      const teamB = teamBData.filter(Boolean);
      const result = predictBattle(teamA, teamB);
      setPrediction({ ...result, teamA, teamB });
      toast('Prediction calculated. Lock it before the battle.', 'success');
    } catch {
      toast('Failed to fetch Pokemon data.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleLock() {
    if (!prediction) return;
    const matchId = `MATCH-${Date.now()}`;
    await savePrediction(matchId, battlerAName || 'Battler A', battlerBName || 'Battler B',
      prediction.winner === 'A' ? (battlerAName || 'Battler A') : (battlerBName || 'Battler B'), replayLink);
    setLocked(true);
    toast('Prediction locked.', 'success');
  }

  async function handleLogResult() {
    if (!prediction) return;
    const matchId = `MATCH-${Date.now()}`;
    const predicted = prediction.winner === 'A' ? (battlerAName || 'Battler A') : (battlerBName || 'Battler B');
    const actual = actualWinner === 'A' ? (battlerAName || 'Battler A') : (battlerBName || 'Battler B');
    const conf = prediction.winner === 'A' ? prediction.confA : prediction.confB;
    const result = await saveBattleResult(matchId, battlerAName || 'Battler A', battlerBName || 'Battler B', predicted, actual, conf, mvpPokemon, replayLink);
    setLogResult(result);
    toast(result.hit ? 'Correct prediction logged.' : 'Incorrect prediction logged.', result.hit ? 'success' : 'warning');
  }

  return (
    <section id="engine3" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeader
        icon={null}
        title="ENGINE 3 — BATTLE PREDICTOR"
        subtitle="Enter two battler teams and let the AI predict the winner with confidence ratings. Lock your prediction before the battle starts."
        accent="#ffd60a"
      />

      {/* Battler Name Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <input
          className="sci-input"
          value={battlerAName}
          onChange={e => setBattlerAName(e.target.value)}
          placeholder="Battler A Name"
          style={{ borderColor: 'rgba(67,97,238,0.5)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: '#ffd60a', textAlign: 'center', padding: '0 8px', textShadow: '0 0 20px #ffd60a' }}
        >
          VS
        </motion.div>
        <input
          className="sci-input"
          value={battlerBName}
          onChange={e => setBattlerBName(e.target.value)}
          placeholder="Battler B Name"
          style={{ borderColor: 'rgba(230,57,70,0.5)' }}
        />
      </div>

      {/* Team Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <TeamInput label="Battler A" value={teamAInput} onChange={setTeamAInput} color="A"/>
        <TeamInput label="Battler B" value={teamBInput} onChange={setTeamBInput} color="B"/>
      </div>

      {/* Predict Button */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,214,10,0.6)' }}
          whileTap={{ scale: 0.97 }}
          className="btn-yellow"
          onClick={handlePredict}
          disabled={loading}
          style={{ padding: '14px 40px', fontFamily: 'Press Start 2P', fontSize: '9px', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'CALCULATING...' : 'PREDICT BATTLE'}
        </motion.button>

      </div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', marginBottom: '24px' }}>
            <PokeballLoader size={80}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prediction Result */}
      <AnimatePresence>
        {prediction && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* VS Screen */}
            <div className="glass-card" style={{
              borderRadius: '16px', padding: '40px', marginBottom: '24px',
              background: 'linear-gradient(135deg, rgba(13,13,34,0.98), rgba(18,18,42,0.95))',
              border: '1px solid rgba(255,214,10,0.2)',
              boxShadow: '0 0 40px rgba(255,214,10,0.08)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Winner Banner */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  textAlign: 'center', marginBottom: '32px',
                  padding: '12px', borderRadius: '8px',
                  background: `linear-gradient(135deg, ${prediction.winner === 'A' ? 'rgba(67,97,238,0.2)' : 'rgba(230,57,70,0.2)'}, transparent)`,
                  border: `1px solid ${prediction.winner === 'A' ? '#4361ee' : '#e63946'}40`,
                }}
              >
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '7px', color: '#8888bb', marginBottom: '4px' }}>PREDICTED WINNER</div>
                <motion.div
                  animate={{ textShadow: prediction.winner === 'A'
                    ? ['0 0 15px #4361ee', '0 0 30px #4361ee, 0 0 60px #4361ee30', '0 0 15px #4361ee']
                    : ['0 0 15px #e63946', '0 0 30px #e63946, 0 0 60px #e6394630', '0 0 15px #e63946'] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    fontFamily: 'Press Start 2P', fontSize: '18px',
                    color: prediction.winner === 'A' ? '#4361ee' : '#e63946',
                  }}
                >
                  {prediction.winner === 'A' ? (battlerAName || 'BATTLER A') : (battlerBName || 'BATTLER B')}
                </motion.div>
                {locked && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '8px', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#06d6a0' }}>
                    [ LOCKED ] PREDICTION LOCKED
                  </motion.div>
                )}
              </motion.div>

              {/* Confidence Rings */}
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#4361ee', marginBottom: '12px' }}>
                    {battlerAName || 'BATTLER A'}
                  </div>
                  <CircularProgress value={prediction.confA} size={140} color="#4361ee" label="Confidence"/>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                    {prediction.teamA.slice(0,6).map(p => {
                      const spriteUrl = p.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default || p.sprites?.front_default;
                      return (
                        <div key={p.id} style={{
                          width: '48px', height: '48px',
                          background: 'rgba(67,97,238,0.15)', border: '1px solid rgba(67,97,238,0.4)',
                          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }} title={p.name}>
                          {spriteUrl ? (
                            <img src={spriteUrl} alt={p.name} style={{ maxHeight: '40px', maxWidth: '40px', imageRendering: 'pixelated' }} />
                          ) : (
                            <span style={{ fontSize: '10px' }}>?</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  style={{ fontFamily: 'Press Start 2P', fontSize: '28px', color: '#ffd60a', textShadow: '0 0 30px #ffd60a' }}
                >
                  VS
                </motion.div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#e63946', marginBottom: '12px' }}>
                    {battlerBName || 'BATTLER B'}
                  </div>
                  <CircularProgress value={prediction.confB} size={140} color="#e63946" label="Confidence"/>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                    {prediction.teamB.slice(0,6).map(p => {
                      const spriteUrl = p.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default || p.sprites?.front_default;
                      return (
                        <div key={p.id} style={{
                          width: '48px', height: '48px',
                          background: 'rgba(230,57,70,0.15)', border: '1px solid rgba(230,57,70,0.4)',
                          borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }} title={p.name}>
                          {spriteUrl ? (
                            <img src={spriteUrl} alt={p.name} style={{ maxHeight: '40px', maxWidth: '40px', imageRendering: 'pixelated' }} />
                          ) : (
                            <span style={{ fontSize: '10px' }}>?</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {!locked && (
                <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '100%', maxWidth: '400px' }}>
                    <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '8px', textAlign: 'left' }}>REPLAY LINK (OPTIONAL)</label>
                    <input className="sci-input" value={replayLink} onChange={e => setReplayLink(e.target.value)} placeholder="https://replay.pokemonshowdown.com/..."/>
                  </div>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLock}
                    style={{
                      padding: '14px 32px', fontFamily: 'Press Start 2P', fontSize: '9px',
                      background: 'rgba(6,214,160,0.2)', border: '2px solid #06d6a0',
                      color: '#06d6a0', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s',
                    }}
                  >
                    LOCK PREDICTION
                  </motion.button>
                </div>
              )}
            </div>

            {/* Ground Truth Logger */}
            <div className="glass-card" style={{ borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#ffd60a', marginBottom: '20px' }}>
                ▸ GROUND TRUTH LOGGER
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>ACTUAL WINNER</label>
                  <select className="sci-input" value={actualWinner} onChange={e => setActualWinner(e.target.value)}>
                    <option value="A">{battlerAName || 'Battler A'}</option>
                    <option value="B">{battlerBName || 'Battler B'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>FINAL SCORE</label>
                  <input className="sci-input" value={finalScore} onChange={e => setFinalScore(e.target.value)} placeholder="e.g. 3-1"/>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>MVP POKÉMON</label>
                  <input className="sci-input" value={mvpPokemon} onChange={e => setMvpPokemon(e.target.value)} placeholder="e.g. Charizard"/>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>REPLAY LINK</label>
                  <input className="sci-input" value={replayLink} onChange={e => setReplayLink(e.target.value)} placeholder="https://replay.pokemonshowdown.com/..."/>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary"
                  onClick={handleLogResult}
                  style={{ fontFamily: 'Press Start 2P', fontSize: '8px', padding: '12px 24px' }}
                >
                  LOG RESULT
                </motion.button>

                <AnimatePresence>
                  {logResult && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        padding: '10px 16px', borderRadius: '8px',
                        background: logResult.hit ? 'rgba(6,214,160,0.15)' : 'rgba(230,57,70,0.15)',
                        border: `1px solid ${logResult.hit ? '#06d6a0' : '#e63946'}`,
                        fontFamily: 'Press Start 2P', fontSize: '8px',
                        color: logResult.hit ? '#06d6a0' : '#e63946',
                      }}
                    >
                      {logResult.hit ? 'CORRECT' : 'INCORRECT'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          #engine3 .team-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
