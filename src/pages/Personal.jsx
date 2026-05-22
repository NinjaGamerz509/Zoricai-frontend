import { useState, useEffect } from 'react';
import api from '../api.js';
import Sidebar from '../components/Sidebar.jsx';

const I = ({ name, size, color }) => (
  <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
);

export default function Personal() {
  const [tab, setTab] = useState('journal');
  const [journals, setJournals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [input, setInput] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    try {
      if (tab === 'journal') {
        const res = await api.get('/journal');
        setJournals(res.data.entries || []);
      } else if (tab === 'habits') {
        const res = await api.get('/habits');
        setHabits(res.data.habits || []);
      } else if (tab === 'expenses') {
        const res = await api.get('/expenses');
        setExpenses(res.data.expenses || []);
      }
    } catch {}
  };

  const addJournal = async () => {
    if (!input.trim()) return;
    try { await api.post('/journal', { content: input }); setInput(''); loadData(); } catch {}
  };

  const addHabit = async () => {
    if (!input.trim()) return;
    try { await api.post('/habits', { name: input }); setInput(''); loadData(); } catch {}
  };

  const toggleHabit = async (id) => {
    try { await api.put(`/habits/${id}/toggle`); loadData(); } catch {}
  };

  const addExpense = async () => {
    if (!input.trim() || !amount) return;
    try { await api.post('/expenses', { description: input, amount: parseFloat(amount), category }); setInput(''); setAmount(''); loadData(); } catch {}
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>PERSONAL</div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'journal', icon: 'book', label: 'JOURNAL' },
            { key: 'habits', icon: 'local_fire_department', label: 'HABITS' },
            { key: 'expenses', icon: 'payments', label: 'EXPENSES' },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setInput(''); }} style={{
              flex: 1, padding: '10px', borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: tab === t.key ? 'rgba(0,212,255,0.15)' : 'transparent',
              border: `1px solid ${tab === t.key ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.1)'}`,
              color: tab === t.key ? '#00d4ff' : '#8888aa',
              fontSize: 11, letterSpacing: 1, fontFamily: 'monospace',
            }}>
              <I name={t.icon} size={16} color={tab === t.key ? '#00d4ff' : '#8888aa'} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'journal' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="// WRITE YOUR THOUGHTS..." rows={3}
                style={{ padding: '12px', borderRadius: 6, outline: 'none', resize: 'none', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 13 }}
              />
              <button onClick={addJournal} style={{ padding: '12px', borderRadius: 6, cursor: 'pointer', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 12, letterSpacing: 2 }}>ADD ENTRY</button>
            </div>
            {journals.map((j, i) => (
              <div key={i} style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,212,255,0.1)' }}>
                <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.6 }}>{j.content}</div>
                <div style={{ fontSize: 9, color: '#445566', marginTop: 6 }}>{new Date(j.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {journals.length === 0 && <div style={{ color: '#334455', fontSize: 12, textAlign: 'center', padding: 20 }}>// NO ENTRIES</div>}
          </>
        )}

        {tab === 'habits' && (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} placeholder="// ADD HABIT..."
                style={{ flex: 1, padding: '12px', borderRadius: 6, outline: 'none', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 13 }}
              />
              <button onClick={addHabit} style={{ padding: '12px 16px', borderRadius: 6, cursor: 'pointer', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
                <I name="add" size={20} color="#00d4ff" />
              </button>
            </div>
            {habits.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: `1px solid ${h.completedToday ? 'rgba(0,255,136,0.2)' : 'rgba(0,212,255,0.1)'}` }}>
                <div onClick={() => toggleHabit(h._id)} style={{ cursor: 'pointer' }}>
                  <I name={h.completedToday ? 'check_circle' : 'radio_button_unchecked'} size={22} color={h.completedToday ? '#00ff88' : '#445566'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: h.completedToday ? '#00ff88' : '#ccc' }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: '#445566' }}>🔥 {h.streak || 0} day streak</div>
                </div>
              </div>
            ))}
            {habits.length === 0 && <div style={{ color: '#334455', fontSize: 12, textAlign: 'center', padding: 20 }}>// NO HABITS</div>}
          </>
        )}

        {tab === 'expenses' && (
          <>
            <div style={{ padding: 16, border: '1px solid rgba(255,170,0,0.2)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#ffaa00', fontFamily: 'Orbitron' }}>₹{totalExpenses.toFixed(2)}</div>
              <div style={{ fontSize: 9, color: '#445566', letterSpacing: 2 }}>TOTAL EXPENSES</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder="// DESCRIPTION..."
                style={{ padding: '12px', borderRadius: 6, outline: 'none', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 13 }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="AMOUNT"
                  style={{ flex: 1, padding: '12px', borderRadius: 6, outline: 'none', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 13 }}
                />
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '12px', borderRadius: 6, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 12, outline: 'none' }}>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button onClick={addExpense} style={{ padding: '12px', borderRadius: 6, cursor: 'pointer', background: 'rgba(255,170,0,0.15)', border: '1px solid rgba(255,170,0,0.4)', color: '#ffaa00', fontFamily: 'monospace', fontSize: 12, letterSpacing: 2 }}>ADD EXPENSE</button>
            </div>
            {expenses.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,170,0,0.1)' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#ccc' }}>{e.description}</div>
                  <div style={{ fontSize: 9, color: '#445566' }}>{e.category} • {new Date(e.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ fontSize: 14, color: '#ffaa00', fontFamily: 'Orbitron' }}>₹{e.amount}</div>
              </div>
            ))}
            {expenses.length === 0 && <div style={{ color: '#334455', fontSize: 12, textAlign: 'center', padding: 20 }}>// NO EXPENSES</div>}
          </>
        )}
      </div>
    </div>
  );
}
