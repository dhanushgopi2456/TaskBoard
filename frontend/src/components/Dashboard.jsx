import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ClipboardList,
  Columns3,
  BarChart3,
  Timer,
  Flame,
  Calendar,
  Trash2,
  Filter,
  CheckCheck,
} from 'lucide-react';
import StatCard3D from './StatCard3D';
import TaskItem3D from './TaskItem3D';
import TaskModal3D from './TaskModal3D';
import DeleteConfirmModal from './DeleteConfirmModal';
import ClearCompletedModal from './ClearCompletedModal';
import KanbanBoard3D from './KanbanBoard3D';
import AnalyticsView from './AnalyticsView';
import FocusTimerView from './FocusTimerView';
import VerticalSidebar from './VerticalSidebar';
import CommandPalette from './CommandPalette';
import { playSuccessSound, triggerConfetti, triggerSubtleConfetti } from '../utils/effects';
import { useToast } from './Toast';
import { apiFetch } from '../api';
import { useLiveClock } from '../utils/useLiveClock';

export default function Dashboard({
  token,
  user,
  soundEnabled,
}) {
  const { addToast } = useToast();
  const liveClock = useLiveClock();

  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, completed: 0, todo: 0, in_progress: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View Switcher: 'list' | 'kanban' | 'analytics' | 'focus'
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('taskboard_view') || 'list';
  });

  // Vertical Sidebar Collapsed State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('taskboard_sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('taskboard_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Filters and Sorting
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'completed'
  const [quickFilter, setQuickFilter] = useState('all'); // 'all' | 'overdue' | 'high' | 'due_today'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_date'); // 'due_date' | 'priority' | 'newest'

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isClearCompletedOpen, setIsClearCompletedOpen] = useState(false);
  const [defaultStatusForModal, setDefaultStatusForModal] = useState('todo');
  const [initialPresetForModal, setInitialPresetForModal] = useState(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener & CustomEvent listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    const handleOpenEvent = () => setIsCommandPaletteOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, []);

  const handleViewChange = (newView) => {
    setActiveView(newView);
    localStorage.setItem('taskboard_view', newView);
    const viewLabels = {
      list: 'List View 📋',
      kanban: 'Kanban Board 🗂️',
      analytics: 'Analytics & Charts 📊',
      focus: 'Focus Pomodoro Engine ⏱️',
    };
    addToast({
      type: 'info',
      title: 'View Mode',
      message: `Switched to ${viewLabels[newView] || newView}`,
    });
  };

  // Quick Add task pre-populated from AI Preset
  const handleQuickAddAiTask = (preset) => {
    setInitialPresetForModal(preset);
    setTaskToEdit(null);
    setDefaultStatusForModal('todo');
    setIsTaskModalOpen(true);
  };

  // Fetch tasks with query params
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (activeView === 'list' && activeTab !== 'all') {
        params.append('status', activeTab);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (sortBy) {
        params.append('sort', sortBy);
      }

      const res = await apiFetch(`/api/tasks?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load tasks from server');
      }

      const data = await res.json();
      setTasks(data.tasks || []);
      setCounts(data.counts || { total: 0, pending: 0, completed: 0, todo: 0, in_progress: 0 });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [token, activeView, activeTab, searchQuery, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Client-side quick filtering for List view
  const displayTasks = useMemo(() => {
    if (activeView !== 'list') return tasks;

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter((task) => {
      if (quickFilter === 'overdue') {
        if (!task.due_date || task.completed) return false;
        const due = new Date(task.due_date);
        due.setHours(0, 0, 0, 0);
        return due < today;
      }
      if (quickFilter === 'high') {
        return task.priority === 'High';
      }
      if (quickFilter === 'due_today') {
        return task.due_date === todayStr;
      }
      return true;
    });
  }, [tasks, activeView, quickFilter]);

  // Handle Save (Add or Edit)
  const handleSaveTask = async (taskData) => {
    const isEdit = !!taskData.id;
    const url = isEdit ? `/api/tasks/${taskData.id}` : '/api/tasks';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiFetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();
    if (!res.ok) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: data.error || 'Failed to save task',
      });
      throw new Error(data.error || 'Failed to save task');
    }

    addToast({
      type: 'success',
      title: isEdit ? 'Task Updated' : 'Task Created',
      message: isEdit
        ? `"${taskData.title}" has been updated.`
        : `"${taskData.title}" added to your workspace.`,
    });

    await fetchTasks();
  };

  // Handle Quick Status Update
  const handleUpdateStatus = async (task, newStatus) => {
    const isCompleted = newStatus === 'completed';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: newStatus, completed: isCompleted } : t
      )
    );

    if (isCompleted) {
      if (soundEnabled) playSuccessSound();
      triggerConfetti();
    }

    const statusNames = {
      todo: 'To Do',
      in_progress: 'In Progress',
      completed: 'Done',
    };

    addToast({
      type: isCompleted ? 'success' : 'info',
      title: isCompleted ? 'Task Done! 🎉' : 'Status Updated',
      message: `"${task.title}" moved to ${statusNames[newStatus] || newStatus}.`,
    });

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, completed: isCompleted }),
      });

      if (!res.ok) {
        fetchTasks();
      } else {
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchTasks();
    }
  };

  // Toggle complete / pending
  const handleToggleComplete = async (task, event) => {
    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'completed' : 'todo';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: newCompleted, status: newStatus } : t
      )
    );

    setCounts((prev) => ({
      ...prev,
      pending: newCompleted ? Math.max(0, prev.pending - 1) : prev.pending + 1,
      completed: newCompleted ? prev.completed + 1 : Math.max(0, prev.completed - 1),
    }));

    if (newCompleted) {
      if (soundEnabled) playSuccessSound();
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect();
        triggerConfetti(
          (rect.left + rect.width / 2) / window.innerWidth,
          (rect.top + rect.height / 2) / window.innerHeight
        );
      } else {
        triggerConfetti();
      }
      addToast({
        type: 'success',
        title: 'Task Completed! 🏆',
        message: `Great job on "${task.title}"! Keep the streak going.`,
      });
    } else {
      addToast({
        type: 'info',
        title: 'Task Reopened ⏳',
        message: `"${task.title}" has been moved back to pending.`,
      });
    }

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: newCompleted, status: newStatus }),
      });

      if (!res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to toggle complete:', err);
      fetchTasks();
    }
  };

  // Duplicate task
  const handleDuplicateTask = async (task) => {
    try {
      await handleSaveTask({
        title: `Copy of ${task.title}`,
        description: task.description || '',
        priority: task.priority || 'Medium',
        category: task.category || 'General',
        dueDate: task.due_date || null,
        status: task.status || 'todo',
      });
    } catch (err) {
      console.error('Duplicate task failed:', err);
    }
  };

  // Delete task confirmation
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    const deletedTitle = taskToDelete.title;
    try {
      const res = await apiFetch(`/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete task');
      }

      setTaskToDelete(null);
      addToast({
        type: 'delete',
        title: 'Task Removed',
        message: `"${deletedTitle}" was deleted from your workspace.`,
      });
      await fetchTasks();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Error deleting task',
      });
    }
  };

  // Clear all completed tasks
  const handleConfirmClearCompleted = async () => {
    try {
      const res = await apiFetch('/api/tasks/completed/clear', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to clear completed tasks');
      }

      setIsClearCompletedOpen(false);
      addToast({
        type: 'delete',
        title: 'Board Cleared',
        message: 'All completed tasks have been cleared.',
      });
      await fetchTasks();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Clear Failed',
        message: err.message || 'Error clearing tasks',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 pb-28 flex flex-col lg:flex-row gap-6 items-start">
      {/* 1. Left Vertical Sidebar Command Center (Uses the vertical space) */}
      <VerticalSidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        counts={counts}
        onOpenNewTaskModal={() => {
          setInitialPresetForModal(null);
          setTaskToEdit(null);
          setDefaultStatusForModal('todo');
          setIsTaskModalOpen(true);
        }}
        onQuickAddAiTask={handleQuickAddAiTask}
        quickFilter={quickFilter}
        onQuickFilterChange={setQuickFilter}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* 2. Main Workspace Content Area */}
      <div className="flex-1 min-w-0 w-full space-y-6">
        {/* Personalized Welcome Banner with Dynamic Live Clock & Date */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.15 }}
          className="relative overflow-hidden rounded-3xl glass-card border border-indigo-500/20 dark:border-indigo-500/30 p-5 sm:p-6 shadow-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent backdrop-blur-xl"
        >
          {/* Subtle glowing ambient background orbs inside banner */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left side: Greeting, User Name, and Mission Briefing */}
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  Workspace Active
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  {liveClock.dayOfWeek} Edition
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {liveClock.greeting},{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  {user?.name || 'Explorer'}
                </span>
                ! 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {counts.pending === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4" /> All missions completed for today! Stellar productivity! 🚀
                  </span>
                ) : (
                  <span>
                    Here is your live briefing for today. You currently have{' '}
                    <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                      {counts.pending} pending mission{counts.pending === 1 ? '' : 's'}
                    </strong>{' '}
                    and <strong className="text-emerald-600 dark:text-emerald-400">{counts.completed} completed</strong>.
                  </span>
                )}
              </p>
            </div>

            {/* Right side: Dynamic Live Clock & Live Date Card */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-auto">
              <div className="px-4 sm:px-5 py-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-md backdrop-blur-md flex flex-col justify-center min-w-[210px]">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                    Live System Clock
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>

                {/* Live ticking time with hours, minutes, and seconds */}
                <div className="flex items-baseline gap-1 font-mono font-black text-2xl sm:text-3xl text-indigo-600 dark:text-indigo-400 tracking-tight">
                  <Clock className="w-5 h-5 self-center mr-1 text-indigo-500 animate-pulse" />
                  <span>{liveClock.timeString}</span>
                </div>

                {/* Today's full live date */}
                <div className="mt-1 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                  <span className="truncate">{liveClock.fullDateString}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard View & Action Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Mission Workspace
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Motion 3D
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Switch views, filter tasks, and manage velocity in real time
            </p>
          </div>

          {/* View Mode Switcher Pills (List, Kanban, Analytics, Focus) */}
          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <div className="flex items-center p-1 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
              {[
                { id: 'list', label: 'List', icon: ListTodo },
                { id: 'kanban', label: 'Kanban', icon: Columns3 },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'focus', label: 'Focus', icon: Timer },
              ].map((v) => {
                const Icon = v.icon;
                const isActive = activeView === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleViewChange(v.id)}
                    className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-150 z-10 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeViewTab"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 rounded-xl shadow-3d-glow z-0"
                        transition={{ type: 'spring', visualDuration: 0.28, bounce: 0.15 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">{v.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Task Button (Desktop) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setInitialPresetForModal(null);
                setTaskToEdit(null);
                setDefaultStatusForModal('todo');
                setIsTaskModalOpen(true);
              }}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-3d-btn active:scale-95 transition-all text-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add task</span>
            </motion.button>
          </div>
        </div>

        {/* 3D Stat Cards Grid (Total, Pending, Completed, Overdue) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <StatCard3D
            title="Total"
            count={counts.total}
            icon={ListTodo}
            color="indigo"
            active={activeTab === 'all' && activeView === 'list' && quickFilter === 'all'}
            onClick={() => {
              setActiveTab('all');
              setQuickFilter('all');
              if (activeView !== 'list') setActiveView('list');
            }}
          />
          <StatCard3D
            title="Pending"
            count={counts.pending}
            icon={Clock}
            color="amber"
            active={activeTab === 'pending' && activeView === 'list'}
            onClick={() => {
              setActiveTab('pending');
              setQuickFilter('all');
              if (activeView !== 'list') setActiveView('list');
            }}
          />
          <StatCard3D
            title="Completed"
            count={counts.completed}
            icon={CheckCircle2}
            color="emerald"
            active={activeTab === 'completed' && activeView === 'list'}
            onClick={() => {
              setActiveTab('completed');
              setQuickFilter('all');
              if (activeView !== 'list') setActiveView('list');
            }}
          />
          <StatCard3D
            title="Overdue"
            count={counts.overdue || 0}
            icon={AlertTriangle}
            color="rose"
            active={quickFilter === 'overdue' && activeView === 'list'}
            onClick={() => {
              setQuickFilter('overdue');
              setActiveTab('pending');
              if (activeView !== 'list') setActiveView('list');
            }}
          />
        </div>

        {/* Filter Tabs, Search Bar, Quick Filters, and Sort Options (for List / Kanban) */}
        {activeView !== 'analytics' && activeView !== 'focus' && (
          <div className="glass-panel p-3.5 sm:p-4 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Status Filter Tabs (for List View) */}
              {activeView === 'list' && (
                <div className="relative flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 self-start md:self-auto w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'completed', label: 'Completed' },
                  ].map((tab) => {
                    const isSelected = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setQuickFilter('all');
                        }}
                        className={`relative flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors duration-150 z-10 ${
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="statusTabPill"
                            className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg shadow-sm z-0"
                            transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.15 }}
                          />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Kanban Mode Helper Info */}
              {activeView === 'kanban' && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Columns3 className="w-4 h-4 text-indigo-500" />
                  <span>Drag cards between columns or use quick buttons to change stages</span>
                </div>
              )}

              {/* Search Input & Sort Selector */}
              <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-md md:justify-end">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or description…"
                    className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                  />
                </div>

                {/* Sort Selector */}
                <div className="relative flex-shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer pr-7 appearance-none"
                  >
                    <option value="due_date">Sort: Due date</option>
                    <option value="priority">Sort: Priority</option>
                    <option value="newest">Sort: Newest</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
                    ▾
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Filter Chips & Clear Completed Option (List view) */}
            {activeView === 'list' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Filter:
                  </span>
                  {[
                    { id: 'all', label: 'All Tasks' },
                    { id: 'overdue', label: '⚠️ Overdue' },
                    { id: 'high', label: '🔥 High Priority' },
                    { id: 'due_today', label: '📅 Due Today' },
                  ].map((chip) => (
                    <motion.button
                      key={chip.id}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setQuickFilter(chip.id);
                        if (chip.id !== 'all') {
                          addToast({
                            type: 'info',
                            title: 'Filter Applied',
                            message: `Filtering by ${chip.label}`,
                          });
                        }
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        quickFilter === chip.id
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-3d-sm'
                          : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {chip.label}
                    </motion.button>
                  ))}
                </div>

                {/* Clear Completed Action Button */}
                {counts.completed > 0 && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsClearCompletedOpen(true)}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3 py-1 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear {counts.completed} completed
                  </motion.button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main View Area: Loading, Error, or Active View (List / Kanban / Analytics / Focus) */}
        <div>
          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-3d-glow text-white">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400 animate-pulse">
                Syncing workspace…
              </p>
            </div>
          )}

          {/* Error State with Retry */}
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-16 px-6 glass-card rounded-3xl border border-rose-500/30 text-center max-w-md mx-auto my-6 shadow-glow-rose"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Couldn’t load tasks
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
                Please check your connection and try again.
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={fetchTasks}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md active:scale-95 transition-all text-xs sm:text-sm inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </motion.button>
            </motion.div>
          )}

          {/* View 1: List View */}
          {!loading && !error && activeView === 'list' && (
            <div>
              {displayTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 px-6 glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center max-w-md mx-auto my-6"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 shadow-sm">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    No tasks found
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
                    {searchQuery
                      ? 'No tasks matched your search query.'
                      : quickFilter !== 'all'
                      ? `No tasks match the "${quickFilter}" filter.`
                      : activeTab !== 'all'
                      ? `No ${activeTab} tasks found.`
                      : 'Tap + to add your first mission.'}
                  </p>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setInitialPresetForModal(null);
                      setTaskToEdit(null);
                      setDefaultStatusForModal('todo');
                      setIsTaskModalOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-3d-btn active:scale-95 transition-all text-xs sm:text-sm inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Add task
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {displayTasks.map((task) => (
                      <TaskItem3D
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onUpdateStatus={handleUpdateStatus}
                        onDuplicate={handleDuplicateTask}
                        onEdit={(t) => {
                          setTaskToEdit(t);
                          setInitialPresetForModal(null);
                          setIsTaskModalOpen(true);
                        }}
                        onDelete={(t) => {
                          setTaskToDelete(t);
                        }}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* View 2: Kanban Board View */}
          {!loading && !error && activeView === 'kanban' && (
            <KanbanBoard3D
              tasks={tasks}
              onUpdateStatus={handleUpdateStatus}
              onToggleComplete={handleToggleComplete}
              onDuplicateTask={handleDuplicateTask}
              onEditTask={(t) => {
                setTaskToEdit(t);
                setInitialPresetForModal(null);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={(t) => {
                setTaskToDelete(t);
              }}
              onAddNewTaskWithStatus={(status) => {
                setTaskToEdit(null);
                setInitialPresetForModal(null);
                setDefaultStatusForModal(status);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {/* View 3: Analytics & Graphs View */}
          {!loading && !error && activeView === 'analytics' && (
            <AnalyticsView tasks={tasks} counts={counts} token={token} />
          )}

          {/* View 4: Focus Pomodoro Mode View (NEW FEATURE) */}
          {!loading && !error && activeView === 'focus' && (
            <FocusTimerView
              tasks={tasks}
              onToggleComplete={handleToggleComplete}
              soundEnabled={soundEnabled}
              token={token}
            />
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile (+ button) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-30">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setInitialPresetForModal(null);
            setTaskToEdit(null);
            setDefaultStatusForModal('todo');
            setIsTaskModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-3d-glow active:scale-95 transition-transform"
          aria-label="Add new task"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </motion.button>
      </div>

      {/* Add / Edit Task Modal with AI Auto-Fill */}
      <TaskModal3D
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setInitialPresetForModal(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStatusForModal}
        initialPreset={initialPresetForModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
      />

      {/* Clear Completed Confirmation Modal */}
      <ClearCompletedModal
        isOpen={isClearCompletedOpen}
        onClose={() => setIsClearCompletedOpen(false)}
        onConfirm={handleConfirmClearCompleted}
        count={counts.completed}
      />

      {/* Searchable Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateView={handleViewChange}
        onOpenNewTask={() => {
          setInitialPresetForModal(null);
          setTaskToEdit(null);
          setDefaultStatusForModal('todo');
          setIsTaskModalOpen(true);
        }}
        onToggleTheme={() => {
          const isDark = document.documentElement.classList.contains('dark');
          if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('taskboard_theme', 'light');
          } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('taskboard_theme', 'dark');
          }
        }}
        darkMode={document.documentElement.classList.contains('dark')}
        tasks={tasks}
        onSelectTask={(task) => {
          setTaskToEdit(task);
          setInitialPresetForModal(null);
          setIsTaskModalOpen(true);
        }}
        onStartFocus={() => {
          handleViewChange('focus');
        }}
      />
    </div>
  );
}
