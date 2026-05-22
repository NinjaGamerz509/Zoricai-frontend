import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api.js';
import useStore from '../store.js';
import Sidebar from '../components/Sidebar.jsx';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('STANDBY');
  const [tasks, setTasks] = useState({ total: 0, done: 0, left: 0 });
  const [network, setNetwork] = useState({ devices: 0, list: [] });
  const chatRef = useRef(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const loadDashboardData = async () => {
    try {
      const [tasksRes, networkRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/network/scan'),
      ]);
      const t = tasksRes.data.tasks || [];
      setTasks({ total: t.length, done: t.filter(x => x.status === 'done').length, left: t.filter(x => x.status !== 'done').length });
      setNetwork({ devices: networkRes.data.devices?.length || 0, list: networkRes.data.devices?.slice(0, 5) || [] });
    } catch {}
  };

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    setStatus('PROCESSING');
    try {
      const res = await api.post('/chat', { message: msg });
      const reply = res.data.response || res.data.message;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setStatus('STANDBY');
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to Zoric.' }]);
      setStatus('ERROR');
    } finally {
      setLoading(false);
    }
  };

  const startListening = async () => {
    try {
      const perm = await SpeechRecognition.requestPermissions();
      if (perm.speechRecognition !== 'granted') return;
      setListening(true);
      setStatus('LISTENING');
      const result = await SpeechRecognition.start({
        language: 'hi-IN',
        maxResults: 1,
        partialResults: false,
        popup: false,
      });
      if (result.matches?.[0]) sendMessage(result.matches[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setListening(false);
      setStatus('STANDBY');
    }
  };

  const stopListening = async () => {
    try {
      await SpeechRecognition.stop();
    } catch {}
    setListening(false);
    setStatus('STANDBY');
  };

  const I = ({ name, size, color }) => (
    <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>

      <Sidebar active="/dashboard" />

      {/* CENTER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16, gap: 12, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, color: '#334455', letterSpacing: 3 }}>SESSION INITIALIZED</div>
          <div style={{ fontSize: 20, color: '#00d4ff', letterSpacing: 6, fontWeight: 'bold', fontFamily: 'Orbitron' }}>ZORIC</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88' }} />
            <span style={{ fontSize: 10, color: '#00ff88', letterSpacing: 2 }}>CONNECTED</span>
          </div>
        </div>

        {/* Orb */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%', margin: '0 auto',
            background: listening
              ? 'radial-gradient(circle, rgba(0,255,136,0.3) 0%, rgba(0,212,255,0.2) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(123,47,255,0.2) 50%, transparent 70%)',
            border: `2px solid ${listening ? '#00ff88' : 'rgba(0,212,255,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 40px ${listening ? 'rgba(0,255,136,0.3)' : 'rgba(0,212,255,0.2)'}`,
          }}>
            <I name={listening ? 'mic' : 'smart_toy'} size={40} color={listening ? '#00ff88' : '#00d4ff'} />
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: listening ? '#00ff88' : '#00d4ff', letterSpacing: 3 }}>
            STATUS: {status}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button onClick={startListening} disabled={listening} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 6, cursor: listening ? 'not-allowed' : 'pointer',
            background: listening ? 'rgba(0,255,136,0.2)' : 'rgba(0,212,255,0.1)',
            border: `1px solid ${listening ? '#00ff88' : 'rgba(0,212,255,0.4)'}`,
            color: listening ? '#00ff88' : '#00d4ff',
            fontSize: 12, letterSpacing: 2, fontFamily: 'monospace',
          }}>
            <I name="mic" size={16} color={listening ? '#00ff88' : '#00d4ff'} /> LISTEN
          </button>
          <button onClick={stopListening} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 6, cursor: 'pointer',
            background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.4)',
            color: '#ff4444', fontSize: 12, letterSpacing: 2, fontFamily: 'monospace',
          }}>
            <I name="stop" size={16} color="#ff4444" /> STOP
          </button>
        </div>

        {/* Chat */}
        <div ref={chatRef} style={{
          flex: 1, overflowY: 'auto', padding: 12,
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,212,255,0.1)',
          borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {messages.length === 0 && (
            <div style={{ color: '#334455', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
              // ZORIC AWAITING INPUT...
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '8px 12px', borderRadius: 8,
                background: m.role === 'user' ? 'rgba(0,212,255,0.15)' : 'rgba(123,47,255,0.15)',
                border: `1px solid ${m.role === 'user' ? 'rgba(0,212,255,0.3)' : 'rgba(123,47,255,0.3)'}`,
                color: m.role === 'user' ? '#00d4ff' : '#bb88ff',
                fontSize: 12, lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#334455', fontSize: 12 }}>// PROCESSING...</div>}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="// ENTER COMMAND..."
            style={{
              flex: 1, padding: '12px', borderRadius: 6, outline: 'none',
              background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
              color: '#00d4ff', fontFamily: 'monospace', fontSize: 13,
            }}
          />
          <button onClick={() => sendMessage()} style={{
            padding: '12px 16px', borderRadius: 6, cursor: 'pointer',
            background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff',
          }}>
            <I name="send" size={20} color="#00d4ff" />
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: 220, background: 'rgba(0,0,0,0.6)', borderLeft: '1px solid rgba(0,212,255,0.15)', padding: 12, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>

        {/* Network */}
        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2 }}>NETWORK</div>
            <button onClick={loadDashboardData} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 4, color: '#00d4ff', fontSize: 9, padding: '2px 8px', cursor: 'pointer' }}>SCAN</button>
          </div>
          <div style={{ fontSize: 11, color: '#00ff88', marginBottom: 6 }}>● {network.devices} CONNECTED</div>
          {network.list.map((d, i) => (
            <div key={i} style={{ fontSize: 10, color: '#8888aa', padding: '3px 0', borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
              {d.ip || d.hostname || 'Unknown'}
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 8 }}>TASKS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {[['TOTAL', tasks.total, '#00d4ff'], ['DONE', tasks.done, '#00ff88'], ['LEFT', tasks.left, '#ffaa00']].map(([label, val, color]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, color, fontFamily: 'Orbitron' }}>{val}</div>
                <div style={{ fontSize: 9, color: '#445566', letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 8 }}>QUICK ACTIONS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              { icon: 'cloud', label: 'Weather', cmd: 'Aaj ka weather batao' },
              { icon: 'newspaper', label: 'News', cmd: 'Latest news headlines' },
              { icon: 'search', label: 'Search', cmd: 'Search web for latest AI news' },
              { icon: 'info', label: 'Status', cmd: 'System status check' },
            ].map((a, i) => (
              <button key={i} onClick={() => sendMessage(a.cmd)} style={{
                padding: '8px 4px', borderRadius: 6, cursor: 'pointer',
                background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
                color: '#8888aa', fontSize: 10, letterSpacing: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span className="material-icons" style={{ fontSize: 18, color: '#00d4ff' }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* User */}
        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 6 }}>OPERATOR</div>
          <div style={{ fontSize: 12, color: '#fff' }}>{user?.name || 'Boss'}</div>
          <div style={{ fontSize: 10, color: '#445566' }}>{user?.email}</div>
        </div>
      </div>
    </div>
  );
}
