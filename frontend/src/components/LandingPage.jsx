import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Columns3,
  BarChart3,
  Zap,
  Shield,
  Layers,
  ChevronDown,
  Star,
  Check,
  MousePointer,
  Smartphone,
  Play,
  Clock,
  Calendar,
  Flame,
  Award,
  ListTodo,
} from 'lucide-react';
import Card3D from './Card3D';
import { triggerConfetti, playSuccessSound, playPopSound } from '../utils/effects';

export default function LandingPage({
  onGetStarted,
  onExploreDemo,
  soundEnabled = true,
  user = null,
}) {
  // Interactive Sandbox state on Hero
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: 'Architect WebGL 3D spatial canvas', priority: 'High', completed: true, status: 'completed' },
    { id: 2, title: 'Integrate Motion spring drag & drop', priority: 'High', completed: true, status: 'completed' },
    { id: 3, title: 'Release TaskBoard 2.0 public mission', priority: 'Medium', completed: false, status: 'in_progress' },
  ]);

  const [activeFaq, setActiveFaq] = useState(null);

  const toggleTask = (id) => {
    setDemoTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            if (soundEnabled) playSuccessSound();
            triggerConfetti(0.7, 0.4);
          } else {
            if (soundEnabled) playPopSound();
          }
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'completed' : 'in_progress',
          };
        }
        return t;
      })
    );
  };

  const completedCount = demoTasks.filter((t) => t.completed).length;
  const demoCompletionRate = Math.round((completedCount / demoTasks.length) * 100);

  const faqs = [
    {
      q: 'What makes TaskBoard different from traditional to-do apps?',
      a: 'TaskBoard combines 3D spatial depth, real-time WebGL interactive backgrounds, and physics-driven spring animations via Motion. Instead of flat static lists, you get responsive 3D tilt cards, instant drag-and-drop Kanban pipelines, and fluid velocity analytics.',
    },
    {
      q: 'Does it work smoothly on mobile phones and tablets?',
      a: 'Yes, 100%. TaskBoard includes adaptive pointer intelligence. On desktop, you enjoy hydrodynamic velocity-stretching cursor followers. On mobile, the cursor follower automatically unmounts, preserving native high-speed touch scrolling while adding tactile ripple effects on tap.',
    },
    {
      q: 'Can I switch between List, Kanban, and Analytics views?',
      a: 'Absolutely. TaskBoard provides a unified workspace with zero-latency tab switches. Filter tasks by priority or due dates in List view, drag cards across stages in Kanban, or inspect productivity graphs in Analytics.',
    },
    {
      q: 'Is my task data private and secure?',
      a: 'Yes. Each user account has strict user isolation enforced at the database level, secured with encrypted password hashing (bcrypt) and signed JWT authentication tokens.',
    },
  ];

  return (
    <div className="relative overflow-hidden pb-24">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Release Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm mb-6"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span>TaskBoard 2.0 • 3D Spatial Task Intelligence</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.15, delay: 0.05 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6"
          >
            Manage missions with{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              3D spatial clarity.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.15, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto font-medium"
          >
            Experience next-generation task management. Built with physical spring dynamics, interactive 3D WebGL visuals, real-time Kanban pipelines, and productivity analytics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', visualDuration: 0.4, bounce: 0.15, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onGetStarted(user ? 'login' : 'signup')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-3d-btn active:scale-95 transition-all text-sm flex items-center justify-center gap-2 group"
            >
              <span>{user ? 'Open Workspace' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                if (user) {
                  const el = document.getElementById('interactive-preview');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  else onExploreDemo();
                } else {
                  onExploreDemo();
                }
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-slate-700 dark:text-slate-200 glass-card border border-slate-300 dark:border-slate-700 hover:border-indigo-400/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>{user ? 'Explore Sandbox' : 'Explore Instant Demo'}</span>
            </motion.button>
          </motion.div>

          {/* Trust points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8 text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Zero installation required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> Web & Mobile adaptive
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" /> 100% Free & Open-source
            </span>
          </motion.div>
        </div>

        {/* 2. INTERACTIVE 3D LIVE WORKSPACE PREVIEW (Sandbox Demo Card) */}
        <motion.div
          id="interactive-preview"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', visualDuration: 0.45, bounce: 0.15, delay: 0.2 }}
          className="scroll-mt-24 relative max-w-4xl mx-auto"
        >
          {/* Ambient Glow halo */}
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 pointer-events-none" />

          <Card3D
            maxTilt={4}
            glowColor="rgba(99, 102, 241, 0.25)"
            className="glass-card p-5 sm:p-8 rounded-[2rem] border border-white/80 dark:border-slate-700/80 shadow-2xl bg-white/90 dark:bg-slate-900/90 relative z-10"
          >
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 ml-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Live Interactive Sandbox • Try Clicking Tasks Below!
                </span>
              </div>

              {/* Live Completion Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Velocity:</span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {demoCompletionRate}% Done
                </span>
              </div>
            </div>

            {/* Mini Stat Cards Row */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
              <div className="p-3.5 rounded-2xl glass-panel border border-indigo-500/20">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Total
                </span>
                <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {demoTasks.length}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl glass-panel border border-amber-500/20">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Active
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-500">
                  {demoTasks.length - completedCount}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl glass-panel border border-emerald-500/20">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Completed
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-500">
                  {completedCount}
                </span>
              </div>
            </div>

            {/* Interactive Tasks Sandbox List */}
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {demoTasks.map((t) => (
                  <motion.div
                    key={t.id}
                    layout
                    whileHover={{ scale: 1.01 }}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3.5 rounded-2xl glass-panel border cursor-pointer transition-all duration-300 flex items-center justify-between gap-3 ${
                      t.completed
                        ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 opacity-85'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/60 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Checkbox */}
                      <button
                        type="button"
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          t.completed
                            ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-glow-emerald'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {t.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.3 }}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </motion.div>
                        )}
                      </button>

                      {/* Title */}
                      <span
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          t.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {t.title}
                      </span>
                    </div>

                    {/* Status & Priority Badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                          t.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                          t.completed
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                            : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/25'
                        }`}
                      >
                        {t.completed ? 'Done' : 'In Progress'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Sandbox Bottom Info */}
            <div className="mt-5 pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>💡 Tap any item to test sound chimes and confetti bursts</span>
              <button
                type="button"
                onClick={() => onGetStarted(user ? 'login' : 'signup')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>{user ? 'Launch Full Workspace' : 'Create Free Account & Launch'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card3D>
        </motion.div>
      </section>

      {/* 3. CAPABILITIES / FEATURES SECTION */}
      <section id="features" className="scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
            Engineered For Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Six dimensions of task mastery
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Every feature is calibrated with Motion physics, hardware acceleration, and glass aesthetics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              color: 'text-indigo-500',
              badgeBg: 'bg-indigo-500/10',
              title: '3D Spatial Cards',
              desc: 'Interactive 3D tilt cards with dynamic specular light sheens that track your cursor without causing React re-renders.',
            },
            {
              icon: Columns3,
              color: 'text-amber-500',
              badgeBg: 'bg-amber-500/10',
              title: 'Fluid Kanban Stages',
              desc: 'Seamless drag-and-drop columns with spring physics. Cards glide across To Do, In Progress, and Completed states.',
            },
            {
              icon: BarChart3,
              color: 'text-emerald-500',
              badgeBg: 'bg-emerald-500/10',
              title: 'Velocity Analytics',
              desc: 'Real-time completion percentage donut rings, priority distribution bars, and 7-day schedule health charts.',
            },
            {
              icon: Sparkles,
              color: 'text-purple-500',
              badgeBg: 'bg-purple-500/10',
              title: 'Sensory Audio Feedback',
              desc: 'Lightweight Web Audio API dual-harmonic bell chimes and multi-color 3D confetti celebrations on goal completion.',
            },
            {
              icon: MousePointer,
              color: 'text-pink-500',
              badgeBg: 'bg-pink-500/10',
              title: 'Adaptive Motion Cursor',
              desc: 'Dual-element precision cursor with velocity stretch on desktop, with automatic graceful fallback to tap ripples on mobile.',
            },
            {
              icon: Shield,
              color: 'text-teal-500',
              badgeBg: 'bg-teal-500/10',
              title: 'Isolated & Secure',
              desc: 'Database-level user isolation, bcrypt password encryption, and JSON Web Token authorization for absolute privacy.',
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card3D
                key={feature.title}
                maxTilt={6}
                glowColor="rgba(99, 102, 241, 0.18)"
                className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${feature.badgeBg} ${feature.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Explore ${feature.title} capability`}
                  onClick={() => {
                    if (soundEnabled) playPopSound();
                    const el = document.getElementById('interactive-preview');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else if (onExploreDemo) {
                      onExploreDemo();
                    }
                  }}
                  className="mt-5 pt-3 w-full border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 group transition-all cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg p-1 -m-1"
                >
                  <span className="group-hover:underline">Explore capability</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Card3D>
            );
          })}
        </div>
      </section>

      {/* 4. WORKFLOW / 3-STEP PROCESS SECTION */}
      <section id="workflow" className="scroll-mt-24 py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-200/50 dark:border-slate-800/50">
        <span id="workflows" className="sr-only">Workflows</span>
        <span id="how-it-works" className="sr-only">How it works</span>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 block">
            Intuitive Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How TaskBoard accelerates focus
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {[
            {
              step: '01',
              title: 'Capture & Prioritize',
              desc: 'Rapidly add missions with quick date chips (Today, Tomorrow, 1 Week) and color-coded priority levels.',
              icon: ListTodo,
              color: 'from-indigo-600 to-indigo-500',
            },
            {
              step: '02',
              title: 'Flow & Transition',
              desc: 'Organize cards via smooth drag-and-drop or single-click stage movers across your Kanban board.',
              icon: Columns3,
              color: 'from-purple-600 to-indigo-600',
            },
            {
              step: '03',
              title: 'Analyze & Achieve',
              desc: 'Visualize weekly progress, resolve overdue bottlenecks, and celebrate completed milestones with audio chimes.',
              icon: Award,
              color: 'from-pink-600 to-purple-600',
            },
          ].map((st) => {
            const Icon = st.icon;
            return (
              <div key={st.step} className="relative flex flex-col items-start p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${st.color} text-white flex items-center justify-center font-black text-sm shadow-3d-glow mb-4`}>
                  {st.step}
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
                  {st.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. METRICS & USER TESTIMONIALS */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Uptime Reliability', value: '99.9%' },
            { label: 'Physics Frame Rate', value: '120 FPS' },
            { label: 'Avg API Response', value: '< 45ms' },
            { label: 'Tasks Completed', value: '50,000+' },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl glass-panel text-center border border-slate-200/70 dark:border-slate-800">
              <span className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent block">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: 'The 3D cards and smooth spring physics make organizing daily sprints feel exhilarating instead of like a chore.',
              author: 'Aarav Mehta',
              role: 'Product Lead @ Apex Studio',
            },
            {
              quote: 'The dual-element cursor and adaptive mobile tap ripples are executed to perfection. It feels like an award-winning app.',
              author: 'Sophia Chen',
              role: 'Senior UI/UX Designer',
            },
            {
              quote: 'Finally a task manager that combines serious backend data isolation with truly breathtaking visual design.',
              author: 'Devon Miller',
              role: 'Full-Stack Developer',
            },
          ].map((item, idx) => (
            <Card3D
              key={item.author}
              maxTilt={4}
              glowColor="rgba(168, 85, 247, 0.15)"
              className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed mb-4">
                  "{item.quote}"
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                  {item.author}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  {item.role}
                </span>
              </div>
            </Card3D>
          ))}
        </div>
      </section>

      {/* 6. FAQ ACCORDION (With Motion Height-to-Auto Morphing) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-4xl mx-auto border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 block">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.1 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FINAL CALL-TO-ACTION BANNER */}
      <section className="pt-8 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="relative rounded-[2.5rem] p-8 sm:p-14 overflow-hidden text-center glass-card border border-indigo-200/80 dark:border-indigo-500/30 bg-gradient-to-tr from-indigo-50/80 via-purple-50/40 to-white/90 dark:from-indigo-950/50 dark:via-purple-950/30 dark:to-slate-900/80 shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-4 border border-indigo-500/20 dark:border-indigo-500/30">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              {user ? `Active Session • Welcome back, ${user.name}!` : 'Ready to upgrade your productivity?'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              {user ? 'Resume your 3D spatial workspace.' : 'Enter your 3D spatial workspace today.'}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-8 font-medium">
              {user
                ? 'Your tasks, Kanban pipelines, and Pomodoro focus timers are ready for action.'
                : 'Start organizing your missions in seconds with zero friction.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onGetStarted(user ? 'login' : 'signup')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-3d-btn text-sm flex items-center justify-center gap-2"
              >
                <span>{user ? 'Open Workspace' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (user) {
                    const el = document.getElementById('interactive-preview');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    else onExploreDemo();
                  } else {
                    onExploreDemo();
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-slate-700 dark:text-slate-200 bg-white/90 hover:bg-slate-100 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-300/80 dark:border-white/20 text-sm transition-colors shadow-sm"
              >
                {user ? 'Test Sandbox Demo' : 'Sign In With Demo'}
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

