// Journal Page
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ActiveTaskBar from '../components/ActiveTaskBar';
import api from '../services/api';
import '../styles/globals.css';

const MOODS = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🤩', label: 'Excited' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'angry', emoji: '😠', label: 'Angry' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
];

export function Journal() {
  const [journals, setJournals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', mood: 'neutral', tags: '' });

  useEffect(() => { fetch(); }, []);

  const fetch = async () => {
    try { const r = await api.get('/personal/journal'); setJournals(r.data.journals || []); } catch {}
  };

  const add = async () => {
    if (!form.content.trim()) return;
    try {
      await api.post('/personal/journal', { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
      setForm({ title: '', content: '', mood: 'neutral', tags: '' });
      setShowAdd(false);
      fetch();
    } catch {}
  };

  const del = async (id) => {
    try { await api.delete(`/personal/journal/${id}`); fetch(); } catch {}
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50, paddingBottom: 80 }}>
      <Navbar />
      <div style={{ padding: '20px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>📓 JOURNAL</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-cyan" style={{ fontSize: 11, padding: '8px 20px' }}>+ NEW ENTRY</button>
        </div>

        {showAdd && (
          <div style={{ background: 'rgba(13,13,21,0.95)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
            <input placeholder="Title (optional)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" style={{ marginBottom: 12 }} />
            <textarea placeholder="Aaj kya hua? Kya soch raha hai..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              style={{ width: '100%', minHeight: 120, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4, padding: '10px 12px', color: '#e0e0e0', fontFamily: 'Rajdhani', fontSize: 14, outline: 'none', resize: 'vertical', marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button key={m.value} onClick={() => setForm(p => ({ ...p, mood: m.value }))}
                  style={{ padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'Rajdhani', border: `1px solid ${form.mood === m.value ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, background: form.mood === m.value ? 'rgba(0,212,255,0.15)' : 'transparent', color: form.mood === m.value ? '#00d4ff' : '#8888aa' }}>
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
            <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input-field" style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={add} className="btn btn-cyan">SAVE</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-outline-cyan">CANCEL</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {journals.map(j => (
            <div key={j._id} style={{ background: 'rgba(13,13,21,0.8)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 8, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{MOODS.find(m => m.value === j.mood)?.emoji || '😐'}</span>
                  <span style={{ fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 600, color: '#e0e0e0' }}>{j.title || 'Untitled Entry'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa' }}>{new Date(j.createdAt).toLocaleDateString('en-IN')}</span>
                  <button onClick={() => del(j._id)} style={{ background: 'transparent', border: 'none', color: '#ff444466', cursor: 'pointer', fontSize: 14 }}
                    onMouseEnter={e => e.target.style.color = '#ff4444'} onMouseLeave={e => e.target.style.color = '#ff444466'}>✕</button>
                </div>
              </div>
              <p style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#aaaacc', lineHeight: 1.6 }}>{j.content}</p>
              {j.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {j.tags.map((t, i) => (
                    <span key={i} style={{ padding: '2px 8px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 3, fontSize: 11, color: '#00d4ff', fontFamily: 'Share Tech Mono' }}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {journals.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 12, letterSpacing: 2 }}>// NO JOURNAL ENTRIES YET</div>
          )}
        </div>
      </div>
      <ActiveTaskBar />
    </div>
  );
}

// Habits Page
export function Habits() {
  const [habits, setHabits] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', frequency: 'daily', color: '#00d4ff', icon: '⭐' });

  useEffect(() => { fetchHabits(); }, []);

  const fetchHabits = async () => {
    try { const r = await api.get('/personal/habits'); setHabits(r.data.habits || []); } catch {}
  };

  const addHabit = async () => {
    if (!form.name.trim()) return;
    try { await api.post('/personal/habits', form); setForm({ name: '', description: '', frequency: 'daily', color: '#00d4ff', icon: '⭐' }); setShowAdd(false); fetchHabits(); } catch {}
  };

  const complete = async (id) => {
    try { await api.put(`/personal/habits/${id}/complete`); fetchHabits(); } catch {}
  };

  const del = async (id) => {
    try { await api.delete(`/personal/habits/${id}`); fetchHabits(); } catch {}
  };

  const today = new Date().toISOString().split('T')[0];
  const ICONS = ['⭐', '💪', '📚', '🏃', '💧', '🧘', '🎯', '✍️', '🎸', '🍎'];
  const COLORS = ['#00d4ff', '#7b2fff', '#00ff88', '#ffcc00', '#ff4444', '#ff8800'];

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50, paddingBottom: 80 }}>
      <Navbar />
      <div style={{ padding: '20px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>🔥 HABITS</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="btn btn-cyan" style={{ fontSize: 11, padding: '8px 20px' }}>+ ADD HABIT</button>
        </div>

        {showAdd && (
          <div style={{ background: 'rgba(13,13,21,0.95)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
            <input placeholder="Habit name..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {ICONS.map(ic => <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))} style={{ fontSize: 20, background: form.icon === ic ? 'rgba(0,212,255,0.15)' : 'transparent', border: `1px solid ${form.icon === ic ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`, borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}>{ic}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {COLORS.map(c => <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: `2px solid ${form.color === c ? '#fff' : 'transparent'}`, cursor: 'pointer' }} />)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addHabit} className="btn btn-cyan">ADD</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-outline-cyan">CANCEL</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
          {habits.map(h => {
            const doneToday = h.completedDates?.includes(today);
            return (
              <div key={h._id} style={{ background: 'rgba(13,13,21,0.8)', border: `1px solid ${doneToday ? h.color + '44' : 'rgba(0,212,255,0.12)'}`, borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{h.icon}</span>
                    <span style={{ fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 600, color: '#e0e0e0' }}>{h.name}</span>
                  </div>
                  <button onClick={() => del(h._id)} style={{ background: 'transparent', border: 'none', color: '#ff444433', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color = '#ff4444'} onMouseLeave={e => e.target.style.color = '#ff444433'}>✕</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'Orbitron', fontSize: 22, color: h.color, fontWeight: 700 }}>{h.streak}</div>
                    <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#8888aa' }}>STREAK</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#8888aa' }}>{h.longestStreak}</div>
                    <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#8888aa' }}>BEST</div>
                  </div>
                </div>
                <button onClick={() => complete(h._id)} disabled={doneToday}
                  style={{ width: '100%', padding: '10px', borderRadius: 4, border: `1px solid ${doneToday ? '#00ff88' : h.color}`, background: doneToday ? 'rgba(0,255,136,0.15)' : 'transparent', color: doneToday ? '#00ff88' : h.color, fontFamily: 'Orbitron', fontSize: 10, letterSpacing: 2, cursor: doneToday ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                  {doneToday ? '✓ DONE TODAY' : 'MARK COMPLETE'}
                </button>
              </div>
            );
          })}
          {habits.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 12 }}>// NO HABITS YET</div>}
        </div>
      </div>
      <ActiveTaskBar />
    </div>
  );
}

// Expenses Page
export function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ amount: '', category: 'food', description: '' });

  const CATS = ['food', 'transport', 'entertainment', 'shopping', 'health', 'education', 'other'];
  const CAT_ICONS = { food: '🍔', transport: '🚗', entertainment: '🎮', shopping: '🛍️', health: '💊', education: '📚', other: '📦' };

  useEffect(() => { fetchExp(); }, []);

  const fetchExp = async () => {
    try { const r = await api.get('/personal/expenses'); setExpenses(r.data.expenses || []); setTotal(r.data.total || 0); } catch {}
  };

  const add = async () => {
    if (!form.amount || !form.description) return;
    try { await api.post('/personal/expenses', form); setForm({ amount: '', category: 'food', description: '' }); setShowAdd(false); fetchExp(); } catch {}
  };

  const del = async (id) => {
    try { await api.delete(`/personal/expenses/${id}`); fetchExp(); } catch {}
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50, paddingBottom: 80 }}>
      <Navbar />
      <div style={{ padding: '20px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>💸 EXPENSES</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 16, color: '#ffcc00' }}>₹{total.toLocaleString()}</div>
            <button onClick={() => setShowAdd(!showAdd)} className="btn btn-cyan" style={{ fontSize: 11, padding: '8px 20px' }}>+ ADD</button>
          </div>
        </div>

        {showAdd && (
          <div style={{ background: 'rgba(13,13,21,0.95)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input type="number" placeholder="Amount ₹" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="input-field" style={{ flex: 1 }} />
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.2)', color: '#e0e0e0', borderRadius: 4, padding: '8px 12px', fontFamily: 'Rajdhani' }}>
                {CATS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <input placeholder="Description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-field" style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={add} className="btn btn-cyan">ADD</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-outline-cyan">CANCEL</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {expenses.map(e => (
            <div key={e._id} style={{ background: 'rgba(13,13,21,0.8)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 6, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{CAT_ICONS[e.category] || '📦'}</span>
                <div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 14, color: '#e0e0e0' }}>{e.description}</div>
                  <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa' }}>{new Date(e.date).toLocaleDateString('en-IN')} • {e.category}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: 15, color: '#ffcc00' }}>₹{e.amount}</span>
                <button onClick={() => del(e._id)} style={{ background: 'transparent', border: 'none', color: '#ff444433', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color = '#ff4444'} onMouseLeave={e => e.target.style.color = '#ff444433'}>✕</button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 12 }}>// NO EXPENSES YET</div>}
        </div>
      </div>
      <ActiveTaskBar />
    </div>
  );
}
