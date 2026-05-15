import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

export default function YoutubePlayer({ videoId, videoInfo, onClose }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const playerRef = useRef(null);
  const endTimerRef = useRef(null);

  useEffect(() => {
    if (videoId && videoInfo) {
      api.post('/youtube/history', videoInfo).catch(() => {});
    }

    // Clear old timer
    if (endTimerRef.current) clearTimeout(endTimerRef.current);

    // Duration parse karo aur timer lagao
    if (videoInfo?.duration) {
      let secs = 0;
      const d = videoInfo.duration;
      if (typeof d === 'string' && d.includes(':')) {
        const parts = d.split(':').map(Number);
        secs = parts.length === 2
          ? parts[0] * 60 + parts[1]
          : parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (!isNaN(d)) {
        secs = Number(d);
      }
      if (secs > 0) {
        endTimerRef.current = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('youtube_ended'));
        }, (secs + 2) * 1000);
      }
    }

    return () => { if (endTimerRef.current) clearTimeout(endTimerRef.current); };
  }, [videoId]);

  const getEmbedUrl = (id) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&origin=${window.location.origin}`;
  };

  // YouTube postMessage — video end detect karo
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        // YouTube player state: -1=unstarted, 0=ended, 1=playing, 2=paused
        if (data?.event === 'onStateChange' && data?.info === 0) {
          window.dispatchEvent(new CustomEvent('youtube_ended'));
        }
      } catch {}
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!videoId) return (
    <div style={{
      padding: 16, textAlign: 'center',
      border: '1px solid rgba(0,212,255,0.1)',
      borderRadius: 8, margin: '12px 0',
      background: 'rgba(8,8,14,0.5)'
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>🎬</div>
      <div style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#555566', letterSpacing: 1 }}>
        // NO VIDEO PLAYING
      </div>
      <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: '#444455', marginTop: 4 }}>
        ZORIC se bolo "Play [song/video name]"
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'rgba(8,8,14,0.9)',
      border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 8, overflow: 'hidden',
      margin: '12px 0'
    }}>
      {/* Video */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          ref={playerRef}
          src={getEmbedUrl(videoId)}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            border: 'none'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px' }}>
        {videoInfo && (
          <>
            <div style={{
              fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 600,
              color: '#e0e0e0', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginBottom: 2
            }}>
              {videoInfo.title}
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: '#8888aa', marginBottom: 8 }}>
              {videoInfo.author} {videoInfo.duration && `• ${videoInfo.duration}`}
            </div>
          </>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Like button */}
          <button
            onClick={() => videoId && api.put(`/youtube/like/${videoId}`).catch(() => {})}
            style={{
              background: 'transparent', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 4, padding: '4px 8px', color: '#8888aa',
              cursor: 'pointer', fontSize: 12, transition: 'all 0.2s'
            }}
            title="Like"
          >❤️</button>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              style={{ background: 'transparent', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: 14 }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <input
              type="range" min="0" max="100" value={volume}
              onChange={e => setVolume(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: '#00d4ff', height: 3 }}
            />
          </div>

          {/* Fullscreen hint */}
          <button
            onClick={() => playerRef.current?.requestFullscreen?.()}
            style={{
              background: 'transparent', border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 4, padding: '4px 8px', color: '#8888aa',
              cursor: 'pointer', fontSize: 12
            }}
            title="Fullscreen"
          >⛶</button>
        </div>
      </div>
    </div>
  );
}
