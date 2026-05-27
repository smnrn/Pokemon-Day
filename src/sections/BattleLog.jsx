import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBattleLog, getStats } from '../db.js';
import { exportJSON, exportCSV } from '../pokemon.js';
import { SectionHeader, MetricCard, ExportButtons } from '../components/UI.jsx';
import { useToast } from '../components/Toast.jsx';

// ---- Gauge Component ----
function Gauge({ label, value, max, color, format }) {
  const pct = Math.min(1, value / max);
  const angle = pct * 180;
  const r = 40;
  const cx = 55, cy = 55;
  const startAngle = -180;
  const endAngle = startAngle + angle;
  const toRad = deg => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const la = angle > 180 ? 1 : 0;
  const arcPath = `M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2}`;
  const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={110} height={65} viewBox="0 0 110 65">
        <path d={bgPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round"/>
        <motion.path
          d={bgPath}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${Math.PI * r} ${Math.PI * r}`}
          initial={{ strokeDashoffset: Math.PI * r }}
          animate={{ strokeDashoffset: Math.PI * r * (1 - pct) }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
        <text x={55} y={52} textAnchor="middle" fill={color} style={{ fontFamily: 'Exo 2', fontWeight: 700, fontSize: '12px' }}>
          {format(value)}
        </text>
      </svg>
      <div style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

// ---- Confusion Matrix ----
function ConfusionMatrix({ log }) {
  const tp = log.filter(r => r.hit && r.predicted_winner === r.battler_a).length;
  const fp = log.filter(r => !r.hit && r.predicted_winner === r.battler_a).length;
  const fn = log.filter(r => !r.hit && r.predicted_winner === r.battler_b).length;
  const tn = log.filter(r => r.hit && r.predicted_winner === r.battler_b).length;

  const cells = [
    { label: 'TP', value: tp, color: '#06d6a0', desc: 'True Positive' },
    { label: 'FP', value: fp, color: '#e63946', desc: 'False Positive' },
    { label: 'FN', value: fn, color: '#ffd60a', desc: 'False Negative' },
    { label: 'TN', value: tn, color: '#4361ee', desc: 'True Negative' },
  ];

  return (
    <div>
      <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#4361ee', marginBottom: '16px' }}>CONFUSION MATRIX</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxWidth: '280px' }}>
        {cells.map((cell, i) => (
          <motion.div
            key={cell.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '16px', borderRadius: '8px', textAlign: 'center',
              background: `${cell.color}12`, border: `1px solid ${cell.color}40`,
            }}
          >
            <div style={{ fontFamily: 'Press Start 2P', fontSize: '20px', color: cell.color, marginBottom: '4px' }}>{cell.value}</div>
            <div style={{ fontFamily: 'Press Start 2P', fontSize: '7px', color: cell.color }}>{cell.label}</div>
            <div style={{ fontFamily: 'Exo 2', fontSize: '10px', color: '#8888bb', marginTop: '2px' }}>{cell.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function BattleLog() {
  const toast = useToast();
  const [log, setLog] = useState([]);
  const [stats, setStats] = useState({ total: 0, correct: 0, accuracy: 0, brierScore: 0, logLoss: 0 });

  useEffect(() => {
    const refresh = async () => {
      setLog(await getBattleLog());
      setStats(await getStats());
    };
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  function handleExportJSON() {
    exportJSON(log, 'battle_log.json');
    toast('JSON exported.', 'info');
  }
  function handleExportCSV() {
    exportCSV(log.map(r => ({
      match_id: r.match_id, battler_a: r.battler_a, battler_b: r.battler_b,
      predicted: r.predicted_winner, actual: r.actual_winner, hit: r.hit, confidence: r.confidence,
      mvp: r.mvp_pokemon, timestamp: r.timestamp,
    })), 'battle_log.csv');
    toast('CSV exported.', 'info');
  }

  return (
    <section id="battlelog" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeader
        icon={null}
        title="BATTLE LOG & EVALUATION DASHBOARD"
        subtitle="Track prediction accuracy, view battle history, and analyze model performance metrics."
        accent="#ffd60a"
      />

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <MetricCard label="Accuracy" value={`${stats.accuracy}%`} sub="Overall prediction rate" color="#06d6a0"/>
        <MetricCard label="Total Battles" value={stats.total} sub="Matches logged" color="#4361ee"/>
        <MetricCard label="Correct" value={stats.correct} sub="Predictions correct" color="#ffd60a"/>
        <MetricCard label="Incorrect" value={stats.total - stats.correct} sub="Predictions wrong" color="#e63946"/>
      </div>

      {/* Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', marginBottom: '28px', alignItems: 'start' }}>
        {/* Gauges */}
        <div className="glass-card" style={{ borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#ffd60a', marginBottom: '20px' }}>▸ MODEL PERFORMANCE</div>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <Gauge label="BRIER SCORE" value={parseFloat(stats.brierScore)} max={1} color="#4361ee" format={v => v.toFixed(3)}/>
            <Gauge label="LOG LOSS" value={Math.min(parseFloat(stats.logLoss), 2)} max={2} color="#e63946" format={v => v.toFixed(3)}/>
            <Gauge label="ACCURACY" value={parseFloat(stats.accuracy)} max={100} color="#06d6a0" format={v => `${v}%`}/>
          </div>
          <div style={{ marginTop: '12px', fontFamily: 'Exo 2', fontSize: '11px', color: '#8888bb', lineHeight: 1.8 }}>
            Lower Brier Score & Log Loss = better calibrated predictions. Brier Score range: 0.0 (perfect) → 1.0 (worst).
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="glass-card" style={{ borderRadius: '12px', padding: '24px' }}>
          <ConfusionMatrix log={log}/>
        </div>
      </div>

      {/* Battle Log Table */}
      <div className="glass-card" style={{ borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: 'Press Start 2P', fontSize: '8px', color: '#ffd60a' }}>
            ▸ MATCH HISTORY ({log.length})
          </div>
          <ExportButtons onExportJSON={handleExportJSON} onExportCSV={handleExportCSV}/>
        </div>

        {log.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,214,10,0.06)', border: '1px solid rgba(255,214,10,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'Press Start 2P', fontSize: '10px', color: '#ffd60a30' }}>—</div>
            <div style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#8888bb' }}>No battles logged yet</div>
            <div style={{ fontFamily: 'Exo 2', fontSize: '13px', color: '#8888bb', marginTop: '8px' }}>Use Engine 3 to log battle results</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="sci-table">
              <thead>
                <tr>
                  <th>MATCH ID</th>
                  <th>BATTLER A</th>
                  <th>BATTLER B</th>
                  <th>PREDICTED</th>
                  <th>ACTUAL</th>
                  <th>CONF.</th>
                  <th>MVP</th>
                  <th>RESULT</th>
                  <th>TIME</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {log.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.5), layout: true }}
                      layout
                    >
                      <td style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb' }}>{row.match_id?.slice(-8)}</td>
                      <td style={{ color: '#4361ee', fontWeight: 600 }}>{row.battler_a}</td>
                      <td style={{ color: '#e63946', fontWeight: 600 }}>{row.battler_b}</td>
                      <td style={{ textTransform: 'capitalize', color: '#e8e8ff' }}>{row.predicted_winner}</td>
                      <td style={{ textTransform: 'capitalize', color: '#e8e8ff' }}>{row.actual_winner}</td>
                      <td>
                        <span style={{ color: '#ffd60a', fontFamily: 'Press Start 2P', fontSize: '7px' }}>{row.confidence}%</span>
                      </td>
                      <td style={{ textTransform: 'capitalize', color: '#8888bb', fontSize: '12px' }}>{row.mvp_pokemon || '—'}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px',
                          background: row.hit ? 'rgba(6,214,160,0.2)' : 'rgba(230,57,70,0.2)',
                          border: `1px solid ${row.hit ? '#06d6a0' : '#e63946'}`,
                          color: row.hit ? '#06d6a0' : '#e63946',
                          fontFamily: 'Press Start 2P', fontSize: '5px',
                        }}>
                          {row.hit ? 'HIT' : 'MISS'}
                        </span>
                      </td>
                      <td style={{ fontSize: '11px', color: '#8888bb' }}>
                        {new Date(row.timestamp).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 800px) {
          #battlelog > div:nth-child(3) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
