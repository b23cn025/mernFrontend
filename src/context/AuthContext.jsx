import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

// Inactivity timeout: 15 minutes (in milliseconds)
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fp_token') || null);
  const [loading, setLoading] = useState(true);
  
  // Inactivity tracking
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
      setupInactivityListener();
    } else {
      setLoading(false);
    }

    return () => {
      clearInactivityTimers();
    };
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Setup inactivity tracking
  const setupInactivityListener = () => {
    const resetInactivityTimer = () => {
      clearInactivityTimers();
      setShowInactivityWarning(false);

      // Set warning timer (13 minutes)
      warningTimerRef.current = setTimeout(() => {
        setShowInactivityWarning(true);
      }, INACTIVITY_TIMEOUT - 120000);

      // Set logout timer (15 minutes)
      inactivityTimerRef.current = setTimeout(() => {
        handleInactivityLogout();
      }, INACTIVITY_TIMEOUT);
    };

    // Events that reset inactivity timer
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    // Initial timer
    resetInactivityTimer();

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  };

  const clearInactivityTimers = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  };

  const handleInactivityLogout = () => {
    setShowInactivityWarning(false);
    logout();
    alert('🔒 Your session has expired due to inactivity. Please log in again.');
    window.location.href = '/login';
  };

  const dismissWarning = () => {
    setShowInactivityWarning(false);
  };

  const login = (userData, tokenData) => {
    setToken(tokenData);
    setUser(userData);
    localStorage.setItem('fp_token', tokenData);
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
  };

  const logout = () => {
    clearInactivityTimers();
    setToken(null);
    setUser(null);
    localStorage.removeItem('fp_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data);
    } catch {}
  };

  // Inactivity Warning Component
  const InactivityWarning = () => {
    if (!showInactivityWarning) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #FF6584, #FF8787)',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(255,101,132,0.3)',
        maxWidth: '300px',
        fontSize: '14px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>⏱️ Session Timeout Warning</p>
        <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>You will be logged out in 2 minutes due to inactivity.</p>
        <button
          onClick={dismissWarning}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
          Dismiss
        </button>
      </div>
    );
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser, InactivityWarning }}>
      <InactivityWarning />
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
