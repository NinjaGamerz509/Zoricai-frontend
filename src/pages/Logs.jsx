import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import ActiveTaskBar from '../components/ActiveTaskBar';
import api from '../services/api';
import '../styles/globals.css';

const LEVEL_COLORS = { INFO: '#00d4ff', WARN: '#ffcc00', ERROR: '#ff4444', SUCCESS: '#00ff88' };
const FILTERS = ['ALL', 'INFO', 'WARN', 'ERROR', 'SUCCESS'];

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, errors: 0, warnings: 0, success: 0 });
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [recentTasks, setRecentTasks] = useState([]);
  const logsEndRef = useRef(null);

  useEffect(() => { fetchDates(); }, []);
  useEffect(() => { fetchLogs(); }, [filter, selectedDate]);

  const fetchDates = async () => {
    try {
      const res = await api.get('/logs/dates');
      setDates(res.data.dates || []);
      if (res.data.dates?.length > 0) setSelectedDate(res.data.dates[0]);
    } catch {}
  };

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('type', filter);
      if (selectedDate) params.append('date', selectedDate);
      if (search) params.append('search', search);
      params.append('limit', '300');
      const res = await api.get(`/logs?${params}`);
      setLogs(res.data.logs || []);
      setStats(res.data.stats || { total: 0, errors: 0, warnings: 0, success: 0 });
    } catch {}
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchLogs();
  };

  const getLevelFromLog = (raw) => {
    if (raw.includes('[ERROR]')) return 'ERROR';
    if (raw.includes('[WARN]')) return 'WARN';
    if (raw.includes('SUCCESS')) return 'SUCCESS';
    return 'INFO';
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50, paddingBottom: 50 }}>
      <Navbar />
      <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#00d4ff', letterSpacing: 4, marginBottom: 20, textAlign: 'center', textShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
          Logs
        </h2>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Left stats sidebar */}
          <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'TOTAL LOGS', value: stats.total.toLocaleString(), color: '#00d4ff', icon: '📋' },
              { label: 'TOTAL ERRORS', value: stats.errors, color: '#ff4444', icon: '❌' },
              { label: 'TOTAL WARNINGS', value: stats.warnings, color: '#ffcc00', icon: '⚠️' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(13,13,21,0.9)', border: `1px solid ${s.color}33`,
                borderRadius: 8, padding: '16px', textAlign: 'center',
                boxShadow: `0 0 15px ${s.color}11`
              }}>
                <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#8888aa', letterSpacing: 2, marginBottom: 8 }}>{s.icon} {s.label}</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 22, color: s.color, fontWeight: 700, textShadow: `0 0 10px ${s.color}` }}>{s.value}</div>
              </div>
            ))}

            {/* Recent tasks */}
            <div style={{ background: 'rgba(13,13,21,0.9)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 8, padding: 16 }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#8888aa', letterSpacing: 2, marginBottom: 10 }}>📁 RECENT TASKS</div>
              {['AI Request', 'Spotify Control', 'Web Search', 'TTS Generated'].map((t, i) => (
                <div key={i} style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#aaaacc', padding: '4px 0', borderBottom: '1px solid rgba(0,212,255,0.05)' }}>{t}</div>
              ))}
            </div>
          </div>

          {/* Log viewer */}
          <div style={{ flex: 1 }}>
            {/* Filters */}
            <div style={{
              display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center',
              background: 'rgba(11,11,18,0.9)', border: '1px solid rgba(0,212,255,0.1)',
              borderRadius: 8, padding: '10px 14px'
            }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '5px 12px', borderRadius: 4, cursor: 'pointer',
                  background: filter === f ? `${LEVEL_COLORS[f] || '#00d4ff'}22` : 'transparent',
                  border: `1px solid ${filter === f ? (LEVEL_COLORS[f] || '#00d4ff') : 'rgba(255,255,255,0.1)'}`,
                  color: filter === f ? (LEVEL_COLORS[f] || '#00d4ff') : '#8888aa',
                  fontFamily: 'Orbitron', fontSize: 9, letterSpacing: 1, transition: 'all 0.2s'
                }}>
                  {f === 'ALL' ? '≡' : f === 'INFO' ? 'ℹ' : f === 'WARN' ? '⚠' : f === 'ERROR' ? '✕' : '✓'} [{f}]
                </button>
              ))}

              <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                style={{ padding: '5px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.2)', color: '#8888aa', borderRadius: 4, fontFamily: 'Share Tech Mono', fontSize: 11, marginLeft: 4 }}>
                {dates.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch}
                placeholder="Search logs..." style={{
                  marginLeft: 'auto', background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4,
                  padding: '5px 12px', color: '#e0e0e0', fontFamily: 'Share Tech Mono', fontSize: 11,
                  outline: 'none', width: 180
                }} />
            </div>

            {/* Logs terminal */}
            <div style={{
              background: 'rgba(6,6,10,0.95)', border: '1px solid rgba(0,212,255,0.1)',
              borderRadius: 8, padding: 16,
              height: 'calc(100vh - 260px)', overflowY: 'auto',
              fontFamily: 'Share Tech Mono', fontSize: 12,
              display: 'flex', flexDirection: 'column', gap: 3
            }}>
              {/* ZORIC status */}
              <div style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(0,212,255,0.05)', borderRadius: 4, border: '1px solid rgba(0,212,255,0.1)' }}>
                <span style={{ color: '#8888aa' }}>// ZORIC CORE STATUS: </span>
                <span style={{ color: '#00ff88' }}>ACTIVE</span>
                <span style={{ color: '#8888aa', marginLeft: 16 }}>// ENCRYPTION: </span>
                <span style={{ color: '#00ff88' }}>SECURE</span>
              </div>

              {logs.length === 0 && (
                <div style={{ color: '#555566', textAlign: 'center', padding: 40, letterSpacing: 2 }}>
                  // NO LOGS FOUND
                </div>
              )}

              {logs.map((log, i) => {
                const level = getLevelFromLog(log.raw);
                const color = LEVEL_COLORS[level];
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, lineHeight: 1.8, padding: '1px 0' }}>
                    <span style={{
                      color, flexShrink: 0,
                      textShadow: `0 0 8px ${color}44`
                    }}>
                      [{level}]
                    </span>
                    <span style={{ color: '#8888aa', flexShrink: 0 }}>
                      {log.raw.match(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/)?.[0] || ''}
                    </span>
                    <span style={{ color: color === '#00d4ff' ? '#aaaadd' : color === '#ff4444' ? '#ff8888' : color === '#ffcc00' ? '#ffdd88' : '#88ffcc' }}>
                      {log.raw.replace(/\[(INFO|WARN|ERROR|SUCCESS[_A-Z]*)\]/g, '').replace(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\]/, '').trim()}
                    </span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: 40, left: 0, right: 0,
        background: 'rgba(10,10,15,0.95)', borderTop: '1px solid rgba(0,212,255,0.1)',
        padding: '10px 24px', display: 'flex', gap: 20, alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#00d4ff', letterSpacing: 2 }}>System Overview</span>
        </div>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa' }}>
          Efficiency Rating: <span style={{ color: '#00ff88' }}>94%</span> // 
          Completed: <span style={{ color: '#00d4ff' }}>{stats.total}</span> // 
          Model <span style={{ color: '#7b2fff' }}>V4.2</span>
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: 'Orbitron', fontSize: 10, color: '#8888aa' }}>MODEL: ZORIC V4.2 ✦</span>
      </div>

      <ActiveTaskBar />
    </div>
  );
}
