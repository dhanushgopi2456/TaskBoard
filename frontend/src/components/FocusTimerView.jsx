import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  Coffee,
  Brain,
  FastForward,
  Settings,
  X,
  Volume2,
  Check,
  Target
} from 'lucide-react';
import Card3D from './Card3D';
import { playSuccessSound, triggerConfetti, playPopSound } from '../utils/effects';
import { apiFetch } from '../api';

export default function FocusTimerView({ tasks = [], onToggleComplete, soundEnabled = true, token = null }) {
  // Load configurable durations from localStorage or defaults
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('taskboard_pomodoro_settings');
      return saved ? JSON.parse(saved) : { work: 25, short_break: 5, long_break: 15 };
    } catch {
      return { work: 25, short_break: 5, long_break: 15 };
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const [mode, setMode] = useState('work'); // 'work' | 'short_break' | 'long_break'
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  // Persisted backend focus stats
  const [focusStats, setFocusStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    todayMinutes: 0,
    todaySessions: 0,
  });

  const timerRef = useRef(null);

  // Fetch real persisted focus statistics on mount
  useEffect(() => {
    if (!token) return;
    apiFetch('/api/focus/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setFocusStats({
            totalSessions: data.totalSessions || 0,
            totalMinutes: data.totalMinutes || 0,
            todayMinutes: data.todayMinutes || 0,
            todaySessions: data.todaySessions || 0,
          });
        }
      })
      .catch((err) => console.error('Failed to load focus stats:', err));
  }, [token]);

  // Request browser notification permission upon initial interaction
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  };

  const getDurationForMode = (m, cfg = settings) => {
    return (cfg[m] || 25) * 60;
  };

  const handleModeSwitch = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
    if (soundEnabled) playPopSound();
  };

  // Timer countdown interval with drift prevention
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // When timer hits 0: Finish session, persist, notify, and transition
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (soundEnabled) playSuccessSound();
      triggerConfetti();

      if (mode === 'work') {
        const completedMinutes = settings.work;
        // Persist session to backend API
        if (token) {
          apiFetch('/api/focus/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              durationMinutes: completedMinutes,
              taskId: selectedTaskId || null,
              mode: 'focus',
            }),
          })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
              if (data) {
                setFocusStats((prev) => ({
                  totalSessions: prev.totalSessions + 1,
                  totalMinutes: prev.totalMinutes + completedMinutes,
                  todayMinutes: prev.todayMinutes + completedMinutes,
                  todaySessions: prev.todaySessions + 1,
                }));
              }
            })
            .catch((err) => console.error('Failed to persist focus session:', err));
        } else {
          setFocusStats((prev) => ({
            ...prev,
            totalSessions: prev.totalSessions + 1,
            totalMinutes: prev.totalMinutes + completedMinutes,
          }));
        }

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Focus Sprint Finished! 🏆', {
            body: `Outstanding! You completed a ${completedMinutes}-minute deep work sprint. Time for a well-deserved break!`,
            icon: '/favicon.ico',
          });
        }

        // Auto-switch to break
        setMode('short_break');
        setTimeLeft(getDurationForMode('short_break'));
      } else {
        // Break finished notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Break Complete ⚡', {
            body: 'Break is over. Ready to conquer your next mission?',
            icon: '/favicon.ico',
          });
        }
        setMode('work');
        setTimeLeft(getDurationForMode('work'));
      }
    }
  }, [timeLeft, isRunning, mode, settings, selectedTaskId, soundEnabled, token]);

  const toggleStartPause = () => {
    requestNotificationPermission();
    setIsRunning(!isRunning);
    if (soundEnabled) playPopSound();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
    if (soundEnabled) playPopSound();
  };

  const skipBreak = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(getDurationForMode('work'));
    if (soundEnabled) playPopSound();
  };

  const handleSaveSettings = () => {
    const valid = {
      work: Math.max(1, Math.min(120, Number(tempSettings.work) || 25)),
      short_break: Math.max(1, Math.min(30, Number(tempSettings.short_break) || 5)),
      long_break: Math.max(1, Math.min(60, Number(tempSettings.long_break) || 15)),
    };
    setSettings(valid);
    localStorage.setItem('taskboard_pomodoro_settings', JSON.stringify(valid));
    setTimeLeft(getDurationForMode(mode, valid));
    setIsRunning(false);
    setIsSettingsOpen(false);
    if (soundEnabled) playSuccessSound();
  };

  // Format time (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentDuration = getDurationForMode(mode);
  const progressRatio = currentDuration > 0 ? (currentDuration - timeLeft) / currentDuration : 0;

  // SVG Gauge calculations
  const radius = 95;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const pendingTasks = tasks.filter((t) => !t.completed);
  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner with Real Persisted Metrics */}
      <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Deep Work Engine
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Focus Pomodoro Session
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Execute high-impact missions with calibrated interval timing and automatic session logging.
          </p>
        </div>

        {/* Sessions Completed Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-panel border border-amber-500/30">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Sprints</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {focusStats.totalSessions} Sessions ({focusStats.totalMinutes}m)
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.08, rotate: 30 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              setTempSettings(settings);
              setIsSettingsOpen(true);
            }}
            title="Configure Durations"
            className="p-3 rounded-2xl glass-panel text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Main Focus Center */}
      <Card3D
        maxTilt={3}
        glowColor="rgba(99, 102, 241, 0.2)"
        className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center flex flex-col items-center justify-center relative overflow-hidden"
      >
        {/* Mode Selector Tabs */}
        <div className="relative flex p-1 mb-8 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-sm w-full">
          {[
            { id: 'work', label: `${settings.work}m Focus`, icon: Brain },
            { id: 'short_break', label: `${settings.short_break}m Break`, icon: Coffee },
            { id: 'long_break', label: `${settings.long_break}m Reset`, icon: Sparkles },
          ].map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeSwitch(m.id)}
                className={`relative flex-1 py-1.5 text-xs font-bold rounded-xl transition-colors duration-150 z-10 flex items-center justify-center gap-1 ${
                  isSelected
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="focusTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl shadow-3d-sm z-0"
                    transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.15 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Circular SVG Gauge & Time Display */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
            {/* Background Track */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth={stroke}
              fill="transparent"
            />
            {/* Animated Progress Arc */}
            <motion.circle
              cx="120"
              cy="120"
              r={radius}
              stroke="url(#focusGradient)"
              strokeWidth={stroke}
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'linear' }}
              strokeLinecap="round"
              fill="transparent"
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {timeFormatted}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
              {isRunning
                ? mode === 'work'
                  ? '⚡ Deep Work in Progress'
                  : '☕ Recharging...'
                : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls: Play/Pause, Reset, and Skip Break */}
        <div className="flex items-center gap-3.5 mb-8 flex-wrap justify-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={toggleStartPause}
            className={`px-8 py-3.5 rounded-2xl font-black text-white text-sm flex items-center gap-2 shadow-3d-btn transition-all ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{timeLeft < getDurationForMode(mode) ? 'Resume' : 'Start Focus'}</span>
              </>
            )}
          </motion.button>

          {/* Reset button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.08, rotate: -45 }}
            whileTap={{ scale: 0.92 }}
            onClick={resetTimer}
            title="Reset Timer"
            className="p-3.5 rounded-2xl glass-panel text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {/* Skip Break Button (Only shown during breaks) */}
          {(mode === 'short_break' || mode === 'long_break') && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipBreak}
              title="Skip Break and Return to Work"
              className="px-4 py-3 rounded-2xl font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
            >
              <FastForward className="w-4 h-4" />
              <span>Skip Break</span>
            </motion.button>
          )}
        </div>

        {/* Attach Mission to Focus On */}
        <div className="w-full max-w-md pt-5 border-t border-slate-200/60 dark:border-slate-800 text-left">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Target Mission for this sprint:
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="">-- Freeform Focus (No specific task) --</option>
            {pendingTasks.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.priority}] {t.title}
              </option>
            ))}
          </select>

          {activeTask && (
            <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                🎯 {activeTask.title}
              </span>
              <button
                type="button"
                onClick={() => {
                  onToggleComplete(activeTask);
                  setSelectedTaskId('');
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done
              </button>
            </div>
          )}
        </div>
      </Card3D>

      {/* Durations Configuration Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-card p-6 sm:p-7 rounded-3xl border border-indigo-500/30 max-w-sm w-full bg-white dark:bg-slate-900 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" />
                  Timer Settings
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Focus Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={tempSettings.work}
                    onChange={(e) => setTempSettings({ ...tempSettings, work: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Short Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tempSettings.short_break}
                    onChange={(e) => setTempSettings({ ...tempSettings, short_break: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Long Break (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={tempSettings.long_break}
                    onChange={(e) => setTempSettings({ ...tempSettings, long_break: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex-1 py-2 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="flex-1 py-2 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-3d-btn"
                  >
                    Save Durations
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
