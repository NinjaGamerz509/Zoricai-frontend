import { useEffect, useRef, useState } from 'react';

export default function GestureControl({ onGesture, enabled, onToggle, onCameraFrame }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('inactive');
  const [facingMode, setFacingMode] = useState('user'); // user = front, environment = back
  const streamRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [enabled]);

  const startCamera = async (facing) => {
    stopCamera();
    try {
      setStatus('loading');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: 320, height: 240 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStatus('active');
    } catch (error) {
      setStatus('error');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setStatus('inactive');
  };

  // Switch between front and back camera
  const switchCamera = () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacing);
    if (enabled) startCamera(newFacing);
  };

  // Capture current frame and send to AI
  const captureAndSend = () => {
    if (!videoRef.current || status !== 'active') return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    // Mirror front camera
    if (facingMode === 'user') {
      ctx.translate(320, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    if (onCameraFrame) onCameraFrame(base64);
  };

  return (
    <div style={{
      background: 'rgba(8,8,14,0.9)',
      border: `1px solid ${enabled ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.1)'}`,
      borderRadius: 8, padding: 12, margin: '8px 0'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Orbitron', fontSize: 10, color: '#00d4ff', letterSpacing: 2 }}>
          📷 AI CAMERA
        </span>
        <button onClick={onToggle} style={{
          background: enabled ? 'rgba(0,212,255,0.15)' : 'transparent',
          border: `1px solid ${enabled ? '#00d4ff' : 'rgba(0,212,255,0.2)'}`,
          borderRadius: 3, padding: '3px 8px',
          color: enabled ? '#00d4ff' : '#8888aa',
          fontFamily: 'Orbitron', fontSize: 8, cursor: 'pointer',
          letterSpacing: 1, transition: 'all 0.2s'
        }}>
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Camera view */}
      {enabled && (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <video
            ref={videoRef}
            style={{
              width: '100%', borderRadius: 6,
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
              border: '1px solid rgba(0,212,255,0.2)',
            }}
            muted playsInline
          />

          {/* Status badge */}
          <div style={{
            position: 'absolute', top: 6, left: 6,
            background: 'rgba(0,0,0,0.7)', borderRadius: 4,
            padding: '2px 7px', fontFamily: 'Share Tech Mono',
            fontSize: 9,
            color: status === 'active' ? '#00ff88' : status === 'loading' ? '#ffcc00' : '#ff4444'
          }}>
            {status === 'active' ? '● LIVE' : status === 'loading' ? '⟳ LOADING' : '✕ ERROR'}
          </div>

          {/* Camera label */}
          <div style={{
            position: 'absolute', top: 6, right: 6,
            background: 'rgba(0,0,0,0.7)', borderRadius: 4,
            padding: '2px 7px', fontFamily: 'Share Tech Mono',
            fontSize: 9, color: '#8888aa',
          }}>
            {facingMode === 'user' ? 'FRONT' : 'BACK'}
          </div>
        </div>
      )}

      {/* Buttons */}
      {enabled && (
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Switch camera */}
          <button
            onClick={switchCamera}
            title="Camera switch karo"
            style={{
              flex: 1,
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 6, padding: '7px 0',
              color: '#00d4ff', cursor: 'pointer',
              fontFamily: 'Orbitron', fontSize: 8,
              letterSpacing: 1, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.08)'}
          >
            🔄 SWITCH
          </button>

          {/* Send to AI */}
          <button
            onClick={captureAndSend}
            disabled={status !== 'active'}
            title="Yeh frame AI ko bhejo"
            style={{
              flex: 1,
              background: status === 'active' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${status === 'active' ? 'rgba(0,255,136,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 6, padding: '7px 0',
              color: status === 'active' ? '#00ff88' : '#555566',
              cursor: status === 'active' ? 'pointer' : 'not-allowed',
              fontFamily: 'Orbitron', fontSize: 8,
              letterSpacing: 1, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            }}
          >
            📤 SEND TO AI
          </button>
        </div>
      )}

      {!enabled && (
        <div style={{ color: '#444455', fontFamily: 'Share Tech Mono', fontSize: 9, textAlign: 'center', padding: '8px 0' }}>
          Camera ON karo — AI ko dikhao kya chahiye
        </div>
      )}
    </div>
  );
}
