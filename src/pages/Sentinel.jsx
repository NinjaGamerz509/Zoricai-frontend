import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

// ── Map Component ─────────────────────────────────────────────────────────────
function LocationMap({ lat, lon, label }) {
  if (!lat || !lon) return null;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.05},${lat-0.05},${lon+0.05},${lat+0.05}&layer=mapnik&marker=${lat},${lon}`;
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,212,255,0.3)', marginTop: 12 }}>
      <div style={{ background: 'rgba(0,212,255,0.08)', padding: '6px 12px', fontFamily: 'Orbitron', fontSize: 8, color: '#00d4ff', letterSpacing: 2 }}>
        📍 LOCATION MAP — {label}
      </div>
      <iframe
        src={mapUrl}
        width="100%" height="220"
        style={{ border: 'none', display: 'block', filter: 'invert(0.85) hue-rotate(180deg)' }}
        title="Location Map"
      />
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: '4px 10px', fontFamily: 'Share Tech Mono', fontSize: 9, color: '#555566' }}>
        {lat.toFixed(4)}°N, {lon.toFixed(4)}°E
      </div>
    </div>
  );
}

// ── Result Card ───────────────────────────────────────────────────────────────
function ResultCard({ data, type }) {
  if (!data) return null;

  if (type === 'ip' || type === 'domain') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          {[
            { label: 'IP', value: data.ip || data.ip },
            { label: 'City', value: data.city },
            { label: 'Region', value: data.region },
            { label: 'Country', value: data.country },
            { label: 'ISP', value: data.isp },
            { label: 'Org', value: data.org },
            { label: 'Timezone', value: data.timezone },
            { label: 'Proxy/VPN', value: data.isProxy ? '⚠️ YES' : '✅ NO' },
            { label: 'Hosting', value: data.isHosting ? '⚠️ YES' : '✅ NO' },
          ].filter(i => i.value).map((item, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 8px' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', letterSpacing: 1 }}>{item.label}</div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#c0d0e0', marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
        <LocationMap lat={data.lat} lon={data.lon} label={data.city || data.ip} />
      </motion.div>
    );
  }

  if (type === 'phone') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          {[
            { label: 'Number', value: data.internationalFormat || data.number },
            { label: 'Valid', value: data.valid ? '✅ YES' : '❌ NO' },
            { label: 'Country', value: data.country },
            { label: 'State/Region', value: data.state || data.location || 'Unknown' },
            { label: 'Carrier', value: data.carrier },
            { label: 'Type', value: data.lineType },
          ].filter(i => i.value).map((item, i) => (
            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 8px' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 7, color: '#555566', letterSpacing: 1 }}>{item.label}</div>
              <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#c0d0e0', marginTop: 2 }}>{item.value}</div>
            </div>
          ))}
        </div>
        {data.note && (
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 8, color: '#444455', marginBottom: 8, padding: '4px 8px', background: 'rgba(255,170,0,0.06)', border: '1px solid rgba(255,170,0,0.15)', borderRadius: 5 }}>
            ⚠️ {data.note}
          </div>
        )}
        {data.lat && data.lon && <LocationMap lat={data.lat} lon={data.lon} label={data.state || data.country} />}
      </motion.div>
    );
  }

  if (type === 'email_breach') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: data.breached ? 'rgba(255,68,0,0.08)' : 'rgba(0,255,136,0.06)',
          border: `1px solid ${data.breached ? 'rgba(255,68,0,0.3)' : 'rgba(0,255,136,0.3)'}`,
          borderRadius: 10, padding: 14,
        }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: data.breached ? '#ff4400' : '#00ff88', marginBottom: 10, textAlign: 'center' }}>
          {data.breached ? `⚠️ ${data.count} BREACH${data.count > 1 ? 'ES' : ''} FOUND!` : '✅ NO BREACHES FOUND'}
        </div>
        {data.breached && data.breaches.map((b, i) => (
          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '8px 10px', marginBottom: 6 }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: '#ff8800', fontWeight: 700 }}>{b.Name}</div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#555566', marginTop: 2 }}>
              {b.BreachDate} — {b.PwnCount?.toLocaleString()} accounts
            </div>
            <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#888', marginTop: 2 }}>
              Data: {b.DataClasses?.slice(0, 3).join(', ')}
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  if (type === 'username') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: 14 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#00d4ff', marginBottom: 10 }}>
          ✅ FOUND ON {data.found.length}/{data.total} PLATFORMS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[...data.found, ...data.notFound].map((p, i) => (
            <a key={i} href={p.found ? p.url : undefined} target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 8px', borderRadius: 6, textDecoration: 'none',
                background: p.found ? 'rgba(0,255,136,0.06)' : 'rgba(0,0,0,0.2)',
                border: `1px solid ${p.found ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.05)'}`,
                cursor: p.found ? 'pointer' : 'default',
              }}>
              <span style={{ fontSize: 12 }}>{p.icon}</span>
              <span style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: p.found ? '#00ff88' : '#444455' }}>
                {p.name}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 8 }}>{p.found ? '✓' : '✗'}</span>
            </a>
          ))}
        </div>
      </motion.div>
    );
  }

  if (type === 'subdomain') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 10, padding: 14 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#00d4ff', marginBottom: 10 }}>
          🔍 {data.found.length} SUBDOMAINS FOUND
        </div>
        {data.found.length === 0 && (
          <div style={{ color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 10, textAlign: 'center' }}>No subdomains found</div>
        )}
        {data.found.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noreferrer"
            style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', borderRadius: 6, marginBottom: 4, background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#00ff88' }}>{s.subdomain}</span>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#555566' }}>HTTP {s.status}</span>
          </a>
        ))}
      </motion.div>
    );
  }

  if (type === 'phishing') {
    const riskColor = data.risk === 'HIGH' ? '#ff4444' : data.risk === 'MEDIUM' ? '#ffaa00' : data.risk === 'LOW' ? '#ffdd00' : '#00ff88';
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: `rgba(${data.risk === 'SAFE' ? '0,255,136' : '255,68,0'},0.06)`, border: `1px solid ${riskColor}44`, borderRadius: 10, padding: 14 }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: riskColor, fontWeight: 900 }}>{data.risk}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#555566' }}>Risk Score: {data.riskScore}/100</div>
        </div>
        {data.flags.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ color: '#ff8800', flexShrink: 0 }}>⚠</span>
            <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#c0d0e0' }}>{f}</span>
          </div>
        ))}
        {data.flags.length === 0 && <div style={{ color: '#00ff88', fontFamily: 'Share Tech Mono', fontSize: 10, textAlign: 'center' }}>✅ Koi suspicious pattern nahi mila!</div>}
      </motion.div>
    );
  }

  if (type === 'password') {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(0,0,0,0.2)', border: `1px solid ${data.color}44`, borderRadius: 10, padding: 14 }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 18, color: data.color, fontWeight: 900 }}>{data.strength}</div>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8 }}>
            {Array.from({ length: data.maxScore }).map((_, i) => (
              <div key={i} style={{ width: 24, height: 6, borderRadius: 3, background: i < data.score ? data.color : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#555566', marginTop: 6 }}>
            Crack time: <span style={{ color: data.color }}>{data.crackTime}</span>
          </div>
        </div>
        {data.suggestions.length > 0 && (
          <div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#555566', letterSpacing: 1, marginBottom: 6 }}>SUGGESTIONS:</div>
            {data.suggestions.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
                <span style={{ color: '#ffaa00', flexShrink: 0 }}>→</span>
                <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#c0d0e0' }}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  return null;
}

// ── Tool Card ─────────────────────────────────────────────────────────────────
function ToolCard({ tool, onRun }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleRun = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post(`/sentinel/${tool.endpoint}`, { [tool.inputKey]: input.trim() });
      if (res.data.success) setResult(res.data);
      else setError(res.data.message || 'Error');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(11,11,18,0.95)',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: 12, padding: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>{tool.icon}</span>
        <div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#00d4ff', letterSpacing: 1 }}>{tool.name}</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: '#555566', marginTop: 2 }}>{tool.desc}</div>
        </div>
        <div style={{
          marginLeft: 'auto', background: `${tool.categoryColor}22`,
          border: `1px solid ${tool.categoryColor}44`,
          borderRadius: 20, padding: '2px 8px',
          fontFamily: 'Orbitron', fontSize: 7, color: tool.categoryColor, letterSpacing: 1,
        }}>{tool.category}</div>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleRun()}
          placeholder={tool.placeholder}
          style={{
            flex: 1, background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 7, padding: '8px 12px',
            color: '#e0e0e0', fontFamily: 'Share Tech Mono', fontSize: 11,
            outline: 'none', caretColor: '#00d4ff',
          }}
        />
        <button onClick={handleRun} disabled={loading || !input.trim()} style={{
          background: loading ? 'rgba(0,212,255,0.05)' : 'rgba(0,212,255,0.12)',
          border: '1px solid rgba(0,212,255,0.3)',
          borderRadius: 7, padding: '8px 14px',
          color: '#00d4ff', fontFamily: 'Orbitron', fontSize: 8,
          letterSpacing: 1, cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}>
          {loading ? '⟳' : 'SCAN →'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(255,68,0,0.08)', border: '1px solid rgba(255,68,0,0.2)', borderRadius: 6, fontFamily: 'Share Tech Mono', fontSize: 10, color: '#ff4444' }}>
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && <div style={{ marginTop: 10 }}><ResultCard data={result.data || result} type={result.type} /></div>}
    </motion.div>
  );
}

// ── Main Sentinel Page ────────────────────────────────────────────────────────
const TOOLS = [
  // OSINT
  { id: 'ip', name: 'IP TRACKER', icon: '🌐', desc: 'IP address ki location, ISP, VPN detect karo', endpoint: 'ip', inputKey: 'ip', placeholder: 'IP address daalo (e.g. 8.8.8.8)', category: 'OSINT', categoryColor: '#00d4ff' },
  { id: 'phone', name: 'PHONE LOOKUP', icon: '📱', desc: 'Phone number ka carrier, location info', endpoint: 'phone', inputKey: 'phone', placeholder: 'Phone number (e.g. +919876543210)', category: 'OSINT', categoryColor: '#00d4ff' },
  { id: 'email', name: 'EMAIL BREACH', icon: '📧', desc: 'Email dark web mein breach hua hai ya nahi', endpoint: 'email-breach', inputKey: 'email', placeholder: 'Email address daalo', category: 'SECURITY', categoryColor: '#ff4444' },
  { id: 'username', name: 'USERNAME SEARCH', icon: '👤', desc: '12+ platforms pe username dhundho', endpoint: 'username', inputKey: 'username', placeholder: 'Username daalo', category: 'OSINT', categoryColor: '#00d4ff' },
  { id: 'subdomain', name: 'SUBDOMAIN FINDER', icon: '🔍', desc: 'Website ke hidden subdomains dhundho', endpoint: 'subdomains', inputKey: 'domain', placeholder: 'Domain daalo (e.g. google.com)', category: 'WEB', categoryColor: '#7b2fff' },
  { id: 'phishing', name: 'PHISHING DETECTOR', icon: '🎣', desc: 'Link safe hai ya phishing attack', endpoint: 'phishing', inputKey: 'url', placeholder: 'URL daalo check karne ke liye', category: 'SECURITY', categoryColor: '#ff4444' },
  { id: 'domain', name: 'DOMAIN ANALYZER', icon: '🏢', desc: 'Domain ka IP, location, SSL info', endpoint: 'domain', inputKey: 'domain', placeholder: 'Domain daalo (e.g. github.com)', category: 'WEB', categoryColor: '#7b2fff' },
  { id: 'password', name: 'PASSWORD ANALYZER', icon: '🔐', desc: 'Password kitna strong hai, crack time', endpoint: 'password', inputKey: 'password', placeholder: 'Password daalo analyze karne ke liye', category: 'SECURITY', categoryColor: '#ff4444' },
];

const CATEGORIES = ['ALL', 'OSINT', 'SECURITY', 'WEB'];

export default function Sentinel() {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const filtered = activeCategory === 'ALL' ? TOOLS : TOOLS.filter(t => t.category === activeCategory);

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50 }}>
      <Navbar />
      <Sidebar />

      <div style={{ marginLeft: 240, marginRight: 260, padding: '20px 16px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div>
              <h1 style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#00d4ff', fontWeight: 900, letterSpacing: 4, margin: 0, textShadow: '0 0 20px rgba(0,212,255,0.5)' }}>
                ⚔️ SENTINEL
              </h1>
              <p style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#555566', letterSpacing: 2, margin: '4px 0 0 0' }}>
                SECURITY INTELLIGENCE SYSTEM
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }}
              />
              <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#00ff88' }}>ACTIVE</span>
            </div>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                background: activeCategory === cat ? 'rgba(0,212,255,0.15)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${activeCategory === cat ? 'rgba(0,212,255,0.5)' : 'rgba(0,212,255,0.1)'}`,
                borderRadius: 20, padding: '5px 16px',
                color: activeCategory === cat ? '#00d4ff' : '#555566',
                fontFamily: 'Orbitron', fontSize: 8, letterSpacing: 2,
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Tools grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 }}>
          {filtered.map((tool, i) => (
            <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </div>

        {/* AI tip */}
        <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(123,47,255,0.06)', border: '1px solid rgba(123,47,255,0.2)', borderRadius: 10 }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#7b2fff', letterSpacing: 2, marginBottom: 6 }}>💬 AI SE BHI KARWAO</div>
          <div style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa', lineHeight: 1.8 }}>
            "8.8.8.8 IP track kar" • "mera email check karo breach ke liye" • "username johndoe dhundho" • "yeh link safe hai?" • "mera password check karo" • "google.com ke subdomains dhundho"
          </div>
        </div>
      </div>
    </div>
  );
}
