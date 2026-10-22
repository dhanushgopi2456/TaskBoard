import React, { useState, useEffect } from 'react';
import ThreeBackground from './components/ThreeBackground';
import Navbar from './components/Navbar';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { apiFetch } from './api';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('taskboard_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('taskboard_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('taskboard_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark 3D theme
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('taskboard_sound');
    return saved !== null ? saved === 'true' : true;
  });

  // Apply dark mode class to root document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskboard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskboard_theme', 'light');
    }
  }, [darkMode]);

  // Save sound setting
  useEffect(() => {
    localStorage.setItem('taskboard_sound', soundEnabled.toString());
  }, [soundEnabled]);

  // Verify token on mount
  useEffect(() => {
    if (!token) return;

    apiFetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Token expired or invalid');
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        localStorage.setItem('taskboard_user', JSON.stringify(data.user));
      })
      .catch(() => {
        // Log out on invalid token
        handleLogout();
      });
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('taskboard_token', newToken);
    localStorage.setItem('taskboard_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('taskboard_token');
    localStorage.removeItem('taskboard_user');
  };

  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* 3D WebGL Three.js Particle / Geometry Background */}
      <ThreeBackground darkMode={darkMode} />

      {/* Persistent Navigation Bar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {token && user ? (
          <Dashboard
            token={token}
            user={user}
            soundEnabled={soundEnabled}
          />
        ) : (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      {/* Subtle Footer with live status indicator */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/40 dark:border-slate-800/40">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>TaskBoard 3D System Online</span>
          <span>•</span>
          <span>API Connected</span>
        </div>
      </footer>
    </div>
  );
}
