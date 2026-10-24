import React, { useState, useEffect } from 'react';
import { MotionConfig, AnimatePresence, motion } from 'motion/react';
import ThreeBackground from './components/ThreeBackground';
import AnimatedCursor from './components/AnimatedCursor';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import { ToastProvider } from './components/Toast';
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

  // Current Route: 'landing' | 'auth' | 'dashboard'
  const [currentRoute, setCurrentRoute] = useState(() => {
    return localStorage.getItem('taskboard_token') ? 'dashboard' : 'landing';
  });

  const [autoDemo, setAutoDemo] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

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
        handleLogout();
      });
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('taskboard_token', newToken);
    localStorage.setItem('taskboard_user', JSON.stringify(newUser));
    setCurrentRoute('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('taskboard_token');
    localStorage.removeItem('taskboard_user');
    setCurrentRoute('landing');
  };

  const handleExploreDemo = () => {
    if (token && user) {
      setCurrentRoute('dashboard');
      return;
    }
    setAutoDemo(true);
    setAuthMode('login');
    setCurrentRoute('auth');
  };

  const handleGetStarted = (mode = 'signup') => {
    if (token && user) {
      setCurrentRoute('dashboard');
      return;
    }
    setAutoDemo(false);
    setAuthMode(mode === 'login' ? 'login' : 'signup');
    setCurrentRoute('auth');
  };

  // If user is already authenticated, redirect away from the auth view
  useEffect(() => {
    if (token && user && currentRoute === 'auth') {
      setCurrentRoute('dashboard');
    }
  }, [token, user, currentRoute]);

  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider soundEnabled={soundEnabled}>
        <div className="relative min-h-screen text-slate-800 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-500">
          {/* Custom Animated Cursor (Adaptive: desktop fluid tracking + mobile tap ripples) */}
          <AnimatedCursor />

          {/* Subtle Ambient Aurora Light Glows */}
          <div className="ambient-glow-orb w-[500px] h-[500px] bg-indigo-500/30 -top-32 -left-32 pointer-events-none" />
          <div className="ambient-glow-orb w-[600px] h-[600px] bg-purple-500/20 top-1/3 -right-48 pointer-events-none" />
          <div className="ambient-glow-orb w-[450px] h-[450px] bg-emerald-500/15 -bottom-20 left-1/4 pointer-events-none" />

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
            currentRoute={currentRoute}
            onNavigate={(route, mode = 'login') => {
              if (route === 'auth') {
                if (token && user) {
                  setCurrentRoute('dashboard');
                  return;
                }
                setAutoDemo(false);
                setAuthMode(mode);
              }
              setCurrentRoute(route);
            }}
            onOpenCommandPalette={() => {
              if (currentRoute !== 'dashboard' && user) {
                setCurrentRoute('dashboard');
              }
              window.dispatchEvent(new CustomEvent('open-command-palette'));
            }}
          />

          {/* Main Content Area with Smooth Page Transitions */}
          <main className="relative z-10 flex-1">
            <AnimatePresence mode="wait">
              {currentRoute === 'landing' ? (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.1 }}
                >
                  <LandingPage
                    onGetStarted={handleGetStarted}
                    onExploreDemo={handleExploreDemo}
                    soundEnabled={soundEnabled}
                    user={user}
                  />
                </motion.div>
              ) : (!token || !user) ? (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -15 }}
                  transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.1 }}
                >
                  <AuthScreen
                    onLoginSuccess={handleLoginSuccess}
                    onBackToHome={() => setCurrentRoute('landing')}
                    autoDemo={autoDemo}
                    initialMode={authMode}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.1 }}
                >
                  <Dashboard
                    token={token}
                    user={user}
                    soundEnabled={soundEnabled}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Subtle Footer with live status indicator */}
          <footer className="relative z-10 py-6 px-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">TaskBoard 3D Spatial Workspace</span>
                <span>•</span>
                <span className="font-mono text-[11px] opacity-75">Motion Powered</span>
              </div>

              {/* Navigation links in footer */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setCurrentRoute('landing')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Home
                </button>
                {token && user ? (
                  <button
                    type="button"
                    onClick={() => setCurrentRoute('dashboard')}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-bold text-indigo-500"
                  >
                    My Workspace
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAutoDemo(false);
                      setCurrentRoute('auth');
                    }}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Sign In
                  </button>
                )}
                <span>© {new Date().getFullYear()} TaskBoard</span>
              </div>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </MotionConfig>
  );
}
