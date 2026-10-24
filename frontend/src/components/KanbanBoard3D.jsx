import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  Copy,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import Card3D from './Card3D';

const COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    icon: Clock,
    color: 'indigo',
    accentBorder: 'border-indigo-500/40',
    headerBg: 'from-indigo-500/10 to-indigo-500/5',
    badgeBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    dropHighlight: 'ring-2 ring-indigo-500/60 bg-indigo-500/10 shadow-3d-glow',
    pillColor: 'bg-indigo-500',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: Zap,
    color: 'amber',
    accentBorder: 'border-amber-500/40',
    headerBg: 'from-amber-500/10 to-amber-500/5',
    badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    dropHighlight: 'ring-2 ring-amber-500/60 bg-amber-500/10 shadow-glow-amber',
    pillColor: 'bg-amber-500',
  },
  {
    id: 'completed',
    title: 'Done',
    icon: CheckCircle2,
    color: 'emerald',
    accentBorder: 'border-emerald-500/40',
    headerBg: 'from-emerald-500/10 to-emerald-500/5',
    badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    dropHighlight: 'ring-2 ring-emerald-500/60 bg-emerald-500/10 shadow-glow-emerald',
    pillColor: 'bg-emerald-500',
  },
];

export default function KanbanBoard3D({
  tasks,
  onUpdateStatus,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onAddNewTaskWithStatus,
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropCol, setActiveDropCol] = useState(null);

  // Group tasks by their current column
  const tasksByColumn = React.useMemo(() => {
    const groups = {
      todo: [],
      in_progress: [],
      completed: [],
    };

    tasks.forEach((t) => {
      let col = t.status;
      if (t.completed) {
        col = 'completed';
      } else if (col !== 'in_progress' && col !== 'completed') {
        col = 'todo';
      }
      if (groups[col]) {
        groups[col].push(t);
      } else {
        groups.todo.push(t);
      }
    });

    return groups;
  }, [tasks]);

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = (e, colId) => {
    e.preventDefault();
    if (activeDropCol === colId) {
      setActiveDropCol(null);
    }
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    setActiveDropCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Only update if destination differs
    const currentCol = task.completed ? 'completed' : (task.status || 'todo');
    if (currentCol !== colId) {
      onUpdateStatus(task, colId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const colTasks = tasksByColumn[col.id] || [];
        const isDropTarget = activeDropCol === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-3xl glass-card border transition-all duration-300 p-4 min-h-[540px] ${
              isDropTarget
                ? `${col.dropHighlight} border-dashed`
                : 'border-slate-200/80 dark:border-slate-800/80'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${col.badgeBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 tracking-tight">
                  {col.title}
                </h3>
                <motion.span
                  key={colTasks.length}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.2 }}
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}
                >
                  {colTasks.length}
                </motion.span>
              </div>

              {/* Quick Add Button to this Column */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.2 }}
                onClick={() => onAddNewTaskWithStatus(col.id)}
                title={`Add task to ${col.title}`}
                className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-0.5 min-h-[350px]">
              <AnimatePresence mode="popLayout">
                {colTasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    currentColumn={col.id}
                    onDragStart={handleDragStart}
                    onUpdateStatus={onUpdateStatus}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onDuplicate={onDuplicateTask}
                  />
                ))}
              </AnimatePresence>

              {/* Empty Column Placeholder */}
              {colTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => onAddNewTaskWithStatus(col.id)}
                  className={`h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-all duration-300 ${
                    isDropTarget
                      ? 'border-indigo-400 bg-indigo-500/10 scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 12 }}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {isDropTarget ? 'Drop task here' : 'No tasks yet'}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Click to add or drop a card
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  task,
  currentColumn,
  onDragStart,
  onUpdateStatus,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
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
        });
      }
      return task.due_date;
    } catch {
      return task.due_date;
    }
  }, [task.due_date]);

  const priorityStyles = {
    High: {
      bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]',
    },
    Medium: {
      bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
      dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
    },
    Low: {
      bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
      dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
    },
  };

  const priorityStyle = priorityStyles[task.priority] || priorityStyles.Medium;

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.15 }}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      whileHover={{ y: -3, scale: 1.01 }}
      className="cursor-grab active:cursor-grabbing select-none group will-change-transform"
    >
      <div
        className={`relative p-3.5 rounded-2xl glass-panel transition-all duration-300 border ${
          task.completed
            ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/15 opacity-85'
            : isOverdue
            ? 'border-rose-400/60 dark:border-rose-500/50 shadow-glow-rose'
            : 'border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400/60 hover:shadow-3d-md'
        }`}
      >
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Priority Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${priorityStyle.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
              {task.priority}
            </span>

            {/* Category Tag */}
            {task.category && task.category !== 'General' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                #{task.category}
              </span>
            )}
          </div>

          {/* Quick Stage Mover Buttons */}
          <div className="flex items-center gap-1">
            {currentColumn === 'in_progress' && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onUpdateStatus(task, 'todo')}
                title="Move back to To Do"
                className="p-1 rounded-md text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[10px] flex items-center gap-0.5 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>To Do</span>
              </motion.button>
            )}

            {currentColumn === 'todo' && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onUpdateStatus(task, 'in_progress')}
                title="Start working (Move to In Progress)"
                className="px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-[11px] font-bold flex items-center gap-0.5"
              >
                <span>In Progress</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {currentColumn === 'in_progress' && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onUpdateStatus(task, 'completed')}
                title="Mark Done"
                className="px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-[11px] font-bold flex items-center gap-0.5"
              >
                <span>Done</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            )}

            {currentColumn === 'completed' && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onUpdateStatus(task, 'in_progress')}
                title="Reopen task (Move to In Progress)"
                className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-[10px] flex items-center gap-0.5 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Reopen</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Task Title */}
        <h4
          className={`text-sm font-semibold mb-1 line-clamp-2 leading-snug break-words ${
            task.completed
              ? 'line-through text-slate-400 dark:text-slate-500 font-normal'
              : 'text-slate-800 dark:text-slate-100'
          }`}
        >
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p
            className={`text-xs mb-2.5 line-clamp-2 leading-relaxed ${
              task.completed
                ? 'text-slate-400 dark:text-slate-600 line-through'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Card Footer: Due Date & Action Icons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
          {/* Due date */}
          {formattedDate ? (
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-bold animate-pulse'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-600 italic">No date</span>
          )}

          {/* Action icons */}
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            {onDuplicate && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => onDuplicate(task)}
                title="Duplicate"
                className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </motion.button>
            )}
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => onEdit(task)}
              title="Edit"
              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => onDelete(task)}
              title="Delete"
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
