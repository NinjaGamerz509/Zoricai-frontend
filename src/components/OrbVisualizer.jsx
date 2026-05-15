import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import useStore from '../context/store';
import '../styles/orb.css';

export default function OrbVisualizer({ voiceLevel = 0, emotion = 'neutral' }) {
  const canvasRef = useRef(null);
  const orbState = useStore(s => s.orbState);
  const sceneRef = useRef({});
  const voiceLevelRef = useRef(0);
  const emotionRef = useRef('neutral');

  useEffect(() => { voiceLevelRef.current = voiceLevel; }, [voiceLevel]);
  useEffect(() => { emotionRef.current = emotion; }, [emotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(200, 200);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2.8;

    // ── Main dot sphere ──────────────────────────────────────────
    const dotCount = 400;
    const positions = new Float32Array(dotCount * 3);
    const originalPositions = new Float32Array(dotCount * 3);
    const colors = new Float32Array(dotCount * 3);
    const baseRadius = 1;

    for (let i = 0; i < dotCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotCount);
      const theta = Math.sqrt(dotCount * Math.PI) * phi;
      const x = baseRadius * Math.cos(theta) * Math.sin(phi);
      const y = baseRadius * Math.sin(theta) * Math.sin(phi);
      const z = baseRadius * Math.cos(phi);
      positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = z;
      originalPositions[i * 3] = x; originalPositions[i * 3 + 1] = y; originalPositions[i * 3 + 2] = z;
      colors[i * 3] = 0; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.9 });
    const dots = new THREE.Points(geometry, material);
    scene.add(dots);

    // ── Inner glow sphere ────────────────────────────────────────
    const glowGeo = new THREE.SphereGeometry(0.55, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.05, wireframe: false });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // ── Ring ─────────────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(1.2, 0.01, 8, 60);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.2 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 4;
    scene.add(ring);

    // ── Outer ring ───────────────────────────────────────────────
    const ring2Geo = new THREE.TorusGeometry(1.35, 0.008, 8, 60);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x7b2fff, transparent: true, opacity: 0.15 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 6;
    ring2.rotation.z = Math.PI / 4;
    scene.add(ring2);

    sceneRef.current = { dots, glow, material, glowMat, positions, originalPositions, ring, ring2, ringMat, ring2Mat };

    // ── Emotion colors ───────────────────────────────────────────
    const emotionColors = {
      neutral: new THREE.Color(0x00d4ff),
      happy: new THREE.Color(0x00ff88),
      sad: new THREE.Color(0x4466ff),
      frustrated: new THREE.Color(0xff4444),
      focused: new THREE.Color(0xffaa00),
      excited: new THREE.Color(0xff00ff),
    };

    let frame;
    let time = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      time += 0.01;
      const state = useStore.getState().orbState;
      const voice = voiceLevelRef.current;
      const emo = emotionRef.current;
      const emoColor = emotionColors[emo] || emotionColors.neutral;

      // Voice level → orb pulse
      const voicePulse = voice * 0.4;
      const posAttr = geometry.getAttribute('position');

      for (let i = 0; i < dotCount; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        let noise = 0;
        if (state === 'listening' || state === 'speaking') {
          noise = Math.sin(ox * 3 + time * 4) * 0.05 + voicePulse * Math.sin(i + time * 8) * 0.15;
        } else if (state === 'thinking') {
          noise = Math.sin(ox * 5 + time * 6) * 0.08;
        }

        posAttr.setXYZ(i, ox * (1 + noise), oy * (1 + noise), oz * (1 + noise));
      }
      posAttr.needsUpdate = true;

      // State behaviors
      if (state === 'idle') {
        dots.rotation.y += 0.003;
        dots.rotation.x += 0.001;
        material.opacity = 0.5 + Math.sin(time) * 0.15;
        material.size = 0.045;
        glowMat.opacity = 0.03 + Math.sin(time) * 0.02;
        material.color = emoColor;
        ring.rotation.z += 0.003;
        ring2.rotation.z -= 0.002;
        ringMat.opacity = 0.15;

      } else if (state === 'listening') {
        dots.rotation.y += 0.012;
        material.opacity = 0.9;
        material.size = 0.055 + voicePulse * 0.04;
        glowMat.opacity = 0.12 + voicePulse * 0.15;
        material.color = new THREE.Color(0x00d4ff);
        ring.rotation.z += 0.015;
        ring2.rotation.z -= 0.01;
        ringMat.opacity = 0.4 + Math.sin(time * 5) * 0.2;

      } else if (state === 'thinking') {
        dots.rotation.y += 0.025;
        dots.rotation.z += 0.012;
        material.opacity = 0.8;
        material.size = 0.05;
        const t = time * 3;
        material.color = new THREE.Color(Math.sin(t)*0.3+0.3, 0.1, 1);
        glowMat.opacity = 0.1;
        ring.rotation.z += 0.04;
        ring2.rotation.z -= 0.035;
        ringMat.opacity = 0.5;
        ring2Mat.opacity = 0.4;

      } else if (state === 'speaking') {
        dots.rotation.y += 0.018;
        material.opacity = 1;
        material.size = 0.05 + Math.sin(time * 10) * 0.025 + voicePulse * 0.03;
        glowMat.opacity = 0.18 + Math.abs(Math.sin(time * 8)) * 0.12;
        material.color = emoColor;
        ring.rotation.z += 0.02;
        ring2.rotation.z -= 0.015;
        ringMat.opacity = 0.6 + Math.sin(time * 6) * 0.2;
      }

      // Scale glow with voice
      const glowScale = 1 + voicePulse * 0.3;
      glow.scale.set(glowScale, glowScale, glowScale);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
    };
  }, []);

  const stateLabels = {
    idle: { text: 'STANDBY', color: '#8888aa' },
    listening: { text: 'LISTENING...', color: '#00d4ff' },
    thinking: { text: 'PROCESSING...', color: '#7b2fff' },
    speaking: { text: 'SPEAKING...', color: '#00d4ff' },
  };

  const emotionEmoji = {
    neutral: '',
    happy: '😊',
    sad: '😔',
    frustrated: '😤',
    focused: '🎯',
    excited: '🔥',
  };

  return (
    <div className="orb-container">
      <canvas ref={canvasRef} width={200} height={200} />
      <div className="orb-state-label">
        <span style={{
          color: stateLabels[orbState]?.color || '#8888aa',
          fontSize: 11, fontFamily: 'Share Tech Mono', letterSpacing: 2,
        }}>
          {stateLabels[orbState]?.text || 'STANDBY'}
          {emotionEmoji[emotion] && ` ${emotionEmoji[emotion]}`}
        </span>
      </div>
    </div>
  );
}
