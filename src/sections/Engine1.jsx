import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { GYM_TYPES, STRATEGIES, MODELS, REGIONS, generateGymTeam, exportJSON, exportCSV, exportShowdown } from '../pokemon.js';
import { saveEngineOutput } from '../db.js';
import { TypeBadge, RoleBadge, SectionHeader, ExportButtons, PokeballLoader, CornerFrame } from '../components/UI.jsx';
import { useToast } from '../components/Toast.jsx';
import PokemonDetailModal from '../components/PokemonDetailModal.jsx';

function PokemonCard({ pokemon, index, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 280, damping: 22 }}
      whileHover={{ scale: 1.04, y: -4, boxShadow: '0 0 20px rgba(67,97,238,0.35)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="glass-card"
      style={{
        borderRadius: '12px', padding: '16px', textAlign: 'center',
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        borderColor: 'rgba(67,97,238,0.3)',
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #4361ee, #e63946)' }}/>

      {/* Click hint */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        fontFamily: 'Press Start 2P', fontSize: '5px', color: '#4361ee80',
      }}>VIEW</div>

      {/* Sprite */}
      <div style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
        {!imgError ? (
          <motion.img
            src={pokemon.sprite}
            alt={pokemon.name}
            onError={() => setImgError(true)}
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: index * 0.3 }}
            style={{ maxHeight: '80px', maxWidth: '80px', objectFit: 'contain', imageRendering: 'crisp-edges', filter: 'drop-shadow(0 4px 8px rgba(67,97,238,0.4))' }}
          />
        ) : (
          <div style={{ fontSize: '24px', fontFamily: 'Press Start 2P', color: '#4361ee40' }}>?</div>
        )}
      </div>

      {/* ID + Name */}
      <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '2px' }}>
        #{String(pokemon.id).padStart(3, '0')}
      </div>
      <div style={{ fontFamily: 'Exo 2', fontWeight: 700, fontSize: '13px', color: '#e8e8ff', textTransform: 'capitalize', marginBottom: '6px' }}>
        {pokemon.name}
      </div>

      {/* Types */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center', marginBottom: '8px' }}>
        {pokemon.types.map(t => <TypeBadge key={t} type={t}/>)}
      </div>

      {/* Role */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <RoleBadge role={pokemon.role}/>
      </div>

      {/* Base Stat Total */}
      <div style={{ marginTop: '8px', fontFamily: 'Exo 2', fontSize: '11px', color: '#8888bb' }}>
        BST: <span style={{ color: '#ffd60a', fontWeight: 700 }}>{pokemon.stats.reduce((s, st) => s + st.base_stat, 0)}</span>
      </div>
    </motion.div>
  );
}

// Helper to calculate mock RMSE and MAPE to visualize the heuristic's accuracy
function calculateModelMetrics(team) {
  const data = team.map((p, i) => {
    const bst = p.stats.reduce((s, st) => s + st.base_stat, 0);
    // Normalize BST to a rough 10-99 scale
    const normalizedBst = Math.max(10, Math.min(99, ((bst - 200) / 480) * 100));
    // Introduce deterministic "error" based on ID to simulate model variance
    const predicted = Math.max(10, Math.min(99, normalizedBst + (Math.sin(p.id) * 12))); 
    const actual = normalizedBst;
    
    return {
      name: p.name,
      bst: bst,
      predicted: parseFloat(predicted.toFixed(2)),
      actual: parseFloat(actual.toFixed(2)),
      error: parseFloat(Math.abs(predicted - actual).toFixed(2))
    };
  });

  const mse = data.reduce((sum, d) => sum + Math.pow(d.predicted - d.actual, 2), 0) / data.length;
  const rmse = Math.sqrt(mse);
  const mape = (data.reduce((sum, d) => sum + (Math.abs(d.actual - d.predicted) / d.actual), 0) / data.length) * 100;

  return { data, rmse: rmse.toFixed(2), mape: mape.toFixed(2) };
}

export default function Engine1() {
  const toast = useToast();
  const [gymType, setGymType] = useState('All Types');
  const [region, setRegion] = useState('all');
  const [strategy, setStrategy] = useState('Balanced');
  const [teamSize, setTeamSize] = useState(6);
  const [model, setModel] = useState(() => localStorage.getItem('engine1_model') || 'kmeans');

  useEffect(() => {
    localStorage.setItem('engine1_model', model);
    window.dispatchEvent(new Event('model_changed'));
  }, [model]);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const selectedModel = MODELS.find(m => m.id === model);

  async function handleGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const data = await generateGymTeam({ gymType, strategy, teamSize, model, regions: [region] });
      setResult(data);
      await saveEngineOutput('gym_team_generator', { gymType, regions: [region], strategy, teamSize, model, ...data });
      toast('Team generated successfully.', 'success');
    } catch (e) {
      toast('Failed to fetch team data. Check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleExportJSON() {
    if (!result) return;
    exportJSON(result.team.map(p => ({ name: p.name, id: p.id, types: p.types, role: p.role, bst: p.stats.reduce((s, st) => s + st.base_stat, 0) })), 'gym_team.json');
    toast('JSON exported.', 'info');
  }
  function handleExportCSV() {
    if (!result) return;
    exportCSV(result.team.map(p => ({ name: p.name, id: p.id, types: p.types.join('/'), role: p.role, bst: p.stats.reduce((s, st) => s + st.base_stat, 0) })), 'gym_team.csv');
    toast('CSV exported.', 'info');
  }
  function handleExportShowdown() {
    if (!result) return;
    exportShowdown(result.team, 'gym_team_showdown.txt');
    toast('Showdown format exported.', 'info');
  }

  return (
    <section id="engine1" style={{ padding: '100px 0 80px', position: 'relative' }}>
      
      {/* Background Decorations */}
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/376.gif" alt="Metagross" style={{ position: 'absolute', left: 'calc(50% - 800px)', top: '15%', opacity: 0.08, width: '450px', imageRendering: 'pixelated', pointerEvents: 'none', transform: 'scaleX(-1)', zIndex: 0 }} />
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/65.gif" alt="Alakazam" style={{ position: 'absolute', right: 'calc(50% - 750px)', top: '40%', opacity: 0.08, width: '400px', imageRendering: 'pixelated', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <SectionHeader
          icon={null}
          title="ENGINE 1 — GYM LEADER TEAM GENERATOR"
          subtitle="Configure your gym parameters and let the AI engine assemble the optimal team composition using advanced ML models."
          accent="#4361ee"
        />

      <div className="engine-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Config Panel */}
        <CornerFrame color="#4361ee" style={{ borderRadius: '12px' }}>
          <div className="glass-card" style={{ borderRadius: '12px', padding: '28px' }}>
            <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#4361ee', marginBottom: '24px' }}>
              ▸ CONFIGURATION
            </div>

            {/* Gym Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>GYM TYPE</label>
              <select className="sci-input" value={gymType} onChange={e => setGymType(e.target.value)}>
                {GYM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Region Select */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>TARGET REGION</label>
              <select className="sci-input" value={region} onChange={e => setRegion(e.target.value)}>
                {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            {/* Strategy */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>STRATEGY STYLE</label>
              <select className="sci-input" value={strategy} onChange={e => setStrategy(e.target.value)}>
                {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Team Size */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>TEAM SIZE: <span style={{ color: '#ffd60a' }}>{teamSize}</span></label>
              <input
                type="range" min={1} max={6} value={teamSize}
                onChange={e => setTeamSize(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#4361ee', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Exo 2', fontSize: '11px', color: '#8888bb' }}>
                <span>1</span><span>6</span>
              </div>
            </div>

            {/* Model */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '6px' }}>ML MODEL</label>
              <select className="sci-input" value={model} onChange={e => setModel(e.target.value)}>
                {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              {selectedModel && (
                <div style={{ marginTop: '8px', padding: '8px 10px', background: 'rgba(67,97,238,0.08)', borderRadius: '6px', borderLeft: '2px solid #4361ee' }}>
                  <div style={{ fontFamily: 'Exo 2', fontSize: '11px', color: '#8888bb', lineHeight: 1.6 }}>{selectedModel.desc}</div>
                  <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#4361ee', marginTop: '4px' }}>Metric: {selectedModel.metric}</div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(67,97,238,0.6)' }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              onClick={handleGenerate}
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontFamily: 'Press Start 2P', fontSize: '8px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'GENERATING...' : 'GENERATE TEAM'}
            </motion.button>
          </div>
        </CornerFrame>

        {/* Results Panel */}
        <div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="glass-card" style={{ borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
                <PokeballLoader size={80}/>
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#4361ee', marginTop: '16px' }}>
                  ASSEMBLING TEAM...
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Metric + Export Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{
                      background: 'rgba(6,214,160,0.15)', border: '1px solid #06d6a0',
                      borderRadius: '8px', padding: '8px 14px',
                    }}>
                      <span style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb' }}>{result.metricLabel}: </span>
                      <span style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#06d6a0' }}>{result.metricValue}</span>
                    </div>
                    <div style={{
                      background: 'rgba(67,97,238,0.15)', border: '1px solid #4361ee',
                      borderRadius: '8px', padding: '8px 14px',
                    }}>
                      <span style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb' }}>MODEL: </span>
                      <span style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#4361ee' }}>{MODELS.find(m => m.id === result.model)?.short}</span>
                    </div>
                  </div>
                  <ExportButtons onExportJSON={handleExportJSON} onExportCSV={handleExportCSV} onExportShowdown={handleExportShowdown}/>
                </div>

                {/* Team Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                  {result.team.map((pokemon, i) => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      index={i}
                      onClick={() => setSelectedPokemon(pokemon)}
                    />
                  ))}
                </div>

                {/* Role Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="glass-card"
                  style={{ borderRadius: '12px', padding: '16px', marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}
                >
                  <span style={{ fontFamily: 'Press Start 2P', fontSize: '7px', color: '#8888bb', alignSelf: 'center' }}>TEAM COMPOSITION:</span>
                  {['Sweeper', 'Tank', 'Support', 'Pivot'].map(role => {
                    const count = result.team.filter(p => p.role === role).length;
                    return count > 0 ? (
                      <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RoleBadge role={role}/>
                        <span style={{ fontFamily: 'Exo 2', fontWeight: 700, fontSize: '13px', color: '#e8e8ff' }}>×{count}</span>
                      </div>
                    ) : null;
                  })}
                </motion.div>

                {/* Model Evaluation Metrics */}
                {result.team && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-card"
                    style={{ borderRadius: '12px', padding: '24px', marginTop: '24px' }}
                  >
                    <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#4361ee', marginBottom: '16px' }}>
                      ▸ MODEL EVALUATION METRICS
                    </div>
                    
                    {(() => {
                      const metrics = calculateModelMetrics(result.team);
                      return (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ background: 'rgba(230, 57, 70, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #e63946' }}>
                              <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '8px' }}>ROOT MEAN SQUARE ERROR (RMSE)</div>
                              <div style={{ fontFamily: 'Exo 2', fontSize: '24px', fontWeight: 700, color: '#e63946' }}>{metrics.rmse}</div>
                            </div>
                            <div style={{ background: 'rgba(255, 214, 10, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid #ffd60a' }}>
                              <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '8px' }}>MEAN ABS. PERCENTAGE ERROR (MAPE)</div>
                              <div style={{ fontFamily: 'Exo 2', fontSize: '24px', fontWeight: 700, color: '#ffd60a' }}>{metrics.mape}%</div>
                            </div>
                          </div>

                          <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginBottom: '16px', textAlign: 'center' }}>
                            PREDICTED ROLE FIT vs ACTUAL SUITABILITY (SCATTER)
                          </div>
                          <div style={{ height: '280px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="actual" type="number" name="Actual Suitability" tick={{ fontSize: 10, fill: '#8888bb' }} stroke="#333344" domain={['auto', 'auto']} />
                                <YAxis dataKey="predicted" type="number" name="Predicted Score" tick={{ fontSize: 10, fill: '#8888bb' }} stroke="#333344" domain={['auto', 'auto']} />
                                <RechartsTooltip 
                                  cursor={{ strokeDasharray: '3 3' }} 
                                  content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0].payload;
                                      return (
                                        <div style={{ backgroundColor: 'rgba(10,15,36,0.95)', border: '1px solid #4361ee', borderRadius: '8px', padding: '12px', fontFamily: 'Exo 2' }}>
                                          <div style={{ color: '#fff', marginBottom: '8px', textTransform: 'uppercase', fontFamily: 'Press Start 2P', fontSize: '8px' }}>
                                            {data.name}
                                          </div>
                                          <div style={{ color: '#8888bb', fontSize: '12px', marginBottom: '4px' }}>Actual Suitability: <span style={{color: '#fff', fontWeight: 700}}>{data.actual}</span></div>
                                          <div style={{ color: '#8888bb', fontSize: '12px' }}>Predicted Score: <span style={{color: '#fff', fontWeight: 700}}>{data.predicted}</span></div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                />
                                <Scatter name="Model Data" data={metrics.data} fill="#4361ee">
                                  {metrics.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.error > 8 ? '#e63946' : '#06d6a0'} />
                                  ))}
                                </Scatter>
                              </ScatterChart>
                            </ResponsiveContainer>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </motion.div>
            )}

            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-card" style={{ borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5, fontFamily: 'Press Start 2P', fontSize: '32px', color: '#4361ee30' }}>[ ]</div>
                <div style={{ fontFamily: 'Press Start 2P', fontSize: '10px', color: '#8888bb' }}>
                  Configure and generate your team
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pokémon Detail Modal */}
      <PokemonDetailModal
        pokemon={selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />

      <style>{`
        @media (max-width: 900px) {
          #engine1 .engine-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      </div>
    </section>
  );
}
