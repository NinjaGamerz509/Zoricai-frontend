import { Link, useLocation } from 'react-router-dom';
import useStore from '../context/store';

export default function Navbar() {
  const { user } = useStore();
  const location = useLocation();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 50,
      background: 'rgba(10,10,15,0.95)',
      borderBottom: '1px solid rgba(0,212,255,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 200,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Left */}
      <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa', letterSpacing: 2 }}>
        SESSION INITIALIZED
      </span>

      {/* Center */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <span style={{
          fontFamily: 'Orbitron', fontSize: 20, fontWeight: 900,
          color: '#00d4ff',
          textShadow: '0 0 20px #00d4ff, 0 0 40px rgba(0,212,255,0.3)',
          letterSpacing: 6
        }}>
          ⌊ZORIC⌉
        </span>
      </Link>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa' }}>
          MODEL: <span style={{ color: '#00d4ff' }}>LLaMA 70B</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 8px #00ff88'
          }} />
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#00ff88' }}>CONNECTED</span>
        </div>
        <Link to="/settings">
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            border: '1px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#00d4ff', fontSize: 14, cursor: 'pointer',
            background: 'rgba(0,212,255,0.05)'
          }}>👤</div>
        </Link>
      </div>
    </div>
  );
}
