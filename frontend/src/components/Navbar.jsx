import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Menu,
  X,
  CheckSquare,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Home,
  Clock,
  Calendar,
  Search,
} from 'lucide-react';
import { useToast } from './Toast';
import { useLiveClock } from '../utils/useLiveClock';
import { setGlobalSoundEnabled, playSuccessSound, getAudioContext } from '../utils/effects';

export default function Navbar({
  user,
  onLogout,
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  currentRoute = 'landing',
  onNavigate,
  onOpenCommandPalette,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { addToast } = useToast();
  const liveClock = useLiveClock();

  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    addToast({
      type: 'info',
      title: 'Theme Updated',
      message: nextMode ? 'Switched to Dark Mode 🌙' : 'Switched to Light Mode ☀️',
    });
  };

  const handleToggleSound = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    setGlobalSoundEnabled(nextSound);

    // If turning ON, wake up Web Audio API and trigger cheerful confirmation chime
    if (nextSound) {
      try {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().then(() => playSuccessSound()).catch(() => {});
        } else {
          playSuccessSound();
        }
      } catch {}
    }

    addToast({
      type: 'info',
      title: 'Sound Feedback',
      message: nextSound ? 'Audio chimes turned ON 🔔' : 'Audio chimes muted 🔕',
    });
  };

  const handleLogoutClick = () => {
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been signed out safely. Come back soon! 👋',
    });
    onLogout();
  };

  const handleNav = (route, mode = 'login') => {
    if (onNavigate) onNavigate(route, mode);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);

    const performScroll = (retry = 0) => {
      // Map aliases so both singular ('workflow') and plural ('workflows') work seamlessly
      const targetId = sectionId === 'workflows' ? 'workflow' : sectionId;
      const el = document.getElementById(targetId) || document.getElementById(sectionId);

      if (el) {
        // Sticky navbar height is 64px (h-16). Offset by 80px so title has clear headroom
        const navOffset = 80;
        const rect = el.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetTop = rect.top + scrollTop - navOffset;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });

        // Complementary fallback for mobile webviews
        try {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch {}
      } else if (retry < 10) {
        setTimeout(() => performScroll(retry + 1), 60);
      }
    };

    if (currentRoute !== 'landing') {
      if (onNavigate) onNavigate('landing');
      setTimeout(() => performScroll(), 320);
    } else {
      // Delay allows the mobile drawer collapse animation to begin without distorting scroll coordinates
      setTimeout(() => performScroll(), 120);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/70 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo with 3D glowing badge */}
        <motion.div
          onClick={() => handleNav('landing')}
          className="flex items-center gap-3 cursor-pointer select-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.3 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-3d-glow text-white"
            >
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
              TaskBoard
            </span>
          </div>
        </motion.div>

        {/* Center Navigation Links (Available for both landing and logged-in states) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl glass-panel border border-slate-200/60 dark:border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleNav('landing')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              currentRoute === 'landing'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            Features
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('workflow')}
            className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
          >
            Workflow
          </button>

          {user && (
            <button
              type="button"
              onClick={() => handleNav('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                currentRoute === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-3d-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          )}
        </nav>

        {/* Desktop Controls & Auth Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Command Palette Quick Launcher */}
          {user && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenCommandPalette}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              title="Open Command Palette (Ctrl+K or ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-medium">Commands</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold">
                ⌘K
              </span>
            </motion.button>
          )}

          {/* Sound Toggle */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleToggleSound}
            title={soundEnabled ? 'Disable Chimes' : 'Enable Chimes'}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-500" />
            ) : (
              <VolumeX className="w-4 h-4 opacity-50" />
            )}
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            <motion.div
              key={darkMode ? 'dark' : 'light'}
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.2 }}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </motion.div>
          </motion.button>

          {/* If Logged In: Dynamic Live Clock + User Welcome info and Logout */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              {/* Dynamic live clock & date badge in navbar */}
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span className="font-mono font-bold tracking-tight text-slate-700 dark:text-slate-200">
                  {liveClock.timeString}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">{liveClock.shortDateString}</span>
              </div>

              {/* Personalized Welcome User Name with active beacon */}
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  Welcome, <span className="text-indigo-600 dark:text-indigo-400">{user.name}</span> 👋
                </span>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleLogoutClick}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </motion.button>
            </div>
          ) : (
            /* If Logged Out: Sign In & Get Started CTAs */
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleNav('auth', 'login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Sign In
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleNav('auth', 'signup')}
                className="px-4 py-1.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-3d-btn active:scale-95 transition-all flex items-center gap-1"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.1 }}
            className="sm:hidden px-4 pt-3 pb-6 space-y-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden"
          >
            {/* If Logged In: Welcome Banner with Dynamic Live Clock */}
            {user && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-indigo-500/5 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {liveClock.greeting}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white">
                  Welcome, {user.name}! 👋
                </p>
                <div className="pt-2 border-t border-indigo-500/15 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    {liveClock.shortDateString}
                  </span>
                  <span className="flex items-center gap-1 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-3.5 h-3.5" />
                    {liveClock.timeString}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-1 py-1">
              <button
                onClick={() => handleNav('landing')}
                className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Home
              </button>

              <button
                onClick={() => scrollToSection('features')}
                className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection('workflow')}
                className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Workflow
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => handleNav('dashboard')}
                    className="w-full text-left py-2 px-3 rounded-xl font-extrabold text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Workspace Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenCommandPalette) onOpenCommandPalette();
                    }}
                    className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-500" />
                      Command Palette
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border">
                      ⌘K
                    </span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleNav('auth', 'login')}
                    className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav('auth', 'signup')}
                    className="w-full text-left py-2 px-3 rounded-xl font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                  >
                    Create Free Account
                  </button>
                </div>
              )}
            </div>

            {user && (
              <div className="py-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {user.name} ({user.email})
                </p>
              </div>
            )}

            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-300">Sound feedback</span>
              <button
                onClick={handleToggleSound}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                ) : (
                  <VolumeX className="w-4 h-4 opacity-50" />
                )}
              </button>
            </div>

            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogoutClick();
                }}
                className="w-full py-2.5 rounded-xl font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            ) : (
              <button
                onClick={() => handleNav('auth', 'signup')}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center gap-2 shadow-3d-btn"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
