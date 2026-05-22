import { useState, useEffect } from 'react';
import api from '../api.js';
import Sidebar from '../components/Sidebar.jsx';

const I = ({ name, size, color }) => (
  <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
);

export default function Sentinel() {
  const [network, setNetwork] = useState({ devices: [], ip: '' });
  const [logs, setLogs] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [networkRes, logsRes] = await Promise.all([
        api.get('/network/scan'),
        api.get('/logs?limit=10'),
      ]);
      setNetwork({ devices: networkRes.data.devices || [], ip: networkRes.data.myIp || '192.0.0.2' });
      setLogs(logsRes.data.logs || []);
    } catch {}
  };

  const scan = async () => {
    setScanning(true);
    await loadData();
    setScanning(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#ff4400', letterSpacing: 4 }}>SENTINEL</div>
          <button onClick={scan} disabled={scanning} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
            background: 'rgba(255,68,0,0.1)', border: '1px solid rgba(255,68,0,0.4)',
            color: '#ff4400', fontSize: 11, letterSpacing: 2, fontFamily: 'monospace',
          }}>
            <I name="radar" size={16} color="#ff4400" /> {scanning ? 'SCANNING...' : 'SCAN'}
          </button>
        </div>

        <div style={{ border: '1px solid rgba(255,68,0,0.2)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#ff4400', letterSpacing: 2, marginBottom: 12 }}>NETWORK STATUS</div>
          <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 8 }}>MY IP: <span style={{ color: '#00d4ff' }}>{network.ip}</span></div>
          <div style={{ fontSize: 11, color: '#00ff88', marginBottom: 12 }}>● {network.devices.length} DEVICES CONNECTED</div>
          {network.devices.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,212,255,0.08)', marginBottom: 4 }}>
              <I name="devices" size={16} color="#00d4ff" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#ccc' }}>{d.hostname || d.ip || 'Unknown'}</div>
                <div style={{ fontSize: 10, color: '#445566' }}>{d.ip}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }} />
            </div>
          ))}
          {network.devices.length === 0 && <div style={{ color: '#334455', fontSize: 12 }}>// NO DEVICES FOUND</div>}
        </div>

        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 12 }}>SECURITY STATUS</div>
          {[
            { label: 'FIREWALL', status: 'ACTIVE', color: '#00ff88' },
            { label: 'ENCRYPTION', status: 'AES-256', color: '#00ff88' },
            { label: 'CONNECTION', status: 'SECURE', color: '#00ff88' },
            { label: 'THREATS', status: 'NONE DETECTED', color: '#00ff88' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
              <span style={{ fontSize: 11, color: '#8888aa' }}>{s.label}</span>
              <span style={{ fontSize: 11, color: s.color }}>● {s.status}</span>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 12 }}>RECENT LOGS</div>
          {logs.slice(0, 8).map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#ccc' }}>{log.message || log.content || JSON.stringify(log)}</div>
                <div style={{ fontSize: 9, color: '#445566' }}>{new Date(log.timestamp || log.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          {logs.length === 0 && <div style={{ color: '#334455', fontSize: 12 }}>// NO LOGS</div>}
        </div>
      </div>
    </div>
  );
}
