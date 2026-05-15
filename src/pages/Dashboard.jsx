import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RightPanel from '../components/RightPanel';
import ChatBox from '../components/ChatBox';
import OrbVisualizer from '../components/OrbVisualizer';
import OrbButtons from '../components/OrbButtons';
import ActiveTaskBar from '../components/ActiveTaskBar';
import api from '../services/api';
import useStore from '../context/store';
import {
  startListening, stopListening,
  playAudio, stopAudio,
  startWakeWordListener, stopWakeWordListener
} from '../services/speechService';
import '../styles/globals.css';

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [wakeWordOn, setWakeWordOn] = useState(false);
  const [playlistQueue, setPlaylistQueue] = useState([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const { setOrbState, setAgents } = useStore();

  const loadHistory = async () => {
    try {
      const res = await api.get('/chat/history');
      const hist = res.data.history || [];
      const recent = hist.slice(-50);
      setMessages(recent.map(m => ({
        role: m.role,
        message: m.message,
        responseTime: m.responseTime,
      })));
    } catch {}
  };

  const playlistTimerRef = useRef(null);

  // Playlist queue — next song auto play
  useEffect(() => {
    if (playlistQueue.length === 0) return;
    const song = playlistQueue[playlistIndex];
    if (!song) return;

    setCurrentVideo(song.videoId);
    setVideoInfo(song);
    setMessages(prev => [...prev, {
      role: 'zoric',
      message: `🎵 Ab "${song.title}" chal raha hai`,
    }]);

    // Duration se timer — duration string "3:45" ya seconds mein ho sakta hai
    if (playlistTimerRef.current) clearTimeout(playlistTimerRef.current);

    let durationMs = 4 * 60 * 1000; // default 4 min
    if (song.duration) {
      if (typeof song.duration === 'string' && song.duration.includes(':')) {
        const parts = song.duration.split(':').map(Number);
        durationMs = parts.length === 2
          ? (parts[0] * 60 + parts[1]) * 1000
          : (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
      } else if (!isNaN(song.duration)) {
        durationMs = Number(song.duration) * 1000;
      }
      durationMs += 2000; // 2 sec buffer
    }

    playlistTimerRef.current = setTimeout(() => {
      const next = playlistIndex + 1;
      if (next < playlistQueue.length) {
        setPlaylistIndex(next);
      } else {
        setPlaylistQueue([]);
        setPlaylistIndex(0);
        setMessages(prev => [...prev, { role: 'zoric', message: '🎵 Playlist khatam boss! Repeat karun?' }]);
      }
    }, durationMs);

    return () => { if (playlistTimerRef.current) clearTimeout(playlistTimerRef.current); };
  }, [playlistIndex, playlistQueue]);

  // YouTube ended event bhi sun lo
  useEffect(() => {
    const handleVideoEnd = () => {
      if (playlistQueue.length === 0) return;
      if (playlistTimerRef.current) clearTimeout(playlistTimerRef.current);
      const next = playlistIndex + 1;
      if (next < playlistQueue.length) {
        setPlaylistIndex(next);
      } else {
        setPlaylistQueue([]);
        setPlaylistIndex(0);
        setMessages(prev => [...prev, { role: 'zoric', message: '🎵 Playlist khatam boss! Repeat karun?' }]);
      }
    };
    window.addEventListener('youtube_ended', handleVideoEnd);
    return () => window.removeEventListener('youtube_ended', handleVideoEnd);
  }, [playlistQueue, playlistIndex]);

  useEffect(() => {
    loadHistory();
    const socket = io('http://127.0.0.1:5000');
    socketRef.current = socket;
    socket.on('connect', () => setSocketId(socket.id));
    socket.on('agent_update', ({ agents, active }) => setAgents(agents, active));
    return () => {
      socket.disconnect();
      stopWakeWordListener();
    };
  }, []);

  // ── Wake word toggle ────────────────────────────────────────────────────
  const toggleWakeWord = () => {
    if (wakeWordOn) {
      stopWakeWordListener();
      setWakeWordOn(false);
      setOrbState('idle');
    } else {
      setWakeWordOn(true);
      startWakeWordListener(
        () => { setOrbState('listening'); },
        (transcript) => { setOrbState('thinking'); sendMessage(transcript); },
        () => { if (useStore.getState().orbState === 'listening') setOrbState('idle'); }
      );
    }
  };

  // ── File / Image upload handler ─────────────────────────────────────────
  const handleFileUpload = async (file, preview) => {
    if (loading) return;
    setLoading(true);
    setOrbState('thinking');

    const isImage = file.type.startsWith('image/');
    const userMsg = isImage ? `📷 Image bheja: ${file.name}` : `📎 File bheja: ${file.name}`;

    setMessages(prev => [...prev,
      { role: 'user', message: userMsg, imagePreview: isImage ? preview : null },
      { role: 'zoric', message: '', isTyping: true }
    ]);

    try {
      let reply = '';

      if (isImage && preview) {
        // Send image to backend as base64 in message
        const res = await api.post('/chat', {
          message: `[IMAGE_UPLOAD] Yeh image dekh aur detail mein bata kya hai isme. Base64: ${preview.split(',')[1].slice(0, 200)}...`,
          socketId,
          imageBase64: preview.split(',')[1],
          imageMime: file.type,
        });
        reply = res.data.message;
      } else {
        // Text/code/pdf file
        const text = await file.text();
        const res = await api.post('/chat', {
          message: `[FILE_UPLOAD: ${file.name}]\n\n${text.slice(0, 4000)}\n\nIs file ka summary de aur kya important hai bata. Hinglish mein.`,
          socketId,
        });
        reply = res.data.message;
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'zoric', message: reply };
        return updated;
      });

      setOrbState('speaking');
      try {
        const ttsRes = await api.post('/voice/tts', { text: reply.slice(0, 300), format: 'mp3' }, { responseType: 'blob' });
        playAudio(ttsRes.data, () => setOrbState('idle'));
      } catch { setOrbState('idle'); }

    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'zoric', message: 'File process nahi ho paya boss: ' + (err.response?.data?.message || err.message) };
        return updated;
      });
      setOrbState('idle');
    } finally {
      setLoading(false);
      setAgents([], false);
    }
  };

  // ── Camera frame send to AI ─────────────────────────────────────────────
  const handleCameraFrame = async (base64) => {
    if (loading) return;
    setLoading(true);
    setOrbState('thinking');

    setMessages(prev => [...prev,
      { role: 'user', message: '📷 Camera se dikhaya', imagePreview: `data:image/jpeg;base64,${base64}` },
      { role: 'zoric', message: '', isTyping: true }
    ]);

    try {
      const res = await api.post('/chat', {
        message: 'Yeh camera frame mein kya dikh raha hai? Detail mein Hinglish mein bata.',
        socketId,
        imageBase64: base64,
        imageMime: 'image/jpeg',
      });
      const reply = res.data.message;

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'zoric', message: reply };
        return updated;
      });

      setOrbState('speaking');
      try {
        const ttsRes = await api.post('/voice/tts', { text: reply.slice(0, 300), format: 'mp3' }, { responseType: 'blob' });
        playAudio(ttsRes.data, () => setOrbState('idle'));
      } catch { setOrbState('idle'); }

    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'zoric', message: 'Camera frame process nahi ho paya: ' + (err.response?.data?.message || err.message) };
        return updated;
      });
      setOrbState('idle');
    } finally {
      setLoading(false);
      setAgents([], false);
    }
  };

  // ── File input change ───────────────────────────────────────────────────
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => handleFileUpload(file, ev.target.result);
      reader.readAsDataURL(file);
    } else {
      handleFileUpload(file, null);
    }
    e.target.value = '';
  };

  // ── Send message ────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);
    setOrbState('thinking');

    setMessages(prev => [...prev, { role: 'user', message: msg }]);
    setMessages(prev => [...prev, { role: 'zoric', message: '', isTyping: true }]);

    try {
      const res = await api.post('/chat', { message: msg, socketId });
      const reply = res.data.message;

      if (res.data.youtubeVideoId) {
        setCurrentVideo(res.data.youtubeVideoId);
        setVideoInfo(res.data.videoInfo || null);
      }
      // Playlist auto-play — saare songs queue mein dalo
      if (res.data.playlistPlay && res.data.playlistSongs) {
        setPlaylistQueue(res.data.playlistSongs);
        setPlaylistIndex(0);
      }
      if (res.data.action === 'YOUTUBE_PAUSE') window.dispatchEvent(new CustomEvent('youtube_pause'));
      if (res.data.action === 'POMODORO_START') startPomodoro(res.data.duration || 25);

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'zoric', message: reply, responseTime: res.data.responseTime };
        return updated;
      });

      setOrbState('speaking');
      try {
        const ttsRes = await api.post('/voice/tts', { text: reply, format: 'mp3' }, { responseType: 'blob' });
        playAudio(ttsRes.data, () => setOrbState('idle'));
      } catch { setOrbState('idle'); }

    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'zoric', message: 'Error: ' + (err.response?.data?.message || 'Kuch galat ho gaya boss!') };
        return updated;
      });
      setOrbState('idle');
    } finally {
      setLoading(false);
      setAgents([], false);
    }
  };

  const startPomodoro = (duration) => {
    let remaining = duration * 60;
    const interval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(interval);
        sendMessage(`Pomodoro session complete hua! ${duration} minute focus session khatam!`);
      }
    }, 1000);
  };

  const handleListen = () => {
    setOrbState('listening');
    startListening(
      (transcript) => { setInput(transcript); setOrbState('thinking'); sendMessage(transcript); },
      () => { if (useStore.getState().orbState === 'listening') setOrbState('idle'); }
    );
  };

  const handleAnswer = () => { if (input.trim()) sendMessage(input.trim()); };

  const handleStop = () => {
    stopListening(); stopAudio();
    setOrbState('idle'); setAgents([], false); setLoading(false);
  };

  const handleGesture = (action) => {
    switch (action) {
      case 'STOP': handleStop(); break;
      case 'VOICE_ON': handleListen(); break;
      case 'NEXT': sendMessage('next video'); break;
      case 'PREV': sendMessage('previous video'); break;
      case 'VOLUME_UP': window.dispatchEvent(new CustomEvent('youtube_volume', { detail: { delta: 10 } })); break;
      case 'VOLUME_DOWN': window.dispatchEvent(new CustomEvent('youtube_volume', { detail: { delta: -10 } })); break;
      case 'STOP_ALL': handleStop(); break;
      default: break;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', paddingTop: 50, paddingBottom: 50 }}>
      <Navbar />
      <Sidebar currentVideo={currentVideo} videoInfo={videoInfo} onGesture={handleGesture} onCameraFrame={handleCameraFrame} />

      <div style={{
        marginLeft: 240, marginRight: 260,
        height: 'calc(100vh - 100px)',
        display: 'flex', flexDirection: 'column',
        padding: '16px', gap: 12
      }}>
        {/* Orb Box */}
        <div style={{
          background: 'rgba(11,11,18,0.9)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 12, padding: '20px 16px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 12, flexShrink: 0
        }}>
          <OrbVisualizer />
          <OrbButtons onListen={handleListen} onAnswer={handleAnswer} onStop={handleStop} />

          {/* Wake Word Toggle */}
          <button onClick={toggleWakeWord}
            style={{
              background: wakeWordOn ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: wakeWordOn ? '1px solid rgba(0,212,255,0.6)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20, padding: '5px 16px',
              color: wakeWordOn ? '#00d4ff' : '#666677',
              fontFamily: 'Share Tech Mono', fontSize: 11, letterSpacing: 1,
              cursor: 'pointer', transition: 'all 0.3s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: wakeWordOn ? '#00d4ff' : '#444455',
              boxShadow: wakeWordOn ? '0 0 8px #00d4ff' : 'none',
              display: 'inline-block',
              animation: wakeWordOn ? 'pulse 1.5s infinite' : 'none',
            }} />
            {wakeWordOn ? 'WAKE WORD: ON' : 'WAKE WORD: OFF'}
          </button>
        </div>

        {/* Chat Box */}
        <div style={{
          flex: 1, background: 'rgba(11,11,18,0.9)',
          border: '1px solid rgba(0,212,255,0.15)',
          borderRadius: 12, display: 'flex',
          flexDirection: 'column', overflow: 'hidden'
        }}>
          <ChatBox messages={messages} onSuggestion={(s) => sendMessage(s)} />

          {/* Input bar */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(0,212,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(8,8,14,0.8)'
          }}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.js,.py,.json,.md,.csv"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

            {/* 📎 Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="File ya image upload karo"
              style={{
                background: 'transparent', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 18, color: '#555566', padding: 0,
                transition: 'color 0.2s', flexShrink: 0,
              }}
              onMouseEnter={e => { if (!loading) e.target.style.color = '#00d4ff'; }}
              onMouseLeave={e => e.target.style.color = '#555566'}
            >📎</button>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or speak to ZORIC..."
              disabled={loading}
              style={{
                flex: 1, background: 'transparent',
                border: 'none', outline: 'none',
                color: '#e0e0e0', fontFamily: 'Rajdhani',
                fontSize: 15, fontWeight: 500, caretColor: '#00d4ff'
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: 'transparent', border: 'none',
                cursor: 'pointer', fontSize: 20,
                color: input.trim() ? '#00d4ff' : '#555566',
                transition: 'all 0.2s',
                filter: input.trim() ? 'drop-shadow(0 0 6px #00d4ff)' : 'none'
              }}
            >➤</button>
          </div>
        </div>
      </div>

      <RightPanel />
      <ActiveTaskBar />
    </div>
  );
}
