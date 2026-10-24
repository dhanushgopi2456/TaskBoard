import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  AlertTriangle,
  Award,
  Calendar,
  PieChart,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Flame,
  Timer,
  Filter,
} from 'lucide-react';
import Card3D from './Card3D';
import { apiFetch } from '../api';

export default function AnalyticsView({ tasks = [], counts = {}, token = null }) {
  const [dateRange, setDateRange] = useState('7d'); // '7d' | '30d' | 'all'
  const [focusStats, setFocusStats] = useState(null);

  // Fetch real focus session stats
  useEffect(() => {
    if (!token) return;
    apiFetch('/api/focus/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setFocusStats(data);
      })
      .catch((err) => console.error('Failed to load focus stats:', err));
  }, [token]);

  // Filter tasks based on selected date range (if applicable)
  const filteredTasks = useMemo(() => {
    if (dateRange === 'all') return tasks;
    const daysLimit = dateRange === '7d' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysLimit);
    cutoff.setHours(0, 0, 0, 0);

    return tasks.filter((t) => {
      if (!t.due_date && !t.created_at) return true;
      const tDate = t.due_date ? new Date(t.due_date) : new Date(t.created_at);
      return tDate >= cutoff;
    });
  }, [tasks, dateRange]);

  // Compute analytics metrics
  const total = filteredTasks.length;
  const completed = filteredTasks.filter((t) => t.completed).length;
  const inProgress = filteredTasks.filter((t) => !t.completed && t.status === 'in_progress').length;
  const todo = filteredTasks.filter((t) => !t.completed && (t.status === 'todo' || !t.status)).length;

  // Overdue count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = filteredTasks.filter((t) => {
    if (!t.due_date || t.completed) return false;
    const due = new Date(t.due_date);
    due.setHours(0, 0, 0, 0);
    return due < today;
  });

  const overdueCount = overdueTasks.length;

  // Streak calculation based on actual completed tasks & focus sessions
  const streakDays = useMemo(() => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const hadCompletedTask = tasks.some(
        (t) => t.completed && t.updated_at && t.updated_at.startsWith(iso)
      );
      const hadFocus = focusStats?.dailyBreakdown?.some(
        (b) => b.date === iso && b.sessions > 0
      );
      if (hadCompletedTask || hadFocus || (i === 0 && (completed > 0 || (focusStats?.totalSessions || 0) > 0))) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return Math.max(1, streak);
  }, [tasks, focusStats, completed]);

  // High, Medium, Low priorities
  const priorityStats = {
    High: {
      total: filteredTasks.filter((t) => t.priority === 'High').length,
      completed: filteredTasks.filter((t) => t.priority === 'High' && t.completed).length,
      pending: filteredTasks.filter((t) => t.priority === 'High' && !t.completed).length,
    },
    Medium: {
      total: filteredTasks.filter((t) => t.priority === 'Medium').length,
      completed: filteredTasks.filter((t) => t.priority === 'Medium' && t.completed).length,
      pending: filteredTasks.filter((t) => t.priority === 'Medium' && !t.completed).length,
    },
    Low: {
      total: filteredTasks.filter((t) => t.priority === 'Low').length,
      completed: filteredTasks.filter((t) => t.priority === 'Low' && t.completed).length,
      pending: filteredTasks.filter((t) => t.priority === 'Low' && !t.completed).length,
    },
  };

  // Completion percentage
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Productivity status rating
  let productivityRating = {
    label: 'Getting Started',
    color: 'text-indigo-500',
    icon: Sparkles,
    msg: 'Add tasks and start checking them off to build momentum!',
  };
  if (completionRate >= 80) {
    productivityRating = {
      label: 'Super productive! 🔥',
      color: 'text-emerald-500',
      icon: Flame,
      msg: 'Outstanding velocity! You have accomplished the vast majority of your goals.',
    };
  } else if (completionRate >= 50) {
    productivityRating = {
      label: 'Great Momentum 🚀',
      color: 'text-indigo-500',
      icon: TrendingUp,
      msg: 'More than halfway through your tasks. Keep up the great focus!',
    };
  } else if (completionRate > 0) {
    productivityRating = {
      label: 'In Progress ⚡',
      color: 'text-amber-500',
      icon: Zap,
      msg: 'Good start. Tackle your highest priority tasks next for maximum impact.',
    };
  }

  // Weekly day-of-week task distribution (Mon to Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayIndices = [1, 2, 3, 4, 5, 6, 0];
  const currentDayIndex = new Date().getDay();

  const weeklyDistribution = daysOfWeek.map((day, idx) => {
    const jsDay = dayIndices[idx];
    const isToday = jsDay === currentDayIndex;

    const dayTasks = tasks.filter((t) => {
      if (!t.due_date) return false;
      const parts = t.due_date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.getDay() === jsDay;
      }
      return false;
    });

    return {
      day,
      count: dayTasks.length,
      completedCount: dayTasks.filter((t) => t.completed).length,
      isToday,
    };
  });

  const maxWeeklyCount = Math.max(1, ...weeklyDistribution.map((d) => d.count));

  // Circular gauge calculations for completion ring
  const strokeWidth = 12;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.15 }}
      className="space-y-6"
    >
      {/* Date Range Selector & Momentum Streak Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Timeframe:
          </span>
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-bold">
            {[
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setDateRange(r.id)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  dateRange === r.id
                    ? 'bg-indigo-600 text-white shadow-3d-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Momentum Streak Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-extrabold text-amber-600 dark:text-amber-400">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
          <span>{streakDays}-Day Momentum Streak</span>
        </div>
      </div>

      {/* Top Productivity Highlights & KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Completion Rate */}
        <Card3D
          maxTilt={4}
          glowColor="rgba(16, 185, 129, 0.25)"
          className="glass-card p-4 sm:p-5 border border-emerald-500/25 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completionRate}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {completed} of {total}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ type: 'spring', visualDuration: 0.8, bounce: 0.1 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
        </Card3D>

        {/* KPI 2: Active / In Progress */}
        <Card3D
          maxTilt={4}
          glowColor="rgba(245, 158, 11, 0.25)"
          className="glass-card p-4 sm:p-5 border border-amber-500/25 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              In Flight
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {inProgress}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              active now
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 truncate font-medium">
            {todo} queued in To Do
          </p>
        </Card3D>

        {/* KPI 3: Overdue Tasks Warning */}
        <Card3D
          maxTilt={4}
          glowColor={overdueCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(99, 102, 241, 0.15)'}
          className={`glass-card p-4 sm:p-5 rounded-3xl border ${
            overdueCount > 0
              ? 'border-rose-500/40 bg-rose-500/5 shadow-glow-rose'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overdue
            </span>
            <div
              className={`p-2 rounded-xl ${
                overdueCount > 0 ? 'bg-rose-500/15 text-rose-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-extrabold ${
                overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {overdueCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {overdueCount === 1 ? 'task needs action' : 'tasks need action'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-medium">
            {overdueCount > 0 ? '⚠️ Due dates have passed' : 'All due dates healthy'}
          </p>
        </Card3D>

        {/* KPI 4: High Priority Focus */}
        <Card3D
          maxTilt={4}
          glowColor="rgba(99, 102, 241, 0.25)"
          className="glass-card p-4 sm:p-5 border border-indigo-500/25 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              High Priority
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {priorityStats.High.pending}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              pending
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 truncate font-medium">
            {priorityStats.High.completed} High priority completed
          </p>
        </Card3D>
      </div>

      {/* Main Charts Row: Status Donut Chart & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Circular Radial Progress & Status Distribution */}
        <Card3D
          maxTilt={3}
          glowColor="rgba(99, 102, 241, 0.18)"
          className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-500" />
                Status Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Overview of current task pipeline
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {total} Total
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
            {/* SVG Circular Donut Gauge */}
            <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800/80"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {total > 0 && (
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    stroke="#f59e0b"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference - ((completed + inProgress) / total) * circumference
                    }
                    strokeLinecap="round"
                    fill="transparent"
                    className="opacity-40"
                  />
                )}
                <motion.circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="url(#completionGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ type: 'spring', visualDuration: 0.9, bounce: 0.1 }}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Metrics Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {completionRate}%
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Done
                </span>
              </div>
            </div>

            {/* Status Legend Breakdown */}
            <div className="flex-1 space-y-2.5 w-full">
              {/* To Do */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-indigo-500 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    To Do
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {todo}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    ({total > 0 ? Math.round((todo / total) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* In Progress */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-amber-500 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    In Progress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {inProgress}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    ({total > 0 ? Math.round((inProgress / total) * 100) : 0}%)
                  </span>
                </div>
              </div>

              {/* Completed */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Completed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {completed}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    ({total > 0 ? Math.round((completed / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Velocity Banner */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <span className={`font-bold flex items-center gap-1.5 ${productivityRating.color}`}>
              {productivityRating.label}
            </span>
          </div>
        </Card3D>

        {/* Chart 2: Priority Breakdown Comparison Bar Chart */}
        <Card3D
          maxTilt={3}
          glowColor="rgba(239, 68, 68, 0.18)"
          className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-rose-500" />
                Tasks by Priority
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Completed vs pending workload per priority
              </p>
            </div>
          </div>

          {/* Priority comparative bars */}
          <div className="space-y-4 my-auto">
            {/* High Priority */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-glow-rose" />
                  High Priority
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  {priorityStats.High.completed} done / {priorityStats.High.total} total
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: priorityStats.High.total > 0
                      ? `${(priorityStats.High.completed / priorityStats.High.total) * 100}%`
                      : '0%',
                  }}
                  transition={{ type: 'spring', visualDuration: 0.7, bounce: 0.1 }}
                  className="bg-emerald-500 h-full"
                  title="Completed"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: priorityStats.High.total > 0
                      ? `${(priorityStats.High.pending / priorityStats.High.total) * 100}%`
                      : '0%',
                  }}
                  transition={{ type: 'spring', visualDuration: 0.7, bounce: 0.1 }}
                  className="bg-rose-500/85 h-full"
                  title="Pending"
                />
              </div>
            </div>

            {/* Medium Priority */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-glow-amber" />
                  Medium Priority
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  {priorityStats.Medium.completed} done / {priorityStats.Medium.total} total
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: priorityStats.Medium.total > 0
                      ? `${(priorityStats.Medium.completed / priorityStats.Medium.total) * 100}%`
                      : '0%',
                  }}
                  transition={{ type: 'spring', visualDuration: 0.7, bounce: 0.1 }}
                  className="bg-emerald-500 h-full"
                  title="Completed"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: priorityStats.Medium.total > 0
                      ? `${(priorityStats.Medium.pending / priorityStats.Medium.total) * 100}%`
                      : '0%',
                  }}
                  transition={{ type: 'spring', visualDuration: 0.7, bounce: 0.1 }}
                  className="bg-amber-500/85 h-full"
                  title="Pending"
                />
              </div>
            </div>

            {/* Low Priority */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald" />
                  Low Priority
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-400">
                  {priorityStats.Low.completed} done / {priorityStats.Low.total} total
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: priorityStats.Low.total > 0
                      ? `${(priorityStats.Low.completed / priorityStats.Low.total) * 100}%`
                      : '0%',
                  }}
                  transition={{ type: 'spring', visualDuration: 0.7, bounce: 0.1 }}
                  className="bg-emerald-500 h-full"
                  title="Completed"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: priorityStats.Low.total > 0
                      ? `${(priorityStats.Low.pending / priorityStats.Low.total) * 100}%`
                      : '0%',
                  }}
                  transition={{ type: 'spring', visualDuration: 0.7, bounce: 0.1 }}
                  className="bg-emerald-300 dark:bg-emerald-800/80 h-full"
                  title="Pending"
                />
              </div>
            </div>
          </div>

          {/* Bar Legend */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Completed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              High Pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              Med Pending
            </span>
          </div>
        </Card3D>
      </div>

      {/* Chart 3: Weekly Activity & Schedule Distribution */}
      <Card3D
        maxTilt={2}
        glowColor="rgba(99, 102, 241, 0.15)"
        className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Weekly Schedule & Due Dates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Number of tasks scheduled across days of the week
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Highlighted = Today
          </span>
        </div>

        {/* 7-day Column Bars */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 px-1">
          {weeklyDistribution.map((item) => {
            const heightPercent =
              maxWeeklyCount > 0 ? Math.max(14, (item.count / maxWeeklyCount) * 100) : 14;

            return (
              <div key={item.day} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 group-hover:scale-110 transition-transform">
                  {item.count}
                </span>

                <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-end p-1 h-28 relative">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ type: 'spring', visualDuration: 0.6, bounce: 0.15 }}
                    className={`w-full rounded-lg transition-all duration-300 ${
                      item.isToday
                        ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 shadow-3d-glow'
                        : item.count > 0
                        ? 'bg-gradient-to-t from-indigo-500/80 to-purple-400/80'
                        : 'bg-transparent'
                    }`}
                  />
                </div>

                <div className="mt-2 text-center">
                  <span
                    className={`text-xs font-bold transition-colors ${
                      item.isToday
                        ? 'px-2 py-0.5 rounded-md bg-indigo-500 text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.day}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card3D>

      {/* Chart 4: Daily Focus-Time Summaries (From real Pomodoro session data) */}
      <Card3D
        maxTilt={2}
        glowColor="rgba(245, 158, 11, 0.2)"
        className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-500" />
              Daily Focus-Time Summaries
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Minutes invested in deep work sprints across the past 7 days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {focusStats ? `${focusStats.todayMinutes}m Today` : 'Active'}
            </span>
            <span className="text-xs font-bold text-slate-400">
              ({focusStats?.totalMinutes || 0}m Total)
            </span>
          </div>
        </div>

        {/* Focus breakdown bars */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-40 pt-4 pb-2 px-1">
          {(focusStats?.dailyBreakdown || weeklyDistribution.map((d) => ({ day: d.day, minutes: 0 }))).map(
            (item, idx) => {
              const maxFocus = Math.max(30, ...(focusStats?.dailyBreakdown?.map((b) => b.minutes) || [30]));
              const heightPercent = maxFocus > 0 ? Math.max(12, (item.minutes / maxFocus) * 100) : 12;

              return (
                <div key={item.day || idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 group-hover:scale-110 transition-transform">
                    {item.minutes || 0}m
                  </span>

                  <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-end p-1 h-24 relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ type: 'spring', visualDuration: 0.6, bounce: 0.15 }}
                      className={`w-full rounded-lg transition-all duration-300 ${
                        item.minutes > 0
                          ? 'bg-gradient-to-t from-amber-600 via-amber-500 to-orange-400 shadow-glow-amber'
                          : 'bg-transparent'
                      }`}
                    />
                  </div>

                  <div className="mt-2 text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {item.day}
                    </span>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card3D>

      {/* Smart Productivity Insight Tip Card */}
      <div className="glass-card p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent flex items-start gap-3.5 shadow-sm">
        <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Smart Productivity Recommendation
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {productivityRating.msg}{' '}
            {overdueCount > 0 &&
              `You have ${overdueCount} task(s) overdue. Prioritize clearing those before taking on new backlog items.`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
