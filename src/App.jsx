import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tasks from './pages/Tasks.jsx';
import Logs from './pages/Logs.jsx';
import Analytics from './pages/Analytics.jsx';
import Settings from './pages/Settings.jsx';
import Browser from './pages/Browser.jsx';
import Sentinel from './pages/Sentinel.jsx';
import Personal from './pages/Personal.jsx';

const ProtectedRoute = ({ children }) => {
  const { token } = useStore();
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { token, loadToken } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken().finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#050510',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#00d4ff', fontFamily: 'monospace', fontSize: 18, letterSpacing: 4,
    }}>
      INITIALIZING ZORIC...
    </div>
  );

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/browser" element={<ProtectedRoute><Browser /></ProtectedRoute>} />
        <Route path="/sentinel" element={<ProtectedRoute><Sentinel /></ProtectedRoute>} />
        <Route path="/personal" element={<ProtectedRoute><Personal /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </HashRouter>
  );
}
