import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function RightPanel() {
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [track, setTrack] = useState(null);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [localIp, setLocalIp] = useState('');

  useEffect(() => {
    fetchWeather();
    fetchNews();
    fetchStats();
    scanNetwork();
    const trackInterval = setInterval(fetchTrack, 5000);
    const networkInterval = setInterval(scanNetwork, 30000);
    fetchTrack();
    return () => { clearInterval(trackInterval); clearInterval(networkInterval); };
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await api.post('/chat', { message: 'current weather today brief one line' });
      setWeather(res.data.message?.substring(0, 80));
    } catch {}
  };

  const fetchNews = async () => {
    try {
      const res = await api.post('/chat', { message: 'give me 3 latest news headlines only as bullet points' });
      const lines = res.data.message?.split('\n').filter(l => l.trim()).slice(0, 3) || [];
      setNews(lines);
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.stats || { total: 0, completed: 0, pending: 0 });
    } catch {}
  };

  const fetchTrack = async () => {
    try {
      const res = await api.get('/spotify/current');
      setTrack(res.data.track);
    } catch {}
  };

  const scanNetwork = async () => {
    setScanning(true);
    try {
      const res = await api.get('/network/scan');
      if (res.data.success) {
        setDevices(res.data.devices || []);
        setLocalIp(res.data.localIp || '');
        setLastScan(new Date());
      }
    } catch {} finally {
      setScanning(false);
    }
  };

  const getDeviceIcon = (device) => {
    if (device.isLocal) return '📱';
    const v = device.vendor?.toLowerCase() || '';
    if (v.includes('apple')) return '🍎';
    if (v.includes('samsung')) return '📱';
    if (v.includes('xiaomi') || v.includes('redmi')) return '📱';
    if (v.includes('intel') || v.includes('dell') || v.includes('hp')) return '💻';
    if (v.includes('router') || v.includes('tp-link') || v.includes('netgear')) return '📡';
    return '🖥️';
  };

  return (
    <div style={{
      width: 260, minHeight: '100vh',
      background: 'rgba(11,11,18,0.97)',
      borderLeft: '1px solid rgba(0,212,255,0.15)',
      padding: '70px 12px 20px',
      position: 'fixed', right: 0, top: 0, zIndex: 150,
      overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
    }}>

      {/* Network Monitor */}
      <div style={{
        background: 'rgba(0,212,255,0.05)',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: 10, padding: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#00d4ff', letterSpacing: 2 }}>
            📡 NETWORK
          </span>
          <button onClick={scanNetwork} disabled={scanning} style={{
            background: scanning ? 'rgba(0,212,255,0.05)' : 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 4, padding: '2px 8px',
            color: '#00d4ff', fontFamily: 'Orbitron', fontSize: 7,
            cursor: scanning ? 'not-allowed' : 'pointer', letterSpacing: 1,
          }}>
            {scanning ? '⟳ SCANNING' : '↺ SCAN'}
          </button>
        </div>

        {/* Local IP */}
        {localIp && (
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#555566', marginBottom: 8 }}>
            MY IP: <span style={{ color: '#00ff88' }}>{localIp}</span>
          </div>
        )}

        {/* Device count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: devices.length > 1 ? '#ffaa00' : '#00ff88',
            boxShadow: devices.length > 1 ? '0 0 6px #ffaa00' : '0 0 6px #00ff88',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: devices.length > 1 ? '#ffaa00' : '#00ff88' }}>
            {devices.length} DEVICE{devices.length !== 1 ? 'S' : ''} CONNECTED
          </span>
        </div>

        {/* Devices list */}
        {devices.length === 0 && !scanning && (
          <div style={{ color: '#333344', fontFamily: 'Share Tech Mono', fontSize: 9, textAlign: 'center', padding: '8px 0' }}>
            // No devices found
          </div>
        )}

        {devices.map((device, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 8px', borderRadius: 6, marginBottom: 4,
              background: device.isLocal ? 'rgba(0,255,136,0.06)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${device.isLocal ? 'rgba(0,255,136,0.2)' : devices.length > 2 && !device.isLocal ? 'rgba(255,170,0,0.2)' : 'rgba(0,212,255,0.08)'}`,
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>{getDeviceIcon(device)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Share Tech Mono', fontSize: 10,
                color: device.isLocal ? '#00ff88' : '#c0d0e0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {device.isLocal ? 'YOU' : device.hostname || device.vendor || 'Unknown'}
              </div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 8, color: '#555566' }}>
                {device.ip}
              </div>
              {device.mac && (
                <div style={{ fontFamily: 'Share Tech Mono', fontSize: 8, color: '#444455' }}>
                  {device.mac}
                </div>
              )}
            </div>
            {!device.isLocal && (
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#ffaa00', boxShadow: '0 0 5px #ffaa00', flexShrink: 0,
              }} />
            )}
          </motion.div>
        ))}

        {lastScan && (
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 8, color: '#333344', marginTop: 6, textAlign: 'right' }}>
            Last scan: {lastScan.toLocaleTimeString('en-IN')}
          </div>
        )}
      </div>

      {/* Weather */}
      {weather && (
        <div style={{
          background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#555566', letterSpacing: 2, marginBottom: 6 }}>🌤 WEATHER</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#c0d8e8', lineHeight: 1.5 }}>{weather}</div>
        </div>
      )}

      {/* News */}
      {news.length > 0 && (
        <div style={{
          background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#555566', letterSpacing: 2, marginBottom: 8 }}>📰 NEWS</div>
          {news.map((n, i) => (
            <div key={i} style={{ fontFamily: 'Rajdhani', fontSize: 12, color: '#a0b8c8', lineHeight: 1.5, marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid rgba(0,212,255,0.2)' }}>
              {n.replace(/^[•\-\*]\s*/, '')}
            </div>
          ))}
        </div>
      )}

      {/* Task Stats */}
      <div style={{
        background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)',
        borderRadius: 10, padding: '10px 12px',
      }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#555566', letterSpacing: 2, marginBottom: 8 }}>✅ TASKS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {[
            { label: 'TOTAL', value: stats.total, color: '#00d4ff' },
            { label: 'DONE', value: stats.completed, color: '#00ff88' },
            { label: 'LEFT', value: stats.pending, color: '#ffaa00' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 16, color: s.color, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 8, color: '#555566', letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spotify */}
      {track && (
        <div style={{
          background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.2)',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#1db954', letterSpacing: 2, marginBottom: 6 }}>🎵 SPOTIFY</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: '#c0d8e8', fontWeight: 600 }}>{track.name}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#555566' }}>{track.artist}</div>
        </div>
      )}
    </div>
  );
}
