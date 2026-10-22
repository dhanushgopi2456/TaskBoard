import React from 'react';
import Card3D from './Card3D';
import { motion } from 'framer-motion';

export default function StatCard3D({ title, count, icon: Icon, color, active, onClick }) {
  // Color configuration presets
  const themes = {
    indigo: {
      bgGradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'border-indigo-500/30 dark:border-indigo-500/40',
      badgeBg: 'bg-indigo-500/10 dark:bg-indigo-400/20 text-indigo-600 dark:text-indigo-400',
      glow: 'rgba(99, 102, 241, 0.25)',
      numberColor: 'text-indigo-900 dark:text-indigo-100',
    },
    amber: {
      bgGradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/30 dark:border-amber-500/40',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400',
      glow: 'rgba(245, 158, 11, 0.25)',
      numberColor: 'text-amber-900 dark:text-amber-100',
    },
    emerald: {
      bgGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/30 dark:border-emerald-500/40',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.25)',
      numberColor: 'text-emerald-900 dark:text-emerald-100',
    },
  };

  const theme = themes[color] || themes.indigo;

  return (
    <Card3D
      maxTilt={5}
      glowColor={theme.glow}
      onClick={onClick}
      className={`glass-card p-5 cursor-pointer border ${theme.borderColor} ${
        active ? 'ring-2 ring-indigo-500/60 shadow-3d-glow' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${theme.badgeBg} shadow-sm backdrop-blur-md`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      
      <div className="flex items-baseline space-x-2">
        <motion.span
          key={count}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className={`text-3xl font-extrabold tracking-tight ${theme.numberColor}`}
        >
          {count}
        </motion.span>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">tasks</span>
      </div>
    </Card3D>
  );
}
