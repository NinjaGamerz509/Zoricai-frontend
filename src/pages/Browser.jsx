import { useState } from 'react';
import { Browser as CapBrowser } from '@capacitor/browser';
import Sidebar from '../components/Sidebar.jsx';

const I = ({ name, size, color }) => (
  <span className="material-icons" style={{ fontSize: size || 20, color: color || 'inherit' }}>{name}</span>
);

export default function Browser() {
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');

  const openUrl = async (link) => {
    let finalUrl = link;
    if (!link.startsWith('http')) finalUrl = 'https://' + link;
    await CapBrowser.open({ url: finalUrl });
  };

  const searchWeb = async () => {
    if (!search.trim()) return;
    await CapBrowser.open({ url: `https://www.google.com/search?q=${encodeURIComponent(search)}` });
  };

  const quickLinks = [
    { label: 'Google', url: 'https://google.com', icon: 'search' },
    { label: 'YouTube', url: 'https://youtube.com', icon: 'play_circle' },
    { label: 'GitHub', url: 'https://github.com', icon: 'code' },
    { label: 'Wikipedia', url: 'https://wikipedia.org', icon: 'menu_book' },
    { label: 'Reddit', url: 'https://reddit.com', icon: 'forum' },
    { label: 'Twitter', url: 'https://twitter.com', icon: 'tag' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#050510', color: '#fff', fontFamily: "'Share Tech Mono', monospace", overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ fontFamily: 'Orbitron', fontSize: 20, color: '#00d4ff', letterSpacing: 4 }}>BROWSER</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchWeb()} placeholder="// SEARCH THE WEB..."
            style={{ flex: 1, padding: '12px', borderRadius: 6, outline: 'none', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 13 }}
          />
          <button onClick={searchWeb} style={{ padding: '12px 16px', borderRadius: 6, cursor: 'pointer', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
            <I name="search" size={20} color="#00d4ff" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && openUrl(url)} placeholder="// ENTER URL..."
            style={{ flex: 1, padding: '12px', borderRadius: 6, outline: 'none', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff', fontFamily: 'monospace', fontSize: 13 }}
          />
          <button onClick={() => openUrl(url)} style={{ padding: '12px 16px', borderRadius: 6, cursor: 'pointer', background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff' }}>
            <I name="open_in_new" size={20} color="#00d4ff" />
          </button>
        </div>

        <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10, color: '#00d4ff', letterSpacing: 2, marginBottom: 12 }}>QUICK ACCESS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {quickLinks.map((l, i) => (
              <button key={i} onClick={() => openUrl(l.url)} style={{ padding: '12px 8px', borderRadius: 8, cursor: 'pointer', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', color: '#8888aa', fontSize: 11, letterSpacing: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <I name={l.icon} size={20} color="#00d4ff" />
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
