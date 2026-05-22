import { useState, useEffect } from 'react';
import api from '../api.js';
import Sidebar from '../components/Sidebar.jsx';

const I = ({ name, size, color }) => (
  <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.tasks || []);
    } catch {} finally { setLoading(false); }
  };

  const addTask = async () => {
    if (!input.trim()) return;
    try {
      await api.post('/tasks', { title: input });
      setInput('');
      loadTasks();
    } catch {}
  };

  const toggleTask = async (id, status) => {
    try {
      await api.put(`/tasks/${id}`, { status: status === 'done' ? 'pending' : 'done' });
      loadTasks();
    } catch {}
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      loadTasks();
    } catch {}
  };

  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>TASK MANAGER</div>

        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'TOTAL', val: tasks.length, color: '#00d4ff' },
            { label: 'DONE', val: tasks.filter(t => t.status === 'done').length, color: '#00ff88' },
            { label: 'PENDING', val: tasks.filter(t => t.status !== 'done').length, color: '#ffaa00' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: 12, border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 28, color: s.color, fontFamily: 'Orbitron' }}>{s.val}</div>
              <div style={{ fontSize: 9, color: '#445566', letterSpacing: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="// ADD NEW TASK..."
            style={{ flex: 1, padding: '12px', borderRadius: 6, outline: 'none', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 13 }}
          />
          <button onClick={addTask} style={{ padding: '12px 16px', borderRadius: 6, cursor: 'pointer', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
            <I name="add" size={20} color="#00d4ff" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 16px', borderRadius: 4, cursor: 'pointer',
              background: filter === f ? 'rgba(0,212,255,0.15)' : 'transparent',
              border: `1px solid ${filter === f ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.1)'}`,
              color: filter === f ? '#00d4ff' : '#8888aa',
              fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'monospace',
            }}>{f}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading && <div style={{ color: '#334455', fontSize: 12 }}>// LOADING...</div>}
          {filtered.map(t => (
            <div key={t._id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 8,
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${t.status === 'done' ? 'rgba(0,255,136,0.15)' : 'rgba(0,212,255,0.1)'}`,
            }}>
              <div onClick={() => toggleTask(t._id, t.status)} style={{ cursor: 'pointer' }}>
                <I name={t.status === 'done' ? 'check_circle' : 'radio_button_unchecked'} size={22} color={t.status === 'done' ? '#00ff88' : '#445566'} />
              </div>
              <div style={{ flex: 1, fontSize: 13, color: t.status === 'done' ? '#445566' : '#ccc', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>
                {t.title}
              </div>
              <div onClick={() => deleteTask(t._id)} style={{ cursor: 'pointer' }}>
                <I name="delete" size={18} color="#ff444466" />
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{ color: '#334455', fontSize: 12, textAlign: 'center', padding: 20 }}>// NO TASKS FOUND</div>
          )}
        </div>
      </div>
    </div>
  );
}
