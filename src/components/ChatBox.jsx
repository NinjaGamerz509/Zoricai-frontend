import { useEffect, useRef, useState } from 'react';

function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (/^[\*\-]\s/.test(line)) {
      const content = line.replace(/^[\*\-]\s/, '');
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <span style={{ color: '#00d4ff', flexShrink: 0 }}>▸</span>
          <span>{inlineFormat(content, key++)}</span>
        </div>
      );
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      const content = line.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 8, marginTop: 2 }}>
          <span style={{ color: '#00d4ff', flexShrink: 0, minWidth: 16 }}>{num}.</span>
          <span>{inlineFormat(content, key++)}</span>
        </div>
      );
      continue;
    }
    if (/^#{1,3}\s/.test(line)) {
      const content = line.replace(/^#+\s/, '');
      elements.push(
        <div key={key++} style={{ fontWeight: 700, color: '#00d4ff', marginTop: 6, fontSize: 15 }}>
          {content}
        </div>
      );
      continue;
    }
    if (line.trim() === '') {
      elements.push(<div key={key++} style={{ height: 6 }} />);
      continue;
    }
    elements.push(<div key={key++}>{inlineFormat(line, key++)}</div>);
  }
  return elements;
}

function inlineFormat(text, baseKey) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match;
  let k = baseKey * 100;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={k++}>{text.slice(last, match.index)}</span>);
    if (match[2]) parts.push(<strong key={k++} style={{ color: '#ffffff', fontWeight: 700 }}>{match[2]}</strong>);
    else if (match[3]) parts.push(<em key={k++} style={{ color: '#b0e0ff', fontStyle: 'italic' }}>{match[3]}</em>);
    else if (match[4]) parts.push(
      <code key={k++} style={{
        background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)',
        borderRadius: 4, padding: '1px 5px', fontFamily: 'Share Tech Mono', fontSize: 12, color: '#00d4ff'
      }}>{match[4]}</code>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}

const SUGGESTIONS = {
  default: ['Kya kar sakta hai tu?', 'Mera schedule bata', 'Kuch music chala'],
  music: ['Agle song pe ja', 'Volume badha', 'Pause kar'],
  task: ['Naya task add kar', 'Aaj ke tasks dikhao', 'Task complete kar'],
  weather: ['Kal ka weather bata', 'Humidity kitni hai?', 'Weekly forecast dikhao'],
};

function getSuggestions(lastMessage) {
  if (!lastMessage) return SUGGESTIONS.default;
  const m = lastMessage.toLowerCase();
  if (m.includes('song') || m.includes('music') || m.includes('video') || m.includes('spotify')) return SUGGESTIONS.music;
  if (m.includes('task') || m.includes('reminder') || m.includes('pomodoro')) return SUGGESTIONS.task;
  if (m.includes('weather') || m.includes('mausam') || m.includes('temp')) return SUGGESTIONS.weather;
  return SUGGESTIONS.default;
}

// ── File preview bubble ──────────────────────────────────────────────────────
function FileBubble({ file, preview }) {
  const isImage = file.type.startsWith('image/');
  return (
    <div style={{
      background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 8, padding: '8px 10px', marginBottom: 4,
      display: 'flex', alignItems: 'center', gap: 8, maxWidth: 220,
    }}>
      {isImage && preview ? (
        <img src={preview} alt="upload" style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: 40, height: 40, borderRadius: 4,
          background: 'rgba(0,212,255,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          {isImage ? '🖼️' : file.type.includes('pdf') ? '📄' : file.type.includes('text') ? '📝' : '📎'}
        </div>
      )}
      <div>
        <div style={{ color: '#00d4ff', fontFamily: 'Share Tech Mono', fontSize: 10, fontWeight: 600 }}>
          {file.name.slice(0, 20)}{file.name.length > 20 ? '...' : ''}
        </div>
        <div style={{ color: '#8888aa', fontFamily: 'Share Tech Mono', fontSize: 9 }}>
          {(file.size / 1024).toFixed(1)} KB
        </div>
      </div>
    </div>
  );
}

export default function ChatBox({ messages, onSuggestion, onFileUpload }) {
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastZoric = [...messages].reverse().find(m => m.role === 'zoric' && !m.isTyping);
  const suggestions = getSuggestions(lastZoric?.message);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPendingPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPendingPreview(null);
    }
  };

  const sendFile = () => {
    if (!pendingFile) return;
    if (onFileUpload) onFileUpload(pendingFile, pendingPreview);
    setPendingFile(null);
    setPendingPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelFile = () => {
    setPendingFile(null);
    setPendingPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {messages.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 20, color: '#555566', fontFamily: 'Share Tech Mono', fontSize: 12, letterSpacing: 2 }}>
          // ZORIC AWAITING INPUT...
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

          {/* File attachment preview */}
          {msg.file && (
            <FileBubble file={msg.file} preview={msg.filePreview} />
          )}

          {/* Image preview in chat */}
          {msg.imagePreview && (
            <div style={{ marginBottom: 4 }}>
              <img src={msg.imagePreview} alt="shared" style={{
                maxWidth: 200, maxHeight: 150, borderRadius: 8,
                border: '1px solid rgba(0,212,255,0.3)', objectFit: 'cover',
              }} />
            </div>
          )}

          <div style={{
            maxWidth: '80%', padding: '10px 14px',
            borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
            background: msg.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(0,212,255,0.08)',
            border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,212,255,0.2)',
            boxShadow: msg.role === 'zoric' ? '0 0 15px rgba(0,212,255,0.05)' : 'none',
            fontSize: 14, fontFamily: 'Rajdhani', fontWeight: 500, lineHeight: 1.6,
            color: msg.role === 'user' ? '#e0e0e0' : '#d0f0ff',
          }}>
            {msg.isTyping ? (
              <span style={{ color: '#00d4ff' }}><span className="animate-blink">▌</span></span>
            ) : (
              msg.role === 'zoric' ? renderMarkdown(msg.message) : msg.message
            )}
            {msg.responseTime && (
              <div style={{ fontSize: 10, color: '#8888aa', fontFamily: 'Share Tech Mono', marginTop: 4 }}>
                {(msg.responseTime / 1000).toFixed(1)}s
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Pending file preview */}
      {pendingFile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <FileBubble file={pendingFile} preview={pendingPreview} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <button onClick={sendFile} style={{
              background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: 6, padding: '5px 12px', color: '#00ff88',
              fontFamily: 'Orbitron', fontSize: 8, cursor: 'pointer', letterSpacing: 1,
            }}>SEND ↑</button>
            <button onClick={cancelFile} style={{
              background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)',
              borderRadius: 6, padding: '5px 12px', color: '#ff4444',
              fontFamily: 'Orbitron', fontSize: 8, cursor: 'pointer', letterSpacing: 1,
            }}>✕ CANCEL</button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.txt,.js,.py,.json,.md,.csv"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Upload trigger button — exported via ref for Dashboard to use */}
      <div id="file-upload-trigger" onClick={() => fileInputRef.current?.click()} style={{ display: 'none' }} />

      {/* Suggestions */}
      {lastZoric && onSuggestion && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 4, marginTop: 4 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSuggestion(s)} style={{
              background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.25)',
              borderRadius: 20, padding: '5px 14px', color: '#a0d8ef',
              fontFamily: 'Rajdhani', fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.background = 'rgba(0,212,255,0.18)'; e.target.style.color = '#00d4ff'; }}
              onMouseLeave={e => { e.target.style.background = 'rgba(0,212,255,0.07)'; e.target.style.color = '#a0d8ef'; }}
            >{s}</button>
          ))}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
