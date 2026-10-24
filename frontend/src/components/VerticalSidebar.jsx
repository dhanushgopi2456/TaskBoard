import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ListTodo,
  Columns3,
  BarChart3,
  Timer,
  Sparkles,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Zap,
  Tag,
  ArrowRight,
  Command,
} from 'lucide-react';
import { AI_TASK_PRESETS } from '../utils/aiRecommender';
import { playPopSound } from '../utils/effects';

export default function VerticalSidebar({
  activeView,
  onViewChange,
  counts,
  onOpenNewTaskModal,
  onQuickAddAiTask,
  quickFilter,
  onQuickFilterChange,
  isCollapsed,
  onToggleCollapse,
  onOpenCommandPalette,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter AI recommendations for the sidebar
  const filteredPresets = React.useMemo(() => {
    if (selectedCategory === 'All') return AI_TASK_PRESETS.slice(0, 3);
    return AI_TASK_PRESETS.filter((p) => p.category === selectedCategory).slice(0, 3);
  }, [selectedCategory]);

  return (
    <aside
      className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 z-20 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="sticky top-20 glass-panel rounded-3xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between min-h-[calc(100vh-6rem)] shadow-lg">
        {/* Top Header & Collapse Toggle */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
                  Command Rail
                </span>
              </div>
            )}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto lg:mx-0"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </motion.button>
          </div>

          {/* Quick Add Mission Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenNewTaskModal}
            className={`w-full mb-2.5 py-2.5 px-3 rounded-2xl font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-3d-btn flex items-center justify-center gap-2 text-xs transition-all ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {!isCollapsed && <span>New Task</span>}
          </motion.button>

          {/* Command Palette Trigger */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenCommandPalette}
            className={`w-full mb-4 py-2 px-3 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Open Command Palette (Ctrl+K or ⌘K)"
          >
            <div className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5 text-indigo-500" />
              {!isCollapsed && <span>Commands</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border text-slate-400">
                ⌘K
              </span>
            )}
          </motion.button>

          {/* Views Navigation Stack */}
          <div className="space-y-1 mb-5">
            {!isCollapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                Views
              </span>
            )}
            {[
              { id: 'list', label: 'Tasks List', icon: ListTodo, badge: counts.total },
              { id: 'kanban', label: 'Kanban Stages', icon: Columns3, badge: counts.in_progress },
              { id: 'analytics', label: 'Velocity Charts', icon: BarChart3, badge: `${counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0}%` },
              { id: 'focus', label: 'Focus Pomodoro', icon: Timer, badge: '25m', isNew: true },
            ].map((v) => {
              const Icon = v.icon;
              const isActive = activeView === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    onViewChange(v.id);
                  }}
                  title={isCollapsed ? v.label : undefined}
                  className={`relative w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-3d-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && <span>{v.label}</span>}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1">
                      {v.isNew && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-900 text-[9px] font-black tracking-tight">
                          NEW
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {v.badge}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Filters Section */}
          {!isCollapsed && (
            <div className="space-y-1 mb-5 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                Quick Filters
              </span>
              {[
                { id: 'all', label: 'All Tasks', icon: Filter },
                { id: 'high', label: 'High Priority', icon: Flame, color: 'text-rose-500' },
                { id: 'due_today', label: 'Due Today', icon: Clock, color: 'text-amber-500' },
                { id: 'overdue', label: 'Overdue Missions', icon: AlertTriangle, color: 'text-rose-500' },
              ].map((f) => {
                const Icon = f.icon;
                const isSelected = quickFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onQuickFilterChange(f.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${f.color || ''}`} />
                      <span>{f.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* AI Smart Recommendations Box in the Vertical Sidebar */}
          {!isCollapsed && (
            <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Smart Presets
                </span>
              </div>

              {/* Recommendation Cards */}
              <div className="space-y-2">
                {filteredPresets.map((preset, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.02, x: 2 }}
                    className="p-2.5 rounded-2xl glass-card border border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-400/50 transition-all text-left group cursor-pointer"
                    onClick={() => onQuickAddAiTask(preset)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        {preset.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-500 transition-colors flex items-center gap-0.5">
                        <span>+ Add</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {preset.title}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Productivity Streak Pill */}
        {!isCollapsed ? (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                Focus Streak
              </span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                7 Days
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-indigo-500 h-full w-[80%] rounded-full" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-2 text-amber-500" title="7-Day Streak">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
        )}
      </div>
    </aside>
  );
}

