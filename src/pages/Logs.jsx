import { useState, useEffect } from 'react';
import api from '../api.js';
import Sidebar from '../components/Sidebar.jsx';

const I = ({ name, size, color }) => (
  <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
);

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    try {
      const res = await api.get('/logs');
      setLogs(res.data.logs || []);
    } catch {} finally { setLoading(false); }
  };

  const levelColor = (level) => {
    if (level === 'error') return '#ff4444';
    if (level === 'warn') return '#ffaa00';
    if (level === 'success') return '#00ff88';
    return '#00d4ff';
  };

  const filtered = logs.filter(l => {
    const matchFilter = filter === 'all' || l.level === filter;
    const matchSearch = !search || JSON.stringify(l).toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>SYSTEM LOGS</div>
          <button onClick={loadLogs} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, cursor: 'pointer', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontSize: 11, letterSpacing: 2, fontFamily: 'monospace' }}>
            <I name="refresh" size={16} color="#00d4ff" /> REFRESH
          </button>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="// SEARCH LOGS..."
          style={{ width: '100%', padding: '10px 12px', borderRadius: 6, outline: 'none', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 12, boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'info', 'success', 'warn', 'error'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 4, cursor: 'pointer',
              background: filter === f ? 'rgba(0,212,255,0.15)' : 'transparent',
              border: `1px solid ${filter === f ? levelColor(f) : 'rgba(0,212,255,0.1)'}`,
              color: filter === f ? levelColor(f) : '#8888aa',
              fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace',
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {loading && <div style={{ color: '#334455', fontSize: 12 }}>// LOADING...</div>}
          {filtered.map((log, i) => (
            <div key={i} style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', border: `1px solid rgba(${log.level === 'error' ? '255,68,68' : log.level === 'warn' ? '255,170,0' : '0,212,255'},0.1)`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: levelColor(log.level), marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#ccc' }}>{log.message || log.content || JSON.stringify(log)}</div>
                <div style={{ fontSize: 9, color: '#445566', marginTop: 3 }}>
                  {log.tag && <span style={{ color: '#00d4ff', marginRight: 8 }}>[{log.tag}]</span>}
                  {new Date(log.timestamp || log.createdAt).toLocaleString()}
                </div>
              </div>
              <span style={{ fontSize: 9, color: levelColor(log.level), letterSpacing: 1 }}>{(log.level || 'INFO').toUpperCase()}</span>
            </div>
          ))}
          {filtered.length === 0 && !loading && <div style={{ color: '#334455', fontSize: 12, textAlign: 'center', padding: 20 }}>// NO LOGS FOUND</div>}
        </div>
      </div>
    </div>
  );
}
