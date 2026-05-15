import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ActiveTaskBar from '../components/ActiveTaskBar';
import api from '../services/api';
import '../styles/globals.css';

const CATEGORIES = ['TODAY', 'UPCOMING', 'COMPLETED', 'ALL TASKS', 'PROJECTS'];
const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

const PRIORITY_COLORS = { HIGH: '#ff4444', MEDIUM: '#ffcc00', LOW: '#00ff88' };

export default function Tasks() {
  const [activeCategory, setActiveCategory] = useState('TODAY');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'MEDIUM', dueTime: '', category: 'today' });

  useEffect(() => { fetchTasks(); fetchStats(); }, [activeCategory]);

  const fetchTasks = async () => {
    try {
      const catMap = { 'TODAY': 'today', 'UPCOMING': 'upcoming', 'PROJECTS': 'project' };
      const statusMap = { 'COMPLETED': 'completed' };
      const params = new URLSearchParams();
      if (catMap[activeCategory]) params.append('category', catMap[activeCategory]);
      if (statusMap[activeCategory]) params.append('status', statusMap[activeCategory]);
      const res = await api.get(`/tasks?${params}`);
      setTasks(res.data.tasks || []);
    } catch {}
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/tasks/stats');
      setStats(res.data.stats || { total: 0, completed: 0, pending: 0 });
    } catch {}
  };

  const toggleTask = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, { status: task.status === 'completed' ? 'pending' : 'completed' });
      fetchTasks(); fetchStats();
    } catch {}
  };

  const deleteTask = async (id) => {
    try { await api.delete(`/tasks/${id}`); fetchTasks(); fetchStats(); } catch {}
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    try {
      await api.post('/tasks', newTask);
      setNewTask({ title: '', priority: 'MEDIUM', dueTime: '', category: 'today' });
      setShowAdd(false);
      fetchTasks(); fetchStats();
    } catch {}
  };

  const TaskCard = ({ task }) => (
    <div style={{
      background: task.status === 'completed' ? 'rgba(8,8,14,0.5)' : 'rgba(13,13,21,0.8)',
      border: `1px solid ${task.status === 'completed' ? 'rgba(0,212,255,0.08)' : 'rgba(0,212,255,0.15)'}`,
      borderRadius: 8, padding: '16px', position: 'relative',
      opacity: task.status === 'completed' ? 0.6 : 1,
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={() => toggleTask(task)} style={{
            width: 18, height: 18,
            border: `1px solid ${task.status === 'completed' ? '#00ff88' : 'rgba(0,212,255,0.4)'}`,
            borderRadius: 3, cursor: 'pointer', flexShrink: 0,
            background: task.status === 'completed' ? 'rgba(0,255,136,0.2)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: task.status === 'completed' ? '0 0 8px rgba(0,255,136,0.4)' : 'none'
          }}>
            {task.status === 'completed' && <span style={{ color: '#00ff88', fontSize: 12 }}>✓</span>}
          </div>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: 3,
          background: `${PRIORITY_COLORS[task.priority]}22`,
          border: `1px solid ${PRIORITY_COLORS[task.priority]}66`,
          color: PRIORITY_COLORS[task.priority],
          fontFamily: 'Orbitron', fontSize: 9, letterSpacing: 1
        }}>
          {task.priority}
        </div>
      </div>

      <div style={{
        fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 600,
        color: task.status === 'completed' ? '#8888aa' : '#e0e0e0',
        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
        marginBottom: 6
      }}>
        {task.title}
      </div>

      {task.dueTime && (
        <div style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa' }}>
          Due: {task.dueTime}
        </div>
      )}

      <button onClick={() => deleteTask(task._id)} style={{
        position: 'absolute', top: 8, right: 8,
        background: 'transparent', border: 'none', color: '#ff444444',
        cursor: 'pointer', fontSize: 14, padding: 4,
        transition: 'color 0.2s'
      }}
        onMouseEnter={e => e.target.style.color = '#ff4444'}
        onMouseLeave={e => e.target.style.color = '#ff444444'}
      >✕</button>
    </div>
  );

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50, paddingBottom: 50 }}>
      <Navbar />
      <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#00d4ff', letterSpacing: 4, marginBottom: 24, textAlign: 'center', textShadow: '0 0 20px rgba(0,212,255,0.3)' }}>
          Tasks
        </h2>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Left nav */}
          <div style={{
            width: 180, background: 'rgba(11,11,18,0.9)',
            border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 8, flexShrink: 0, height: 'fit-content'
          }}>
            {CATEGORIES.map(c => (
              <div key={c} onClick={() => setActiveCategory(c)} style={{
                padding: '11px 16px', cursor: 'pointer', borderRadius: 4,
                background: activeCategory === c ? 'rgba(0,212,255,0.1)' : 'transparent',
                borderLeft: activeCategory === c ? '2px solid #00d4ff' : '2px solid transparent',
                color: activeCategory === c ? '#00d4ff' : '#8888aa',
                fontFamily: 'Orbitron', fontSize: 10, letterSpacing: 2,
                transition: 'all 0.2s', marginBottom: 2
              }}>
                {c === 'PROJECTS' && '📁 '}{c}
              </div>
            ))}
          </div>

          {/* Tasks grid */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setShowAdd(!showAdd)} style={{
                width: 36, height: 36, borderRadius: 4,
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.4)',
                color: '#00d4ff', fontSize: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 10px rgba(0,212,255,0.2)'
              }}>+</button>
            </div>

            {/* Add task form */}
            {showAdd && (
              <div style={{
                background: 'rgba(13,13,21,0.95)', border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: 8, padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 12
              }}>
                <input placeholder="Task title..." value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  className="input-field" />
                <div style={{ display: 'flex', gap: 10 }}>
                  <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.2)', color: '#e0e0e0', borderRadius: 4, padding: '8px 12px', fontFamily: 'Rajdhani' }}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={newTask.category} onChange={e => setNewTask(p => ({ ...p, category: e.target.value }))}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.2)', color: '#e0e0e0', borderRadius: 4, padding: '8px 12px', fontFamily: 'Rajdhani' }}>
                    <option value="today">Today</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="project">Project</option>
                  </select>
                  <input placeholder="Due time..." value={newTask.dueTime}
                    onChange={e => setNewTask(p => ({ ...p, dueTime: e.target.value }))}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.2)', color: '#e0e0e0', borderRadius: 4, padding: '8px 12px', fontFamily: 'Rajdhani', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addTask} className="btn btn-cyan">ADD TASK</button>
                  <button onClick={() => setShowAdd(false)} className="btn btn-outline-cyan">CANCEL</button>
                </div>
              </div>
            )}

            {/* Task grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {tasks.map(t => <TaskCard key={t._id} task={t} />)}
              {tasks.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 12, letterSpacing: 2 }}>
                  // NO TASKS FOUND
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div style={{
        position: 'fixed', bottom: 40, left: 0, right: 0,
        background: 'rgba(10,10,15,0.95)', borderTop: '1px solid rgba(0,212,255,0.1)',
        padding: '10px 24px', display: 'flex', gap: 30, alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div>
          <span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#00d4ff', letterSpacing: 2 }}>System Overview</span>
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa', marginLeft: 16 }}>Efficiency Rating: 94% // Agent Status: ACTIVE</span>
        </div>
        <div style={{ display: 'flex', gap: 20, marginLeft: 'auto' }}>
          {[
            { label: 'Completed', value: stats.completed, color: '#00ff88' },
            { label: 'Pending', value: stats.pending, color: '#ffcc00' },
            { label: 'Total', value: stats.total, color: '#00d4ff' },
          ].map((s, i) => (
            <span key={i} style={{ fontFamily: 'Share Tech Mono', fontSize: 11 }}>
              <span style={{ color: '#8888aa' }}>{s.label}: </span>
              <span style={{ color: s.color }}>{s.value}</span>
            </span>
          ))}
        </div>
      </div>

      <ActiveTaskBar />
    </div>
  );
}
