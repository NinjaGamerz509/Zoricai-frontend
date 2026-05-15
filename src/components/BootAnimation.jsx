import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_STEPS = [
  { text: 'INITIALIZING CORE SYSTEMS...', duration: 400 },
  { text: 'LOADING NEURAL NETWORK...', duration: 500 },
  { text: 'CONNECTING TO MEMORY DATABASE...', duration: 600 },
  { text: 'SPEECH RECOGNITION — ONLINE', duration: 300, status: 'ok' },
  { text: 'MEMORY SYSTEM — ONLINE', duration: 300, status: 'ok' },
  { text: 'NETWORK MONITOR — ONLINE', duration: 300, status: 'ok' },
  { text: 'SENTINEL SECURITY — ONLINE', duration: 300, status: 'ok' },
  { text: 'PLAYLIST ENGINE — ONLINE', duration: 300, status: 'ok' },
  { text: 'AI BROWSER — ONLINE', duration: 300, status: 'ok' },
  { text: 'PERSONALITY MODULE — ONLINE', duration: 400, status: 'ok' },
  { text: 'CALIBRATING VOICE RECOGNITION...', duration: 500 },
  { text: 'LOADING USER PROFILE...', duration: 400 },
  { text: 'ALL SYSTEMS NOMINAL', duration: 300, status: 'ok' },
  { text: 'WELCOME BACK, BOSS.', duration: 800, final: true },
];

export default function BootAnimation({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [done, setDone] = useState(false);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    // Check if already booted this session
    if (sessionStorage.getItem('zoric_booted')) {
      onComplete();
      return;
    }

    let stepIndex = 0;
    let totalProgress = 0;
    const progressPerStep = 100 / BOOT_STEPS.length;

    const runStep = () => {
      if (stepIndex >= BOOT_STEPS.length) {
        setTimeout(() => {
          setDone(true);
          sessionStorage.setItem('zoric_booted', '1');
          setTimeout(onComplete, 800);
        }, 300);
        return;
      }

      const step = BOOT_STEPS[stepIndex];
      setCurrentStep(stepIndex);

      // Random glitch effect
      if (Math.random() > 0.7) {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 100);
      }

      setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex]);
        totalProgress = Math.min(100, totalProgress + progressPerStep);
        setProgress(Math.round(totalProgress));
        stepIndex++;
        runStep();
      }, step.duration);
    };

    setTimeout(runStep, 300);
  }, []);

  if (done) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: '#020205',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Share Tech Mono, monospace',
        }}
      >
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Scanline effect */}
        <motion.div
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', left: 0, right: 0,
            height: 2, background: 'rgba(0,212,255,0.08)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, width: '90%', maxWidth: 600 }}>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 40 }}
          >
            <motion.h1
              animate={glitching ? {
                x: [0, -3, 3, 0],
                textShadow: ['0 0 20px rgba(0,212,255,0.8)', '0 0 40px rgba(255,0,0,0.8)', '0 0 20px rgba(0,212,255,0.8)'],
              } : {}}
              style={{
                fontFamily: 'Orbitron, monospace',
                fontSize: 42, fontWeight: 900,
                color: '#00d4ff', margin: 0,
                textShadow: '0 0 30px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.3)',
                letterSpacing: 8,
              }}
            >
              ZORIC
            </motion.h1>
            <div style={{ color: '#555566', fontSize: 11, letterSpacing: 4, marginTop: 6 }}>
              ADVANCED AI ASSISTANT v2.0
            </div>
          </motion.div>

          {/* Boot log */}
          <div style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(0,212,255,0.15)',
            borderRadius: 8, padding: '16px 20px',
            marginBottom: 24, minHeight: 200,
            maxHeight: 200, overflowY: 'hidden',
          }}>
            {BOOT_STEPS.slice(0, currentStep + 1).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 4,
                  color: step.final ? '#00d4ff' : step.status === 'ok' ? '#00ff88' : '#8888aa',
                  fontSize: step.final ? 13 : 11,
                  fontWeight: step.final ? 700 : 400,
                }}
              >
                <span style={{ flexShrink: 0, color: step.status === 'ok' ? '#00ff88' : step.final ? '#00d4ff' : '#555566' }}>
                  {step.status === 'ok' ? '✓' : step.final ? '►' : '·'}
                </span>
                {step.text}
                {i === currentStep && !completedSteps.includes(i) && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    style={{ color: '#00d4ff' }}
                  >▌</motion.span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#555566', fontSize: 10, letterSpacing: 2 }}>SYSTEM BOOT PROGRESS</span>
              <span style={{ color: '#00d4ff', fontSize: 10 }}>{progress}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(0,212,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                style={{
                  height: '100%', borderRadius: 2,
                  background: 'linear-gradient(90deg, #00d4ff, #7b2fff)',
                  boxShadow: '0 0 10px rgba(0,212,255,0.5)',
                }}
              />
            </div>
          </div>

          {/* Status dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            {[0,1,2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff' }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
