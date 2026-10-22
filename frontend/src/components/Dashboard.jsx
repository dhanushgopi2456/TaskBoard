import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import StatCard3D from './StatCard3D';
import TaskItem3D from './TaskItem3D';
import TaskModal3D from './TaskModal3D';
import DeleteConfirmModal from './DeleteConfirmModal';
import { playSuccessSound, triggerConfetti } from '../utils/effects';
import { apiFetch } from '../api';

export default function Dashboard({
  token,
  user,
  soundEnabled,
}) {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and Sorting
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('due_date'); // 'due_date' | 'priority' | 'newest'

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch tasks with query params
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (activeTab !== 'all') {
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
      setCounts(data.counts || { total: 0, pending: 0, completed: 0 });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [token, activeTab, searchQuery, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
      throw new Error(data.error || 'Failed to save task');
    }

    // Refresh task list & counts
    await fetchTasks();
  };

  // Toggle complete / pending
  const handleToggleComplete = async (task, event) => {
    const newCompleted = !task.completed;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: newCompleted } : t))
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
    }

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!res.ok) {
        // Rollback on failure
        fetchTasks();
      }
    } catch (err) {
      console.error('Failed to toggle complete:', err);
      fetchTasks();
    }
  };

  // Delete task confirmation
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
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
      await fetchTasks();
    } catch (err) {
      alert(err.message || 'Error deleting task');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28">
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            My Tasks
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Workspace
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize, prioritize and accomplish your day in 3D
          </p>
        </div>

        {/* Add Task Button (Desktop) */}
        <button
          type="button"
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-3d-btn active:scale-95 transition-all duration-150 text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          + Add task
        </button>
      </div>

      {/* 3D Stat Cards Grid (Total, Pending, Completed) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8">
        <StatCard3D
          title="Total"
          count={counts.total}
          icon={ListTodo}
          color="indigo"
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
        />
        <StatCard3D
          title="Pending"
          count={counts.pending}
          icon={Clock}
          color="amber"
          active={activeTab === 'pending'}
          onClick={() => setActiveTab('pending')}
        />
        <StatCard3D
          title="Completed"
          count={counts.completed}
          icon={CheckCircle2}
          color="emerald"
          active={activeTab === 'completed'}
          onClick={() => setActiveTab('completed')}
        />
      </div>

      {/* Filter Tabs, Search Bar, and Sort Options (Screen 2 & Screen 4) */}
      <div className="glass-panel p-3 sm:p-4 rounded-2xl mb-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 self-start md:self-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Sort Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 md:max-w-md md:justify-end">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks…"
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative flex-shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer pr-7 appearance-none"
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

      {/* Main Task List Area with States: Loading, Error, Empty, and Populated */}
      <div>
        {/* Loading State (Matches Screen 4 mockup) */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 animate-ping" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-3d-glow text-white">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 animate-pulse">
              Loading tasks…
            </p>
          </div>
        )}

        {/* Error State with Retry (Matches Screen 4 mockup) */}
        {!loading && error && (
          <div className="py-16 px-6 glass-card rounded-3xl border border-rose-500/20 text-center max-w-md mx-auto my-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Couldn’t load tasks
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={fetchTasks}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md active:scale-95 transition-all text-xs sm:text-sm inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Empty State (Matches Screen 4 mockup) */}
        {!loading && !error && tasks.length === 0 && (
          <div className="py-16 px-6 glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center max-w-md mx-auto my-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 shadow-sm">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              No tasks yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
              {searchQuery
                ? 'No tasks matched your search query.'
                : activeTab !== 'all'
                ? `No ${activeTab} tasks found.`
                : 'Tap + to add your first task.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setTaskToEdit(null);
                setIsTaskModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-3d-btn active:scale-95 transition-all text-xs sm:text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add task
            </button>
          </div>
        )}

        {/* Populated Task List */}
        {!loading && !error && tasks.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence>
              {tasks.map((task) => (
                <TaskItem3D
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(t) => {
                    setTaskToEdit(t);
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

      {/* Floating Action Button for Mobile (+ button, Screen 4 mockup) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-30">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setTaskToEdit(null);
            setIsTaskModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-3d-glow active:scale-95 transition-transform"
          aria-label="Add new task"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </motion.button>
      </div>

      {/* Add / Edit Task Modal */}
      <TaskModal3D
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
      />
    </div>
  );
}
