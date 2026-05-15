import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function GlobalAlert() {
  const [alerts, setAlerts] = useState([]);
  const knownDevices = useRef(new Set());
  const scanInterval = useRef(null);

  useEffect(() => {
    // Initial scan — known devices set karo
    initialScan();
    // Har 20 sec mein scan
    scanInterval.current = setInterval(checkForNewDevices, 20000);
    return () => clearInterval(scanInterval.current);
  }, []);

  const initialScan = async () => {
    try {
      const res = await api.get('/network/scan');
      if (res.data.success) {
        res.data.devices.forEach(d => knownDevices.current.add(d.ip));
      }
    } catch {}
  };

  const checkForNewDevices = async () => {
    try {
      const res = await api.get('/network/scan');
      if (!res.data.success) return;
      res.data.devices.forEach(device => {
        if (!knownDevices.current.has(device.ip) && !device.isLocal) {
          // Naya unknown device!
          knownDevices.current.add(device.ip);
          addAlert({
            id: Date.now(),
            type: 'warning',
            title: '⚠️ UNKNOWN DEVICE DETECTED!',
            message: `Boss! Koi naya device connect hua!\nIP: ${device.ip}\n${device.vendor ? `Device: ${device.vendor}` : ''}`,
            icon: '🚨',
          });
          // Voice alert
          if (window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(`Boss! Ek unknown device network pe connect hua hai. IP address ${device.ip}`);
            u.lang = 'hi-IN'; u.rate = 1.1;
            window.speechSynthesis.speak(u);
          }
        }
      });
    } catch {}
  };

  const addAlert = (alert) => {
    setAlerts(prev => [...prev, alert]);
    // 8 sec baad auto remove
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== alert.id));
    }, 8000);
  };

  const removeAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  // Expose globally for other components
  useEffect(() => {
    window.zoricAlert = (msg, type = 'info') => {
      addAlert({ id: Date.now(), type, title: type === 'warning' ? '⚠️ ALERT' : '💬 ZORIC', message: msg, icon: type === 'warning' ? '🚨' : '⚡' });
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 60, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320 }}>
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              background: alert.type === 'warning' ? 'rgba(255,68,0,0.12)' : 'rgba(0,212,255,0.1)',
              border: `1px solid ${alert.type === 'warning' ? 'rgba(255,68,0,0.5)' : 'rgba(0,212,255,0.4)'}`,
              borderRadius: 12, padding: '12px 14px',
              backdropFilter: 'blur(10px)',
              boxShadow: alert.type === 'warning' ? '0 0 30px rgba(255,68,0,0.25)' : '0 0 20px rgba(0,212,255,0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              {/* Pulse icon */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <span style={{ fontSize: 20 }}>{alert.icon}</span>
                {alert.type === 'warning' && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{
                      position: 'absolute', inset: -4, borderRadius: '50%',
                      border: '1px solid rgba(255,68,0,0.5)',
                    }}
                  />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Orbitron', fontSize: 9,
                  color: alert.type === 'warning' ? '#ff4400' : '#00d4ff',
                  letterSpacing: 1, marginBottom: 4,
                }}>
                  {alert.title}
                </div>
                <div style={{
                  fontFamily: 'Share Tech Mono', fontSize: 10,
                  color: '#c0d0e0', lineHeight: 1.6, whiteSpace: 'pre-line',
                }}>
                  {alert.message}
                </div>
              </div>

              <button onClick={() => removeAlert(alert.id)} style={{
                background: 'none', border: 'none', color: '#555566',
                cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: 0,
              }}>✕</button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 8, ease: 'linear' }}
              style={{
                height: 2, marginTop: 8, borderRadius: 1,
                background: alert.type === 'warning' ? '#ff4400' : '#00d4ff',
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
