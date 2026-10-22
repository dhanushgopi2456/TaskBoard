import React from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import Card3D from './Card3D';

export default function TaskItem3D({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
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
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
    },
    Medium: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
    },
    Low: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
  };

  const priorityStyle = priorityStyles[task.priority] || priorityStyles.Medium;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="mb-3"
    >
      <Card3D
        maxTilt={3}
        glowColor={
          task.completed
            ? 'rgba(16, 185, 129, 0.1)'
            : isOverdue
            ? 'rgba(239, 68, 68, 0.12)'
            : 'rgba(99, 102, 241, 0.12)'
        }
        className={`glass-card p-4 transition-all duration-200 border ${
          task.completed
            ? 'border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 opacity-80'
            : isOverdue
            ? 'border-rose-400/40 dark:border-rose-500/40 shadow-sm'
            : 'border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400/50'
        }`}
      >
        <div className="flex items-start sm:items-center justify-between gap-3">
          {/* Checkbox and Task Content */}
          <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
            {/* 3D Checkbox */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task, e);
              }}
              aria-label={task.completed ? "Mark pending" : "Mark completed"}
              className={`relative mt-0.5 sm:mt-0 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 transform active:scale-90 border ${
                task.completed
                  ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 border-indigo-600 shadow-3d-glow text-white'
                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white/70 dark:bg-slate-800/70'
              }`}
            >
              {task.completed && (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </motion.div>
              )}
            </button>

            {/* Task Title & Details */}
            <div className="flex-1 min-w-0">
              <h3
                className={`text-base font-semibold transition-all duration-200 break-words ${
                  task.completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-100'
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={`text-xs mt-1 line-clamp-2 ${
                    task.completed
                      ? 'text-slate-400 dark:text-slate-600 line-through'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {task.description}
                </p>
              )}

              {/* Mobile-only / Desktop Date and Status Row */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                {task.completed ? (
                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Completed
                  </span>
                ) : formattedDate ? (
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      isOverdue
                        ? 'text-rose-600 dark:text-rose-400 font-semibold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {isOverdue ? `Overdue · ${formattedDate}` : `Due ${formattedDate}`}
                  </span>
                ) : null}

                {/* Priority visible inline on small screens */}
                <span
                  className={`sm:hidden inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${priorityStyle.bg}`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Priority badge (Desktop) + Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
            {/* Priority Badge on Desktop */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${priorityStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              {task.priority}
            </span>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(task)}
              title="Delete Task"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card3D>
    </motion.div>
  );
}
