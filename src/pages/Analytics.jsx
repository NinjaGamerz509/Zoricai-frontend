import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ActiveTaskBar from '../components/ActiveTaskBar';
import api from '../services/api';
import '../styles/globals.css';

export default function Analytics() {
  const [expenseStats, setExpenseStats] = useState({ byCategory: {}, total: 0 });
  const [moods, setMoods] = useState([]);
  const [habits, setHabits] = useState([]);
  const [ytHistory, setYtHistory] = useState([]);
  const [chatStats, setChatStats] = useState({ total: 0 });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [exp, mood, hab, yt, chat] = await Promise.allSettled([
        api.get('/personal/expenses/stats'),
        api.get('/personal/mood'),
        api.get('/personal/habits'),
        api.get('/youtube/history'),
        api.get('/chat/history')
      ]);
      if (exp.status === 'fulfilled') setExpenseStats(exp.value.data.stats || { byCategory: {}, total: 0 });
      if (mood.status === 'fulfilled') setMoods(mood.value.data.moods || []);
      if (hab.status === 'fulfilled') setHabits(hab.value.data.habits || []);
      if (yt.status === 'fulfilled') setYtHistory(yt.value.data.history || []);
      if (chat.status === 'fulfilled') setChatStats({ total: chat.value.data.history?.length || 0 });
    } catch {}
  };

  const MOOD_COLORS = { happy: '#00ff88', excited: '#00d4ff', neutral: '#ffcc00', sad: '#7b2fff', angry: '#ff4444', anxious: '#ff8800' };
  const CAT_COLORS = { food: '#ff6b6b', transport: '#4ecdc4', entertainment: '#45b7d1', shopping: '#96ceb4', health: '#88d8b0', education: '#ffeaa7', other: '#dfe6e9' };

  const Card = ({ title, children, style = {} }) => (
    <div style={{
      background: 'rgba(13,13,21,0.8)',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: 8, padding: 18,
      ...style
    }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50, paddingBottom: 80 }}>
      <Navbar />
      <div style={{ padding: '20px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4, marginBottom: 24, textAlign: 'center' }}>
          📊 ANALYTICS
        </h2>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'TOTAL CHATS', value: chatStats.total, color: '#00d4ff', icon: '💬' },
            { label: 'VIDEOS WATCHED', value: ytHistory.length, color: '#ff4444', icon: '🎬' },
            { label: 'HABITS ACTIVE', value: habits.length, color: '#00ff88', icon: '🔥' },
            { label: 'TOTAL SPENT', value: `₹${expenseStats.total || 0}`, color: '#ffcc00', icon: '💸' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(13,13,21,0.8)',
              border: `1px solid ${s.color}22`,
              borderRadius: 8, padding: 16, textAlign: 'center'
            }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: s.color, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#8888aa', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Expense by category */}
          <Card title="💸 EXPENSE BY CATEGORY">
            {Object.entries(expenseStats.byCategory || {}).length === 0 ? (
              <p style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 11 }}>// No expenses yet</p>
            ) : (
              Object.entries(expenseStats.byCategory).map(([cat, amt]) => {
                const pct = expenseStats.total > 0 ? (amt / expenseStats.total * 100).toFixed(0) : 0;
                return (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Rajdhani', fontSize: 13, color: '#aaaacc', textTransform: 'capitalize' }}>{cat}</span>
                      <span style={{ fontFamily: 'Share Tech Mono', fontSize: 12, color: CAT_COLORS[cat] || '#8888aa' }}>₹{amt} ({pct}%)</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: CAT_COLORS[cat] || '#8888aa', borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })
            )}
          </Card>

          {/* Mood history */}
          <Card title="😊 MOOD HISTORY">
            {moods.length === 0 ? (
              <p style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 11 }}>// No mood data yet</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {moods.slice(0, 14).map((m, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `${MOOD_COLORS[m.mood] || '#8888aa'}33`,
                      border: `2px solid ${MOOD_COLORS[m.mood] || '#8888aa'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12
                    }}>
                      {m.mood === 'happy' ? '😊' : m.mood === 'sad' ? '😢' : m.mood === 'excited' ? '🤩' : m.mood === 'angry' ? '😠' : m.mood === 'anxious' ? '😰' : '😐'}
                    </div>
                    <div style={{ fontSize: 9, color: '#555566', fontFamily: 'Share Tech Mono', marginTop: 2 }}>
                      {m.date?.slice(5)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Habits */}
          <Card title="🔥 HABIT STREAKS">
            {habits.length === 0 ? (
              <p style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 11 }}>// No habits yet</p>
            ) : habits.map(h => (
              <div key={h._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 4 }}>
                <div>
                  <span style={{ fontSize: 16, marginRight: 8 }}>{h.icon}</span>
                  <span style={{ fontFamily: 'Rajdhani', fontSize: 14, color: '#e0e0e0' }}>{h.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Orbitron', fontSize: 16, color: h.color || '#00d4ff' }}>{h.streak}</div>
                  <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#8888aa' }}>STREAK</div>
                </div>
              </div>
            ))}
          </Card>

          {/* YouTube history */}
          <Card title="🎬 RECENT VIDEOS">
            {ytHistory.length === 0 ? (
              <p style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 11 }}>// No watch history yet</p>
            ) : ytHistory.slice(0, 5).map((v, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                {v.thumbnail && <img src={v.thumbnail} alt="" style={{ width: 56, height: 32, borderRadius: 3, objectFit: 'cover', border: '1px solid rgba(0,212,255,0.1)' }} />}
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa' }}>{v.author}</div>
                </div>
                {v.liked && <span style={{ marginLeft: 'auto', color: '#ff4444' }}>❤️</span>}
              </div>
            ))}
          </Card>
        </div>
      </div>
      <ActiveTaskBar />
    </div>
  );
}
