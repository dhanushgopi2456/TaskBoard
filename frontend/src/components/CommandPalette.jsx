import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  ListTodo,
  Columns3,
  BarChart3,
  Timer,
  Sun,
  Moon,
  Play,
  ArrowRight,
  CheckCircle2,
  Clock,
  X,
  Command,
  CornerDownLeft,
} from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigateView,
  onOpenNewTask,
  onToggleTheme,
  darkMode,
  tasks = [],
  onSelectTask,
  onStartFocus,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Auto-focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Base system commands
  const systemCommands = useMemo(() => [
    {
      id: 'create-task',
      title: 'Create New Task',
      subtitle: 'Open the 3D task creation modal',
      category: 'Actions',
      icon: Plus,
      color: 'text-indigo-500 bg-indigo-500/10',
      action: () => {
        onClose();
        onOpenNewTask();
      },
    },
    {
      id: 'view-list',
      title: 'Go to List View',
      subtitle: 'View tasks in categorized list format',
      category: 'Navigation',
      icon: ListTodo,
      color: 'text-blue-500 bg-blue-500/10',
      action: () => {
        onClose();
        onNavigateView('list');
      },
    },
    {
      id: 'view-kanban',
      title: 'Go to Kanban Board',
      subtitle: 'Drag and drop cards across stages',
      category: 'Navigation',
      icon: Columns3,
      color: 'text-purple-500 bg-purple-500/10',
      action: () => {
        onClose();
        onNavigateView('kanban');
      },
    },
    {
      id: 'view-analytics',
      title: 'Go to Analytics & Velocity',
      subtitle: 'Inspect completion charts and streaks',
      category: 'Navigation',
      icon: BarChart3,
      color: 'text-emerald-500 bg-emerald-500/10',
      action: () => {
        onClose();
        onNavigateView('analytics');
      },
    },
    {
      id: 'view-focus',
      title: 'Start Pomodoro Focus Session',
      subtitle: 'Switch to deep work timer mode',
      category: 'Productivity',
      icon: Timer,
      color: 'text-amber-500 bg-amber-500/10',
      action: () => {
        onClose();
        if (onStartFocus) onStartFocus();
        else onNavigateView('focus');
      },
    },
    {
      id: 'toggle-theme',
      title: darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      subtitle: darkMode ? 'Enable crisp light theme' : 'Enable dark navy 3D theme',
      category: 'Preferences',
      icon: darkMode ? Sun : Moon,
      color: darkMode ? 'text-amber-400 bg-amber-400/10' : 'text-indigo-400 bg-indigo-400/10',
      action: () => {
        onClose();
        onToggleTheme();
      },
    },
  ], [darkMode, onNavigateView, onOpenNewTask, onToggleTheme, onStartFocus, onClose]);

  // Matching task items
  const matchingTasks = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return tasks
      .filter((t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        subtitle: `[${t.priority}] · ${t.category || 'General'} · ${t.status || 'todo'}`,
        category: 'Tasks',
        icon: t.completed ? CheckCircle2 : Clock,
        color: t.completed ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10',
        action: () => {
          onClose();
          onSelectTask(t);
        },
      }));
  }, [query, tasks, onSelectTask, onClose]);

  // Filtered system commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return systemCommands;
    const q = query.toLowerCase().trim();
    return systemCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [query, systemCommands]);

  const allItems = useMemo(() => [...matchingTasks, ...filteredCommands], [matchingTasks, filteredCommands]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter, Esc)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -20 }}
          transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl glass-card rounded-3xl border border-indigo-500/30 bg-white/95 dark:bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/80 dark:border-slate-800">
            <Search className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command, navigate, or search tasks..."
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              aria-autocomplete="list"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                ESC
              </span>
            )}
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-80 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100/50 dark:divide-slate-800/50"
          >
            {allItems.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 font-medium">
                No matching commands or tasks found for "{query}".
              </div>
            ) : (
              allItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-3d-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : item.color
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p
                          className={`text-sm font-bold truncate ${
                            isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            isSelected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.category}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="w-4 h-4 text-white stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts Info */}
          <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-mono font-bold">
                <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 border">↑</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 border">↓</span>
              </span>
              <span>to navigate</span>
              <span className="mx-1">•</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 border font-mono font-bold">
                ↵
              </span>
              <span>to select</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1">
              <Command className="w-3 h-3 text-indigo-500" /> + K anywhere
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

