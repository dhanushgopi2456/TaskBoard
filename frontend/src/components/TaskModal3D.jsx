import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, AlertCircle } from 'lucide-react';

export default function TaskModal3D({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setDueDate(taskToEdit.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      // Default to today or empty
      setDueDate('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        id: taskToEdit ? taskToEdit.id : undefined,
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* 3D Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20, rotateX: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg glass-card p-6 sm:p-8 z-10 rounded-2xl shadow-2xl border border-white/40 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/60 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              {taskToEdit ? 'Edit task' : 'Add task'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Prepare client demo slides"
                className={`w-full px-4 py-2.5 rounded-xl border bg-white/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-rose-400 ring-2 ring-rose-400/20'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500/50 focus:border-indigo-500'
                }`}
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </motion.p>
              )}
            </div>

            {/* Description field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details (optional)"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Priority and Due Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Due date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 active:scale-95 shadow-3d-btn transition-all duration-150 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                Save task
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
