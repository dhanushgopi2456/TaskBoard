import React from 'react';
import { motion } from 'motion/react';
import { Check, Calendar, AlertCircle, Edit2, Trash2, Copy, Zap, Clock, CheckCircle2 } from 'lucide-react';
import Card3D from './Card3D';

export default function TaskItem3D({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdateStatus,
}) {
  // Check if task is overdue
  const isOverdue = React.useMemo(() => {
    if (!task.due_date || task.completed) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);

    return due < today;
  }, [task.due_date, task.completed]);

  // Format date readable
  const formattedDate = React.useMemo(() => {
    if (!task.due_date) return null;
    try {
      const parts = task.due_date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
      return task.due_date;
    } catch {
      return task.due_date;
    }
  }, [task.due_date]);

  // Priority badge styling
  const priorityStyles = {
    High: {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25',
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    },
    Medium: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
      dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    },
    Low: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    },
  };

  const priorityStyle = priorityStyles[task.priority] || priorityStyles.Medium;

  // Status badge details
  const statusInfo = {
    todo: {
      label: 'To Do',
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
      icon: Clock,
    },
    in_progress: {
      label: 'In Progress',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
      icon: Zap,
    },
    completed: {
      label: 'Done',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      icon: CheckCircle2,
    },
  }[task.status || (task.completed ? 'completed' : 'todo')] || {
    label: 'To Do',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25',
    icon: Clock,
  };

  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, y: -10, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }}
      className="mb-3 group"
    >
      <Card3D
        maxTilt={3}
        glowColor={
          task.completed
            ? 'rgba(16, 185, 129, 0.18)'
            : isOverdue
            ? 'rgba(239, 68, 68, 0.22)'
            : 'rgba(99, 102, 241, 0.18)'
        }
        className={`glass-card p-4 transition-all duration-300 border ${
          task.completed
            ? 'border-emerald-500/30 bg-emerald-50/25 dark:bg-emerald-950/15 opacity-85'
            : isOverdue
            ? 'border-rose-400/60 dark:border-rose-500/50 shadow-glow-rose'
            : 'border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400/60 hover:shadow-3d-md'
        }`}
      >
        <div className="flex items-start sm:items-center justify-between gap-3">
          {/* Checkbox and Task Content */}
          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
            {/* 3D Checkbox with Spring Check animation */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task, e);
              }}
              aria-label={task.completed ? 'Mark pending' : 'Mark completed'}
              className={`relative mt-0.5 sm:mt-0 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 border ${
                task.completed
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 border-emerald-500 shadow-glow-emerald text-white'
                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white/80 dark:bg-slate-800/80'
              }`}
            >
              {task.completed && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.35 }}
                >
                  <svg
                    className="w-4 h-4 stroke-[3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <motion.path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>

            {/* Task Title & Details */}
            <div className="flex-1 min-w-0">
              <h3
                className={`text-sm sm:text-base font-semibold transition-all duration-200 break-words ${
                  task.completed
                    ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
                    : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                    task.completed
                      ? 'text-slate-400 dark:text-slate-600 line-through'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {task.description}
                </p>
              )}

              {/* Status, Date, Priority Row */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                {/* Stage Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${statusInfo.color}`}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </span>

                {/* Category Badge */}
                {task.category && task.category !== 'General' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    #{task.category}
                  </span>
                )}

                {/* Date */}
                {task.completed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completed
                  </span>
                ) : formattedDate ? (
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      isOverdue
                        ? 'text-rose-600 dark:text-rose-400 font-bold animate-pulse'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {isOverdue ? `Overdue · ${formattedDate}` : `Due ${formattedDate}`}
                  </span>
                ) : null}

                {/* Priority visible inline on small screens */}
                <span
                  className={`sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyle.bg}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                  {task.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Priority badge (Desktop) + Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 self-start sm:self-center flex-shrink-0">
            {/* Priority Badge on Desktop */}
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${priorityStyle.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${priorityStyle.dot}`} />
              {task.priority}
            </span>

            {/* Duplicate Button */}
            {onDuplicate && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => onDuplicate(task)}
                title="Duplicate Task"
                className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </motion.button>
            )}

            {/* Edit Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>

            {/* Delete Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => onDelete(task)}
              title="Delete Task"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
}
