import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Trash2,
  X,
  Info
} from 'lucide-react';
import {
  playNotificationSound,
  playSuccessSound,
  playDeleteSound,
  getGlobalSoundEnabled,
  setGlobalSoundEnabled,
} from '../utils/effects';

const ToastContext = createContext(null);

export function ToastProvider({ children, soundEnabled = true }) {
  const [toasts, setToasts] = useState([]);
  const soundEnabledRef = useRef(soundEnabled);

  React.useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    setGlobalSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({
      type = 'info', // 'success' | 'error' | 'warning' | 'info' | 'delete'
      title,
      message,
      duration = 3200,
    }) => {
      const id = 'toast-' + Math.random().toString(36).substr(2, 9);

      // Play sound effect based on type (checks immediate global state)
      if (soundEnabledRef.current && getGlobalSoundEnabled()) {
        if (type === 'success') {
          playSuccessSound();
        } else if (type === 'delete') {
          playDeleteSound();
        } else {
          playNotificationSound();
        }
      }

      setToasts((prev) => [
        ...prev.slice(-4), // keep max 5 toasts visible
        { id, type, title, message, duration, createdAt: Date.now() },
      ]);

      return id;
    },
    []
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      aria-live="polite"
      className="fixed z-50 top-4 right-4 sm:top-6 sm:right-6 flex flex-col items-end gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [paused, setPaused] = useState(false);

  React.useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, paused, onRemove]);

  const config = {
    success: {
      border: 'border-emerald-500/40 dark:border-emerald-500/50',
      badgeBg: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400',
      glow: 'shadow-[0_12px_28px_-6px_rgba(16,185,129,0.35)]',
      progressBg: 'bg-emerald-500',
      icon: CheckCircle2,
      defaultTitle: 'Success',
    },
    error: {
      border: 'border-rose-500/40 dark:border-rose-500/50',
      badgeBg: 'bg-rose-500/15 text-rose-500 dark:text-rose-400',
      glow: 'shadow-[0_12px_28px_-6px_rgba(244,63,94,0.35)]',
      progressBg: 'bg-rose-500',
      icon: AlertTriangle,
      defaultTitle: 'Error',
    },
    warning: {
      border: 'border-amber-500/40 dark:border-amber-500/50',
      badgeBg: 'bg-amber-500/15 text-amber-500 dark:text-amber-400',
      glow: 'shadow-[0_12px_28px_-6px_rgba(245,158,11,0.35)]',
      progressBg: 'bg-amber-500',
      icon: AlertCircle,
      defaultTitle: 'Warning',
    },
    delete: {
      border: 'border-rose-500/40 dark:border-rose-500/50',
      badgeBg: 'bg-rose-500/15 text-rose-500 dark:text-rose-400',
      glow: 'shadow-[0_12px_28px_-6px_rgba(225,29,72,0.35)]',
      progressBg: 'bg-rose-600',
      icon: Trash2,
      defaultTitle: 'Deleted',
    },
    info: {
      border: 'border-indigo-500/40 dark:border-indigo-500/50',
      badgeBg: 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400',
      glow: 'shadow-[0_12px_28px_-6px_rgba(99,102,241,0.35)]',
      progressBg: 'bg-indigo-500',
      icon: Sparkles,
      defaultTitle: 'Notice',
    },
  }[toast.type] || {
    border: 'border-slate-300 dark:border-slate-700',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
    glow: 'shadow-md',
    progressBg: 'bg-indigo-500',
    icon: Info,
    defaultTitle: 'Notification',
  };

  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.88, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 80, scale: 0.9, filter: 'blur(4px)', transition: { duration: 0.2 } }}
      transition={{ type: 'spring', visualDuration: 0.32, bounce: 0.15 }}
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      onDragEnd={(e, info) => {
        if (info.offset.x > 70) {
          onRemove(toast.id);
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto relative w-full sm:w-84 overflow-hidden rounded-2xl glass-card border backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 p-3.5 ${config.border} ${config.glow} transition-shadow duration-300 cursor-grab active:cursor-grabbing select-none`}
    >
      <div className="flex items-start gap-3">
        {/* Animated Icon with subtle pulse */}
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          className={`flex-shrink-0 p-2 rounded-xl ${config.badgeBg} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            {toast.title || config.defaultTitle}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words font-medium">
            {toast.message}
          </p>
        </div>

        {/* Manual Dismiss */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Progress Bar timer animation */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: paused ? '100%' : '0%' }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 ${config.progressBg} opacity-80`}
      />
    </motion.div>
  );
}
