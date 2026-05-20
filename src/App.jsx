import { useState } from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Tasks from './pages/Tasks';
import Logs from './pages/Logs';
import Analytics from './pages/Analytics';
import { Journal, Habits, Expenses } from './pages/PersonalPages';
import BrowserPage from './pages/Browser';
import Sentinel from './pages/Sentinel';
import BootAnimation from './components/BootAnimation';
import GlobalAlert from './components/GlobalAlert';
import useStore from './context/store';
import './styles/globals.css';

const ProtectedRoute = ({ children }) => {
  const { token } = useStore();
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  const [booted, setBooted] = useState(false);
  const { token } = useStore();

  // Show boot animation only if logged in
  if (token && !booted) {
    return <BootAnimation onComplete={() => setBooted(true)} />;
  }

  return (
    <BrowserRouter>
      <GlobalAlert />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
        <Route path="/browser" element={<ProtectedRoute><BrowserPage /></ProtectedRoute>} />
        <Route path="/sentinel" element={<ProtectedRoute><Sentinel /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
        <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
