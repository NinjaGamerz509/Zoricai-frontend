import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import useStore from '../store.js';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setToken, setUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
      const payload = tab === 'login' ? { email, password } : { email, password, name };
      const res = await api.post(endpoint, payload);
      await setToken(res.data.token);
      await setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#050510',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'monospace',
    }}>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div style={{
        position: 'relative', zIndex: 1,
        width: 340, padding: 32,
        background: 'rgba(0,0,0,0.8)',
        border: '1px solid rgba(0,212,255,0.3)',
        borderRadius: 12,
        boxShadow: '0 0 40px rgba(0,212,255,0.1)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontFamily: 'Orbitron', color: '#00d4ff', letterSpacing: 8, fontWeight: 'bold' }}>ZORIC</div>
          <div style={{ fontSize: 11, color: '#445566', letterSpacing: 4, marginTop: 4 }}>AI CONTROL CENTER</div>
        </div>
        <div style={{ display: 'flex', marginBottom: 24, border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, overflow: 'hidden' }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
              background: tab === t ? 'rgba(0,212,255,0.15)' : 'transparent',
              color: tab === t ? '#00d4ff' : '#445566',
              fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
            }}>{t}</button>
          ))}
        </div>
        {tab === 'register' && (
          <input placeholder="NAME" value={name} onChange={e => setName(e.target.value)} style={{
            width: '100%', padding: '12px', marginBottom: 12,
            background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 6, color: '#00d4ff', fontFamily: 'monospace', fontSize: 13,
            boxSizing: 'border-box', outline: 'none',
          }} />
        )}
        <input placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} style={{
          width: '100%', padding: '12px', marginBottom: 12,
          background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 6, color: '#00d4ff', fontFamily: 'monospace', fontSize: 13,
          boxSizing: 'border-box', outline: 'none',
        }} />
        <input placeholder="PASSWORD" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{
          width: '100%', padding: '12px', marginBottom: 20,
          background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 6, color: '#00d4ff', fontFamily: 'monospace', fontSize: 13,
          boxSizing: 'border-box', outline: 'none',
        }} />
        {error && (
          <div style={{ padding: '10px', marginBottom: 16, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 6, color: '#ff4444', fontSize: 12, textAlign: 'center' }}>{error}</div>
        )}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '14px',
          background: loading ? 'rgba(0,212,255,0.1)' : 'rgba(0,212,255,0.2)',
          border: '1px solid rgba(0,212,255,0.5)',
          borderRadius: 6, color: '#00d4ff', fontFamily: 'monospace', fontSize: 14, letterSpacing: 4,
          cursor: loading ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
        }}>
          {loading ? 'CONNECTING...' : tab === 'login' ? 'ACCESS ZORIC' : 'REGISTER'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: '#334455', letterSpacing: 2 }}>
          ENCRYPTION: AES-256 • SECURE CONNECTION
        </div>
      </div>
    </div>
  );
}
