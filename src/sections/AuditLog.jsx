import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuditLogs } from '../db.js';
import { exportJSON, exportCSV } from '../pokemon.js';
import { SectionHeader, ExportButtons } from '../components/UI.jsx';
import { useToast } from '../components/Toast.jsx';

const ACTION_COLORS = {
  CREATE: { color: '#06d6a0', bg: 'rgba(6,214,160,0.1)', border: '#06d6a040', label: 'CREATE' },
  UPDATE: { color: '#ffd60a', bg: 'rgba(255,214,10,0.1)', border: '#ffd60a40', label: 'EDIT' },
  DELETE: { color: '#e63946', bg: 'rgba(230,57,70,0.1)', border: '#e6394640', label: 'DELETE' },
};

function getActionStyle(action) {
  if (action?.includes('CREATE')) return ACTION_COLORS.CREATE;
  if (action?.includes('UPDATE') || action?.includes('EDIT')) return ACTION_COLORS.UPDATE;
  if (action?.includes('DELETE')) return ACTION_COLORS.DELETE;
  return { color: '#8888bb', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', label: action };
}

function AuditRow({ entry, index }) {
  const style = getActionStyle(entry.action);
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
      onClick={() => setExpanded(e => !e)}
      style={{ cursor: 'pointer' }}
    >
      <td style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb' }}>
        {entry.audit_id?.slice(-8)}
      </td>
      <td style={{ fontFamily: 'Exo 2', fontSize: '12px', color: '#e8e8ff', fontWeight: 600 }}>
        {entry.user || 'system'}
      </td>
      <td>
        <span style={{
          padding: '3px 8px', borderRadius: '4px',
          background: style.bg, border: `1px solid ${style.border}`,
          color: style.color, fontFamily: 'Press Start 2P', fontSize: '5px',
        }}>
          {style.label}
        </span>
      </td>
      <td style={{ fontSize: '11px', color: '#8888bb', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.affected_record}
      </td>
      <td style={{ fontSize: '11px', color: '#8888bb', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.old_value ? JSON.stringify(entry.old_value).slice(0, 30) + '...' : '—'}
      </td>
      <td style={{ fontSize: '11px', color: '#4361ee', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {entry.new_value ? JSON.stringify(entry.new_value).slice(0, 30) + '...' : '—'}
      </td>
      <td style={{ fontSize: '11px', color: '#8888bb', whiteSpace: 'nowrap' }}>
        {new Date(entry.timestamp).toLocaleString()}
      </td>
    </motion.tr>
  );
}

export default function AuditLog() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const refresh = async () => setLogs(await getAuditLogs());
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = logs.filter(log => {
    const matchFilter = filter === 'ALL' || log.action?.includes(filter);
    const matchSearch = !searchTerm || Object.values(log).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase()));
    return matchFilter && matchSearch;
  });

  function handleExportJSON() {
    exportJSON(logs, 'audit_log.json');
    toast('Audit log exported as JSON.', 'info');
  }
  function handleExportCSV() {
    exportCSV(logs.map(l => ({ audit_id: l.audit_id, user: l.user, action: l.action, record: l.affected_record, timestamp: l.timestamp })), 'audit_log.csv');
    toast('Audit log exported as CSV.', 'info');
  }

  const counts = {
    CREATE: logs.filter(l => l.action?.includes('CREATE')).length,
    UPDATE: logs.filter(l => l.action?.includes('UPDATE') || l.action?.includes('EDIT')).length,
    DELETE: logs.filter(l => l.action?.includes('DELETE')).length,
  };

  return (
    <section id="audit" style={{ padding: '80px 24px 120px', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeader
        icon={null}
        title="AUDIT LOG PANEL"
        subtitle="Timestamped record of all system actions. Monitor creates, edits, and deletions across all engines."
        accent="#7b2fff"
      />

      {/* Summary Chips */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'TOTAL', count: logs.length, color: '#8888bb' },
          { label: 'CREATED', count: counts.CREATE, color: '#06d6a0' },
          { label: 'UPDATED', count: counts.UPDATE, color: '#ffd60a' },
          { label: 'DELETED', count: counts.DELETE, color: '#e63946' },
        ].map(chip => (
          <motion.div
            key={chip.label}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              background: `${chip.color}12`, border: `1px solid ${chip.color}30`,
              display: 'flex', gap: '8px', alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: 'Press Start 2P', fontSize: '14px', color: chip.color }}>{chip.count}</span>
            <span style={{ fontFamily: 'Press Start 2P', fontSize: '6px', color: '#8888bb' }}>{chip.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Filter + Search Row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(123,47,255,0.3)' }}>
          {['ALL', 'CREATE', 'UPDATE', 'DELETE'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 14px', border: 'none', cursor: 'pointer',
              background: filter === f ? 'rgba(123,47,255,0.25)' : 'transparent',
              color: filter === f ? '#7b2fff' : '#8888bb',
              fontFamily: 'Press Start 2P', fontSize: '6px', transition: 'all 0.2s',
            }}>
              {f}
            </button>
          ))}
        </div>
        <input
          className="sci-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search logs..."
          style={{ flex: 1, maxWidth: '300px', borderColor: 'rgba(123,47,255,0.4)' }}
        />
        <ExportButtons onExportJSON={handleExportJSON} onExportCSV={handleExportCSV}/>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ borderRadius: '12px', padding: '20px', border: '1px solid rgba(123,47,255,0.2)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(123,47,255,0.06)', border: '1px solid rgba(123,47,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'Press Start 2P', fontSize: '10px', color: '#7b2fff30' }}>?</div>
            <div style={{ fontFamily: 'Press Start 2P', fontSize: '9px', color: '#8888bb' }}>No audit records yet</div>
            <div style={{ fontFamily: 'Exo 2', fontSize: '13px', color: '#8888bb', marginTop: '8px' }}>Actions are logged automatically when you use the engines</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="sci-table">
              <thead>
                <tr>
                  <th>AUDIT ID</th>
                  <th>USER/GROUP</th>
                  <th>ACTION</th>
                  <th>AFFECTED RECORD</th>
                  <th>OLD VALUE</th>
                  <th>NEW VALUE</th>
                  <th>TIMESTAMP</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((entry, i) => (
                    <AuditRow key={entry.audit_id} entry={entry} index={i}/>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ width: 6, height: 6, borderRadius: '50%', background: '#7b2fff', boxShadow: '0 0 6px #7b2fff' }}
        />
        <span style={{ fontFamily: 'Exo 2', fontSize: '11px', color: '#8888bb' }}>Live — refreshes every 3 seconds</span>
      </div>
    </section>
  );
}
