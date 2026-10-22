import React, { useState } from 'react';
import { LogOut, Sun, Moon, Volume2, VolumeX, Menu, X, CheckSquare, Sparkles } from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/70 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo with 3D glowing badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-3d-glow text-white transform group-hover:rotate-6 transition-transform duration-300">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
            TaskBoard
          </span>
        </div>

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Disable Chimes' : 'Enable Chimes'}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 opacity-50" />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* User info */}
          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Hi, {user.name}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-2 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          {user && (
            <div className="py-2">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {user.name} ({user.email})
              </p>
            </div>
          )}

          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300">Sound feedback</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 opacity-50" />}
            </button>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onLogout();
            }}
            className="w-full py-2.5 rounded-xl font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </header>
  );
}
