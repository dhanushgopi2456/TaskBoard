import React from 'react';
import Card3D from './Card3D';
import { motion } from 'motion/react';

export default function StatCard3D({ title, count, icon: Icon, color, active, onClick }) {
  // Color configuration presets
  const themes = {
    indigo: {
      bgGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'border-indigo-500/30 dark:border-indigo-500/40',
      badgeBg: 'bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400',
      glow: 'rgba(99, 102, 241, 0.28)',
      numberColor: 'text-indigo-900 dark:text-indigo-100',
      ringColor: 'ring-2 ring-indigo-500/80 shadow-3d-glow',
    },
    amber: {
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/30 dark:border-amber-500/40',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400',
      glow: 'rgba(245, 158, 11, 0.28)',
      numberColor: 'text-amber-900 dark:text-amber-100',
      ringColor: 'ring-2 ring-amber-500/80 shadow-glow-amber',
    },
    emerald: {
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30 dark:border-emerald-500/40',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.28)',
      numberColor: 'text-emerald-900 dark:text-emerald-100',
      ringColor: 'ring-2 ring-emerald-500/80 shadow-glow-emerald',
    },
    rose: {
      bgGradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderColor: 'border-rose-500/30 dark:border-rose-500/40',
      badgeBg: 'bg-rose-500/10 dark:bg-rose-400/20 text-rose-600 dark:text-rose-400',
      glow: 'rgba(244, 63, 94, 0.28)',
      numberColor: 'text-rose-900 dark:text-rose-100',
      ringColor: 'ring-2 ring-rose-500/80 shadow-glow-rose',
    },
  };

  const theme = themes[color] || themes.indigo;

  return (
    <Card3D
      maxTilt={6}
      glowColor={theme.glow}
      onClick={onClick}
      className={`glass-card p-4 sm:p-5 cursor-pointer border ${theme.borderColor} ${
        active ? theme.ringColor : 'hover:border-indigo-400/50'
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className={`p-2 sm:p-2.5 rounded-xl ${theme.badgeBg} shadow-sm backdrop-blur-md`}
        >
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </motion.div>
      </div>

      <div className="flex items-baseline space-x-1.5 sm:space-x-2">
        <motion.span
          key={count}
          initial={{ scale: 0.75, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.25 }}
          className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${theme.numberColor}`}
        >
          {count}
        </motion.span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">tasks</span>
      </div>
    </Card3D>
  );
}
