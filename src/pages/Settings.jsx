import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ActiveTaskBar from '../components/ActiveTaskBar';
import api from '../services/api';
import '../styles/globals.css';

const SECTIONS = ['GENERAL', 'AI MODEL', 'VOICE', 'SPOTIFY', 'API KEYS', 'THEME', 'NOTIFICATIONS', 'SYSTEM'];

const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
const THEMES = [
  { id: 'neon-cyan', label: 'NEON CYAN', color: '#00d4ff' },
  { id: 'electric-purple', label: 'ELECTRIC PURPLE', color: '#7b2fff' },
  { id: 'deep-space', label: 'DEEP SPACE', color: '#1a1a3e' },
];

export default function Settings() {
  const [active, setActive] = useState('AI MODEL');
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [temperature, setTemperature] = useState(0.7);
  const [selectedTheme, setSelectedTheme] = useState('neon-cyan');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [wakeWord, setWakeWord] = useState(true);
  const [notifications, setNotifications] = useState({ messages: true, alerts: false, tasks: false, news: true });
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [saved, setSaved] = useState('');
  const navigate = useNavigate();

  const connectSpotify = async () => {
    try {
      const res = await api.get('/spotify/auth');
      window.open(res.data.url, '_blank');
    } catch {}
  };

  const saveSettings = () => {
    setSaved('Settings saved!');
    setTimeout(() => setSaved(''), 2000);
  };

  const Card = ({ title, children }) => (
    <div style={{
      background: 'rgba(13,13,21,0.8)',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: 8, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 16
    }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#00d4ff', letterSpacing: 3 }}>{title}</div>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: value ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)',
      border: `1px solid ${value ? '#00d4ff' : 'rgba(255,255,255,0.2)'}`,
      position: 'relative', cursor: 'pointer', transition: 'all 0.3s',
      boxShadow: value ? '0 0 10px rgba(0,212,255,0.3)' : 'none'
    }}>
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 22 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: value ? '#00d4ff' : '#8888aa',
        transition: 'all 0.3s',
        boxShadow: value ? '0 0 8px #00d4ff' : 'none'
      }} />
    </div>
  );

  const renderContent = () => {
    if (active === 'AI MODEL') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="AI MODEL SELECTION">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MODELS.map(m => (
              <div key={m} onClick={() => setSelectedModel(m)} style={{
                padding: '10px 14px', borderRadius: 4, cursor: 'pointer',
                background: selectedModel === m ? 'rgba(0,212,255,0.15)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${selectedModel === m ? '#00d4ff' : 'rgba(0,212,255,0.1)'}`,
                color: selectedModel === m ? '#00d4ff' : '#8888aa',
                fontFamily: 'Share Tech Mono', fontSize: 12, transition: 'all 0.2s'
              }}>
                {m} {selectedModel === m && <span style={{ color: '#00ff88' }}>(Active)</span>}
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#8888aa' }}>Temperature</span>
              <span style={{ fontFamily: 'Share Tech Mono', fontSize: 12, color: '#00d4ff' }}>{temperature}</span>
            </div>
            <input type="range" min="0" max="1" step="0.1" value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#00d4ff' }} />
          </div>
          <p style={{ fontSize: 12, color: '#555566', fontFamily: 'Rajdhani' }}>LLaMA 70B — Best for complex reasoning and Hinglish conversations.</p>
        </Card>

        <Card title="VOICE SETTINGS">
          {[
            { label: 'Voice Profile', value: 'Aura (Cyan)', type: 'select' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 14, color: '#aaaacc' }}>{f.label}</span>
              <span style={{ fontFamily: 'Share Tech Mono', fontSize: 12, color: '#00d4ff' }}>{f.value}</span>
            </div>
          ))}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#8888aa' }}>Volume</span>
            </div>
            <input type="range" min="0" max="100" defaultValue="80" style={{ width: '100%', accentColor: '#00d4ff' }} />
          </div>
          {[
            { label: 'Wake Word', val: wakeWord, set: setWakeWord },
            { label: 'Text-to-Speech', val: voiceEnabled, set: setVoiceEnabled },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 14, color: '#aaaacc' }}>{t.label}</span>
              <Toggle value={t.val} onChange={t.set} />
            </div>
          ))}
        </Card>
      </div>
    );

    if (active === 'SPOTIFY') return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="SPOTIFY CONNECTION">
          <button onClick={connectSpotify} className="btn btn-outline-cyan" style={{ width: '100%' }}>
            CONNECT SPOTIFY
          </button>
          <div style={{ fontSize: 12, color: '#00ff88', fontFamily: 'Share Tech Mono' }}>
            Click to open Spotify OAuth in new tab
          </div>
          <div style={{ fontSize: 11, color: '#8888aa', fontFamily: 'Rajdhani' }}>
            After connecting, Spotify redirect URI must be: http://localhost:5000/api/spotify/callback
          </div>
        </Card>
        <Card title="PLAYBACK SETTINGS">
          <p style={{ fontSize: 13, color: '#8888aa', fontFamily: 'Rajdhani' }}>
            Once connected, ZORIC can control Spotify playback, search songs, and display now-playing info.
          </p>
        </Card>
      </div>
    );

    if (active === 'API KEYS') return (
      <Card title="API KEYS">
        {['GROQ API KEY', 'ELEVENLABS API KEY', 'TAVILY API KEY', 'SPOTIFY CLIENT ID', 'SPOTIFY CLIENT SECRET', 'MONGODB URI'].map((k, i) => (
          <div key={i}>
            <label style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa', letterSpacing: 2 }}>{k}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <input type="password" placeholder="••••••••••••••••" className="input-field" style={{ flex: 1 }} />
              <button style={{ background: 'transparent', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: 16 }}>👁</button>
            </div>
          </div>
        ))}
        <p style={{ fontSize: 12, color: '#555566', fontFamily: 'Rajdhani' }}>* Keys are stored in your .env file on the server. Edit .env directly for permanent changes.</p>
      </Card>
    );

    if (active === 'THEME') return (
      <Card title="THEME SWITCHER">
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {THEMES.map(t => (
            <div key={t.id} onClick={() => setSelectedTheme(t.id)} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: `3px solid ${selectedTheme === t.id ? t.color : 'rgba(255,255,255,0.1)'}`,
                background: `radial-gradient(circle, ${t.color}33, transparent)`,
                boxShadow: selectedTheme === t.id ? `0 0 20px ${t.color}` : 'none',
                transition: 'all 0.3s', marginBottom: 8
              }} />
              <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: selectedTheme === t.id ? t.color : '#8888aa', letterSpacing: 1 }}>{t.label}</div>
              {selectedTheme === t.id && <div style={{ fontSize: 10, color: '#00ff88', fontFamily: 'Share Tech Mono' }}>(Active)</div>}
            </div>
          ))}
        </div>
      </Card>
    );

    if (active === 'NOTIFICATIONS') return (
      <Card title="NOTIFICATION SETTINGS">
        {Object.entries(notifications).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 14, color: '#aaaacc', textTransform: 'capitalize' }}>
              {key.replace(/([A-Z])/g, ' $1')}
            </span>
            <Toggle value={val} onChange={v => setNotifications(prev => ({ ...prev, [key]: v }))} />
          </div>
        ))}
      </Card>
    );

    return (
      <div style={{ color: '#8888aa', fontFamily: 'Rajdhani', fontSize: 14, padding: 20 }}>
        Select a category from the left panel.
      </div>
    );
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50, paddingBottom: 50 }}>
      <Navbar />
      <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 18, color: '#00d4ff', letterSpacing: 4, marginBottom: 24, textAlign: 'center' }}>
          SETTINGS: ZORIC V4.2 / LLaMA 70B
        </h2>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Left nav */}
          <div style={{
            width: 200, background: 'rgba(11,11,18,0.9)',
            border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8,
            padding: 8, flexShrink: 0, height: 'fit-content'
          }}>
            {SECTIONS.map(s => (
              <div key={s} onClick={() => setActive(s)} style={{
                padding: '12px 16px', cursor: 'pointer', borderRadius: 4,
                background: active === s ? 'rgba(0,212,255,0.1)' : 'transparent',
                borderLeft: active === s ? '2px solid #00d4ff' : '2px solid transparent',
                color: active === s ? '#00d4ff' : '#8888aa',
                fontFamily: 'Orbitron', fontSize: 11, letterSpacing: 2,
                transition: 'all 0.2s', marginBottom: 2
              }}>
                {s}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            {renderContent()}
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={saveSettings} className="btn btn-cyan">SAVE SETTINGS</button>
              {saved && <span style={{ color: '#00ff88', fontFamily: 'Share Tech Mono', fontSize: 12 }}>{saved}</span>}
            </div>
          </div>
        </div>
      </div>
      <ActiveTaskBar />
    </div>
  );
}
