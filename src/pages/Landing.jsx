import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import '../styles/globals.css';

export default function Landing() {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    const dotCount = 500;
    const positions = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;
      positions[i * 3] = 1.5 * Math.cos(theta) * Math.sin(phi);
      positions[i * 3 + 1] = 1.5 * Math.sin(theta) * Math.sin(phi);
      positions[i * 3 + 2] = 1.5 * Math.cos(phi);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ size: 0.04, color: 0x00d4ff, transparent: true, opacity: 0.8 });
    const dots = new THREE.Points(geo, mat);
    scene.add(dots);

    // Rings
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(1.8 + i * 0.3, 1.82 + i * 0.3, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00d4ff : 0x7b2fff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + i * 0.3;
      scene.add(ring);
    }

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      dots.rotation.y += 0.004;
      dots.rotation.x += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => { cancelAnimationFrame(frame); renderer.dispose(); window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div className="grid-bg" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 16, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 24px', zIndex: 10 }}>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#00d4ff', letterSpacing: 2 }}>SYSTEM STATUS: <span style={{ color: '#00ff88' }}>ACTIVE</span> // ENCRYPTION: <span style={{ color: '#00ff88' }}>SECURE</span></span>
        <span style={{ fontFamily: 'Share Tech Mono', fontSize: 10, color: '#8888aa', letterSpacing: 2 }}>10101</span>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <h1 className="font-orbitron" style={{
          fontSize: 72, fontWeight: 900, letterSpacing: 16,
          color: '#00d4ff',
          textShadow: '0 0 40px #00d4ff, 0 0 80px rgba(0,212,255,0.4)',
          position: 'relative'
        }}>
          ⌊ZORIC⌉
        </h1>

        <p style={{ fontFamily: 'Rajdhani', fontSize: 18, color: '#e0e0e0', letterSpacing: 4, fontWeight: 700 }}>
          ADVANCED AI ASSISTANT: DECODE. EXECUTE. COMMAND.
        </p>

        <div style={{
          marginTop: 24,
          background: 'rgba(10,10,20,0.7)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 8,
          padding: '8px 20px',
          display: 'flex', gap: 20
        }}>
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa' }}>// SESSION INITIALIZED</span>
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: 11, color: '#8888aa' }}>// MODEL: ZORIC V4.2</span>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="btn btn-cyan"
          style={{ marginTop: 24, fontSize: 14, padding: '14px 48px', letterSpacing: 4 }}
        >
          GET STARTED
        </button>
      </div>

      {/* Bottom */}
      <div style={{ position: 'absolute', bottom: 16, right: 24, zIndex: 10 }}>
        <span style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#8888aa' }}>MODEL: ZORIC V4.2 ✦</span>
      </div>
    </div>
  );
}
