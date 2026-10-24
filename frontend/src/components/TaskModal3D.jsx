import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  AlertCircle,
  Clock,
  Zap,
  CheckCircle2,
  Sparkles,
  Check,
  Wand2,
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AI_TASK_PRESETS, generateAiTaskContent, getIsoDateFromOffset } from '../utils/aiRecommender';
import { playSuccessSound, playPopSound } from '../utils/effects';

export default function TaskModal3D({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  defaultStatus = 'todo',
  initialPreset = null,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Feature States
  const [aiCategory, setAiCategory] = useState('All');
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiPresets, setShowAiPresets] = useState(true);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'Medium');
      setCategory(taskToEdit.category || 'General');
      setStatus(taskToEdit.status || (taskToEdit.completed ? 'completed' : 'todo'));
      setDueDate(taskToEdit.due_date || '');
      setShowAiPresets(false);
    } else if (initialPreset) {
      applyAiPreset(initialPreset);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('General');
      setStatus(defaultStatus || 'todo');
      setDueDate('');
      setShowAiPresets(true);
    }
    setError('');
    setAiPromptInput('');
  }, [taskToEdit, defaultStatus, initialPreset, isOpen]);

  // Apply a preset directly to form fields
  const applyAiPreset = (preset) => {
    playSuccessSound();
    setTitle(preset.title);
    setDescription(preset.description);
    setPriority(preset.priority);
    setCategory(preset.category || 'Work');
    setDueDate(getIsoDateFromOffset(preset.dueDays || 2));
    if (error) setError('');
  };

  // AI Instant Auto-Fill based on title / prompt
  const handleAiAutoFill = (customPrompt) => {
    const promptToUse = customPrompt || title || aiPromptInput || 'Accelerate project sprint velocity';
    setIsAiGenerating(true);
    playPopSound();

    setTimeout(() => {
      const generated = generateAiTaskContent(promptToUse);
      setTitle(generated.title);
      setDescription(generated.description);
      setPriority(generated.priority);
      setDueDate(getIsoDateFromOffset(generated.dueDays));
      setIsAiGenerating(false);
      playSuccessSound();
      if (error) setError('');
    }, 300);
  };

  // Quick Due Date presets
  const setQuickDate = (offsetDays) => {
    setDueDate(getIsoDateFromOffset(offsetDays));
  };

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
        category: category || 'General',
        status,
        dueDate: dueDate || null,
        completed: status === 'completed',
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPresets = React.useMemo(() => {
    if (aiCategory === 'All') return AI_TASK_PRESETS.slice(0, 4);
    return AI_TASK_PRESETS.filter((p) => p.category === aiCategory).slice(0, 4);
  }, [aiCategory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
          />

          {/* 3D Modal Card */}
          <motion.div
            key="modal-card"
            initial={{ opacity: 0, scale: 0.9, y: 24, rotateX: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16, rotateX: -6 }}
            transition={{ type: 'spring', visualDuration: 0.32, bounce: 0.15 }}
            style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            className="relative w-full max-w-xl glass-card p-6 sm:p-8 z-10 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 my-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-3d-glow">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {taskToEdit ? 'Edit Task' : 'Add New Task'}
                  </h2>
                  {!taskToEdit && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      Powered by AI Smart Recommendations & Auto-Fill
                    </span>
                  )}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* AI SMART PRESETS & AUTO-FILL ACCORDION (New Tasks Only) */}
            {!taskToEdit && showAiPresets && (
              <div className="mb-5 p-3.5 rounded-2xl glass-panel border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                    AI Auto-Fill Recommendations
                  </span>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1">
                    {['All', 'Engineering', 'Design', 'Productivity'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAiCategory(cat)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                          aiCategory === cat
                            ? 'bg-indigo-500 text-white'
                            : 'text-slate-500 hover:text-indigo-600 dark:text-slate-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {filteredPresets.map((preset, idx) => (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => applyAiPreset(preset)}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/60 shadow-sm flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>{preset.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title field with AI Auto-Fill / Enhance Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Task Title <span className="text-rose-500">*</span>
                  </label>

                  {/* AI Enhance Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAiAutoFill()}
                    disabled={isAiGenerating}
                    className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1 shadow-sm"
                  >
                    <Wand2 className={`w-3 h-3 ${isAiGenerating ? 'animate-spin' : ''}`} />
                    <span>{isAiGenerating ? 'Drafting...' : '✨ AI Auto-Fill / Enhance'}</span>
                  </motion.button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. Design 3D Landing Page (or click AI Auto-Fill above)"
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Description field with Markdown / Checklist formatting */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Description & Action Items
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!description.includes('- [ ]')) {
                        setDescription((prev) => (prev ? prev + '\n- [ ] ' : '- [ ] '));
                      }
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-indigo-500"
                  >
                    + Add checklist item
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes, subtasks, or checklist items (- [ ] Subtask)..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-xs sm:text-sm font-mono resize-none leading-relaxed"
                />
              </div>

              {/* Status Radio Pills */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Workflow Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'todo', label: 'To Do', icon: Clock, color: 'text-indigo-500' },
                    { id: 'in_progress', label: 'In Progress', icon: Zap, color: 'text-amber-500' },
                    { id: 'completed', label: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isSelected = status === s.id;
                    return (
                      <motion.button
                        key={s.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setStatus(s.id)}
                        className={`relative p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${s.color}`} />
                        <span>{s.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selector with Sliding Pill */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority Level
                </label>
                <div className="relative flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {['Low', 'Medium', 'High'].map((p) => {
                    const isSelected = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`relative flex-1 py-1.5 text-xs font-bold rounded-xl transition-colors duration-150 z-10 ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="prioritySlider"
                            className={`absolute inset-0 rounded-xl z-0 ${
                              p === 'High'
                                ? 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-glow-rose'
                                : p === 'Medium'
                                ? 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-glow-amber'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-glow-emerald'
                            }`}
                            transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.2 }}
                          />
                        )}
                        <span className="relative z-10">{p}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Tag Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Category</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional tag</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['General', 'Work', 'Personal', 'Development', 'Design', 'Urgent'].map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-3d-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Due Date & Quick Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Due Date
                </label>
                <div className="relative mb-2">
                  <Calendar className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick:</span>
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Tomorrow', days: 1 },
                    { label: 'In 3 Days', days: 3 },
                    { label: 'In 1 Week', days: 7 },
                  ].map((preset) => (
                    <motion.button
                      key={preset.label}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuickDate(preset.days)}
                      className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition-colors"
                    >
                      {preset.label}
                    </motion.button>
                  ))}
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[11px] font-bold text-rose-500 hover:underline ml-auto"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-3d-btn active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
