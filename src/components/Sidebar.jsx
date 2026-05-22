import { useNavigate, useLocation } from 'react-router-dom';
import useStore from '../store.js';

const I = ({ name, size, color }) => (
  <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
);

const navItems = [
  { path: '/dashboard', icon: 'chat', label: 'CHAT' },
  { path: '/tasks', icon: 'task_alt', label: 'TASKS' },
  { path: '/browser', icon: 'language', label: 'BROWSER' },
  { path: '/personal', icon: 'self_improvement', label: 'PERSONAL' },
  { path: '/analytics', icon: 'bar_chart', label: 'ANALYTICS' },
  { path: '/logs', icon: 'receipt_long', label: 'LOGS' },
  { path: '/sentinel', icon: 'security', label: 'SENTINEL' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useStore();

  return (
    <div style={{
      width: 200, background: 'rgba(0,0,0,0.7)',
      borderRight: '1px solid rgba(0,212,255,0.15)',
      padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 2,
      height: '100vh', overflowY: 'auto', flexShrink: 0,
    }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 16, color: '#00d4ff', letterSpacing: 4, padding: '0 8px', marginBottom: 16, textAlign: 'center' }}>
        ZORIC
      </div>

      <div style={{ fontSize: 9, color: '#334455', letterSpacing: 3, padding: '0 8px', marginBottom: 8 }}>NAVIGATION</div>

      {navItems.map((item) => {
        const active = location.pathname === item.path;
        const isSentinel = item.path === '/sentinel';
        return (
          <div key={item.path} onClick={() => navigate(item.path)} style={{
            padding: '9px 10px', borderRadius: 4, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            background: active ? (isSentinel ? 'rgba(255,68,0,0.1)' : 'rgba(0,212,255,0.1)') : 'transparent',
            borderLeft: active ? `2px solid ${isSentinel ? '#ff4400' : '#00d4ff'}` : '2px solid transparent',
            color: active ? (isSentinel ? '#ff4400' : '#00d4ff') : '#8888aa',
            fontSize: 12, letterSpacing: 1, transition: 'all 0.2s',
          }}>
            <I name={item.icon} size={18} color={active ? (isSentinel ? '#ff4400' : '#00d4ff') : '#8888aa'} />
            {item.label}
          </div>
        );
      })}

      <div style={{ flex: 1 }} />

      <div onClick={() => navigate('/settings')} style={{
        padding: '9px 10px', cursor: 'pointer', borderRadius: 4,
        color: location.pathname === '/settings' ? '#00d4ff' : '#8888aa',
        fontSize: 12, display: 'flex', alignItems: 'center', gap: 10,
        background: location.pathname === '/settings' ? 'rgba(0,212,255,0.1)' : 'transparent',
        borderLeft: location.pathname === '/settings' ? '2px solid #00d4ff' : '2px solid transparent',
      }}>
        <I name="settings" size={18} color={location.pathname === '/settings' ? '#00d4ff' : '#8888aa'} /> SETTINGS
      </div>

      <div onClick={logout} style={{
        padding: '9px 10px', cursor: 'pointer', borderRadius: 4,
        color: '#ff4444', fontSize: 12, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <I name="logout" size={18} color="#ff4444" /> EXIT
      </div>
    </div>
  );
}
