import { useState, useEffect } from 'react';
import api from '../api.js';
import useStore from '../store.js';
import Sidebar from '../components/Sidebar.jsx';

const I = ({ name, size, color }) => (
  <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
);

export default function Settings() {
  const { logout, user } = useStore();
  const [settings, setSettings] = useState({ ttsLanguage: 'hi-IN', voiceEnabled: true, model: 'llama-3.3-70b-versatile' });
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (user?.preferences) setSettings(user.preferences); }, [user]);

  const save = async () => {
    try {
      await api.put('/auth/preferences', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>SETTINGS</div>

        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2 }}>AI CONFIGURATION</div>

          <div>
            <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 8 }}>AI MODEL</div>
            <select value={settings.model} onChange={e => setSettings({...settings, model: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 6, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 12, outline: 'none' }}>
              <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B</option>
              <option value="llama-3.1-8b-instant">LLaMA 3.1 8B (Fast)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
            </select>
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 8 }}>TTS LANGUAGE</div>
            <select value={settings.ttsLanguage} onChange={e => setSettings({...settings, ttsLanguage: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 6, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 12, outline: 'none' }}>
              <option value="hi-IN">Hindi</option>
              <option value="en-US">English (US)</option>
              <option value="en-IN">English (India)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: '#8888aa' }}>VOICE ENABLED</div>
            <div onClick={() => setSettings({...settings, voiceEnabled: !settings.voiceEnabled})} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: settings.voiceEnabled ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.1)', border: `1px solid ${settings.voiceEnabled ? '#00d4ff' : '#445566'}`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 3, left: settings.voiceEnabled ? 22 : 3, width: 16, height: 16, borderRadius: '50%', background: settings.voiceEnabled ? '#00d4ff' : '#445566', transition: 'all 0.3s' }} />
            </div>
          </div>
        </div>

        <button onClick={save} style={{ padding: '14px', borderRadius: 6, cursor: 'pointer', background: saved ? 'rgba(0,255,136,0.2)' : 'rgba(0,212,255,0.15)', border: `1px solid ${saved ? '#00ff88' : 'rgba(0,212,255,0.4)'}`, color: saved ? '#00ff88' : '#00d4ff', fontFamily: 'monospace', fontSize: 13, letterSpacing: 3 }}>
          {saved ? '✓ SAVED' : 'SAVE SETTINGS'}
        </button>

        <div style={{ border: '1px solid rgba(255,68,68,0.2)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#ff4444', letterSpacing: 2, marginBottom: 12 }}>DANGER ZONE</div>
          <button onClick={logout} style={{ width: '100%', padding: '12px', borderRadius: 6, cursor: 'pointer', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', fontFamily: 'monospace', fontSize: 12, letterSpacing: 2 }}>
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
}
