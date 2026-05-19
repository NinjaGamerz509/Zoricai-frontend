import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import useStore from '../context/store';

export default function GlobalAlert() {
  const [alerts, setAlerts] = useState([]);
  const knownDevices = useRef(new Set());
  const scanInterval = useRef(null);
  const { token } = useStore();

  useEffect(() => {
    if (!token) return;
    initialScan();
    scanInterval.current = setInterval(checkForNewDevices, 20000);
    return () => clearInterval(scanInterval.current);
  }, [token]);

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
          knownDevices.current.add(device.ip);
          addAlert({
            id: Date.now(),
            type: 'warning',
            title: '⚠️ UNKNOWN DEVICE DETECTED!',
            message: `Boss! Koi naya device connect hua!\nIP: ${device.ip}\n${device.vendor ? `Device: ${device.vendor}` : ''}`,
            icon: '🚨',
          });
        }
      });
    } catch {}
  };

  const addAlert = (alert) => {
    setAlerts(prev => [...prev, alert]);
    setTimeout(() => removeAlert(alert.id), 10000);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            onClick={() => removeAlert(alert.id)}
            style={{
              background: 'rgba(0,0,0,0.9)',
              border: '1px solid #ff4444',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#fff',
              cursor: 'pointer',
              maxWidth: 300,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{alert.title}</div>
            <div style={{ fontSize: 12, whiteSpace: 'pre-line' }}>{alert.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
