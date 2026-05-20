import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';
import useStore from '../context/store';
import YoutubePlayer from './YoutubePlayer';
import GestureControl from './GestureControl';
import PlaylistPanel from './PlaylistPanel';

export default function Sidebar({ currentVideo, videoInfo, onGesture, onCameraFrame, onPlaylistSong, onAnnounce }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useStore();
  const [tasks, setTasks] = useState([]);
  const [gestureEnabled, setGestureEnabled] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks?status=pending&category=today');
      setTasks(res.data.tasks?.slice(0, 3) || []);
    } catch {}
  };

  const navItem = (to, icon, label, special) => (
    <div onClick={() => navigate(to)} style={{ textDecoration: 'none', cursor: 'pointer' }}>
      <div style={{
        padding: '8px 12px', borderRadius: 4,
        display: 'flex', alignItems: 'center', gap: 8,
        background: location.pathname === to
          ? special ? 'rgba(255,68,0,0.1)' : 'rgba(0,212,255,0.1)'
          : 'transparent',
        borderLeft: location.pathname === to
          ? `2px solid ${special ? '#ff4400' : '#00d4ff'}`
          : '2px solid transparent',
        cursor: 'pointer', transition: 'all 0.2s',
        color: location.pathname === to
          ? special ? '#ff4400' : '#00d4ff'
          : '#8888aa',
        fontSize: 13, fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: 1,
        marginBottom: 2,
      }}>
        <span>{icon}</span> {label}
      </div>
    </div>
  );

  return (
    <div style={{
      width: 240, minHeight: '100vh',
      background: 'rgba(11,11,18,0.97)',
      borderRight: '1px solid rgba(0,212,255,0.15)',
      padding: '70px 10px 80px',
      display: 'flex', flexDirection: 'column', gap: 8,
      position: 'fixed', left: 0, top: 0, zIndex: 150,
      overflowY: 'auto',
    }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#555566', letterSpacing: 2, padding: '0 12px', marginBottom: 4 }}>
        NAVIGATION
      </div>
      {navItem('/dashboard', '💬', 'CHAT')}
      {navItem('/tasks', '✅', 'TASKS')}
      {navItem('/browser', '🌐', 'BROWSER')}
      {navItem('/journal', '📓', 'JOURNAL')}
      {navItem('/habits', '🔥', 'HABITS')}
      {navItem('/expenses', '💸', 'EXPENSES')}
      {navItem('/analytics', '📊', 'ANALYTICS')}
      {navItem('/logs', '📋', 'LOGS')}
      {navItem('/sentinel', '⚔️', 'SENTINEL', true)}

      <div style={{ height: 1, background: 'rgba(0,212,255,0.08)', margin: '4px 0' }} />

      <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#555566', letterSpacing: 2, padding: '0 12px', marginBottom: 4 }}>
        TODAY
      </div>
      {tasks.map(t => (
        <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', fontSize: 12, color: '#8888aa', fontFamily: 'Rajdhani' }}>
          <div style={{ width: 12, height: 12, border: '1px solid rgba(0,212,255,0.3)', borderRadius: 2, flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
        </div>
      ))}
      {tasks.length === 0 && (
        <div style={{ padding: '4px 12px', fontSize: 11, color: '#444455', fontFamily: 'Share Tech Mono' }}>// No tasks</div>
      )}

      <div style={{ height: 1, background: 'rgba(0,212,255,0.08)', margin: '4px 0' }} />

      <div style={{ padding: '0 4px' }}>
        <YoutubePlayer videoId={currentVideo} videoInfo={videoInfo} />
      </div>

      <div style={{ height: 1, background: 'rgba(0,212,255,0.08)', margin: '4px 0' }} />

      <div style={{ padding: '0 4px' }}>
        <GestureControl
          enabled={gestureEnabled}
          onToggle={() => setGestureEnabled(!gestureEnabled)}
          onGesture={onGesture}
          onCameraFrame={onCameraFrame}
        />
      </div>

      <div style={{ height: 1, background: 'rgba(0,212,255,0.08)', margin: '4px 0' }} />

      <PlaylistPanel
        onPlaySong={onPlaylistSong}
        currentVideoId={currentVideo}
        onAnnounce={onAnnounce}
      />

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 6, padding: '0 8px' }}>
        <div onClick={() => navigate('/settings')} style={{ flex: 1 }}>
          <button style={{
            width: '100%', background: 'transparent',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 4, padding: '8px', color: '#8888aa',
            cursor: 'pointer', fontFamily: 'Rajdhani', fontSize: 12,
          }}>⚙️ Settings</button>
        </div>
        <button onClick={logout} style={{
          background: 'transparent',
          border: '1px solid rgba(255,68,68,0.2)',
          borderRadius: 4, padding: '8px 10px',
          color: '#ff4444', cursor: 'pointer',
          fontFamily: 'Orbitron', fontSize: 9, letterSpacing: 1,
        }}>EXIT</button>
      </div>
    </div>
  );
}
