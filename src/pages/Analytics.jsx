import { useState, useEffect } from 'react';
import api from '../api.js';
import Sidebar from '../components/Sidebar.jsx';

const I = ({ name, size, color }) => (
  <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
);

export default function Analytics() {
  const [stats, setStats] = useState({ totalTasks: 0, doneTasks: 0, totalLogs: 0, summaries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const [tasksRes, logsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/logs'),
      ]);
      const tasks = tasksRes.data.tasks || [];
      const logs = logsRes.data.logs || [];
      setStats({ totalTasks: tasks.length, doneTasks: tasks.filter(t => t.status === 'done').length, totalLogs: logs.length, summaries: [] });
    } catch {} finally { setLoading(false); }
  };

  const completion = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>ANALYTICS</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: 'TOTAL TASKS', val: stats.totalTasks, icon: 'task_alt', color: '#00d4ff' },
            { label: 'COMPLETED', val: stats.doneTasks, icon: 'check_circle', color: '#00ff88' },
            { label: 'SYSTEM LOGS', val: stats.totalLogs, icon: 'receipt_long', color: '#bb88ff' },
          ].map(s => (
            <div key={s.label} style={{ padding: 16, border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, textAlign: 'center' }}>
              <I name={s.icon} size={28} color={s.color} />
              <div style={{ fontSize: 28, color: s.color, fontFamily: 'Orbitron', marginTop: 8 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: '#445566', letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 12 }}>TASK COMPLETION RATE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40, color: '#00ff88', fontFamily: 'Orbitron' }}>{completion}%</div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 8, background: 'rgba(0,212,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${completion}%`, background: 'linear-gradient(90deg, #00d4ff, #00ff88)', borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 10, color: '#445566', marginTop: 6 }}>{stats.doneTasks} of {stats.totalTasks} tasks completed</div>
            </div>
          </div>
        </div>

        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 12 }}>SYSTEM INFO</div>
          {[
            { label: 'VERSION', val: 'ZORIC V2.0' },
            { label: 'MODEL', val: 'LLaMA 70B' },
            { label: 'STATUS', val: 'OPERATIONAL' },
            { label: 'ENCRYPTION', val: 'AES-256' },
            { label: 'PLATFORM', val: 'ANDROID APK' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
              <span style={{ fontSize: 11, color: '#8888aa' }}>{s.label}</span>
              <span style={{ fontSize: 11, color: '#00d4ff' }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
