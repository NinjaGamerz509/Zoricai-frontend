import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useStore from '../context/store';
import '../styles/globals.css';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setToken } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload = tab === 'login' ? { email, password } : { email, password, name };
      const res = await api.post(endpoint, payload);
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid-bg" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="particle" style={{
          left: `${Math.random() * 100}%`,
          width: `${4 + Math.random() * 8}px`,
          height: `${4 + Math.random() * 8}px`,
          background: i % 2 === 0 ? 'rgba(0,212,255,0.3)' : 'rgba(123,47,255,0.3)',
          animationDuration: `${8 + Math.random() * 10}s`,
          animationDelay: `${Math.random() * 5}s`
        }} />
      ))}

      {/* Corner decorations */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <div style={{ width: 40, height: 40, borderTop: '2px solid rgba(0,212,255,0.3)', borderLeft: '2px solid rgba(0,212,255,0.3)' }} />
      </div>
      <div style={{ position: 'absolute', bottom: 20, right: 20 }}>
        <div style={{ width: 40, height: 40, borderBottom: '2px solid rgba(0,212,255,0.3)', borderRight: '2px solid rgba(0,212,255,0.3)' }} />
      </div>

      {/* Top status */}
      <div style={{ position: 'absolute', top: 16, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa', letterSpacing: 2 }}>SESSION INITIALIZED</span>
      </div>

      {/* Card */}
      <div style={{
        width: 420,
        background: 'rgba(11,11,18,0.95)',
        border: '2px solid rgba(0,212,255,0.4)',
        borderRadius: 12,
        padding: '40px 40px',
        position: 'relative',
        boxShadow: '0 0 60px rgba(0,212,255,0.15), 0 0 120px rgba(0,212,255,0.05)',
      }}>
        {/* Top orb */}
        <div style={{
          position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(10,10,20,1)',
          border: '2px solid rgba(0,212,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0,212,255,0.4)'
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 8px #00d4ff' }} />
        </div>

        {/* Logo */}
        <h1 className="font-orbitron" style={{
          fontSize: 36, fontWeight: 900, letterSpacing: 8,
          color: '#00d4ff', textAlign: 'center', marginBottom: 28,
          textShadow: '0 0 20px #00d4ff'
        }}>⌊ZORIC⌉</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,212,255,0.15)', marginBottom: 32, gap: 4 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px 0',
              background: 'transparent', border: 'none',
              borderBottom: tab === t ? '2px solid #00d4ff' : '2px solid transparent',
              color: tab === t ? '#00d4ff' : '#8888aa',
              fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700,
              letterSpacing: 3, cursor: 'pointer', textTransform: 'uppercase',
              transition: 'all 0.2s'
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {tab === 'register' && (
            <div>
              <label style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa', letterSpacing: 2 }}>NAME</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ marginTop: 6 }} />
            </div>
          )}
          <div>
            <label style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa', letterSpacing: 2 }}>EMAIL</label>
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ marginTop: 6 }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa', letterSpacing: 2 }}>PASSWORD</label>
            <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ marginTop: 6 }} />
            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#00d4ff', cursor: 'pointer', fontFamily: 'Rajdhani' }}>Forgot Password?</span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: '8px 12px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 4, color: '#ff4444', fontSize: 13, fontFamily: 'Rajdhani' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn btn-cyan" style={{ width: '100%', marginTop: 28, fontSize: 13, padding: '14px', letterSpacing: 4 }}>
          {loading ? 'INITIALIZING...' : 'ACCESS ZORIC'}
        </button>
      </div>

      {/* Bottom */}
      <div style={{ position: 'absolute', bottom: 16, right: 24 }}>
        <span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#8888aa' }}>MODEL: ZORIC V4.2 ✦</span>
      </div>
    </div>
  );
}
