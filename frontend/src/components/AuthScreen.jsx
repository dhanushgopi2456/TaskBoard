import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Card3D from './Card3D';
import { apiFetch } from '../api';

export default function AuthScreen({ onLoginSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@taskboard.com');
  const [password, setPassword] = useState('Demo@123');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabSwitch = (isLogin) => {
    setIsLoginTab(isLogin);
    setErrorMessage('');
    if (isLogin) {
      setEmail('demo@taskboard.com');
      setPassword('Demo@123');
    } else {
      setName('');
      setEmail('');
      setPassword('');
    }
  };

  const handleQuickDemoFill = () => {
    setIsLoginTab(true);
    setEmail('demo@taskboard.com');
    setPassword('Demo@123');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Front-end validations
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!password) {
      setErrorMessage('Password is required');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('The password must be at least 8 characters');
      return;
    }

    if (!isLoginTab && (!name || !name.trim())) {
      setErrorMessage('Please enter your name');
      return;
    }

    try {
      setLoading(true);
      const endpoint = isLoginTab ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLoginTab
        ? { email, password }
        : { name: name.trim(), email, password };

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Floating 3D Card */}
        <Card3D
          maxTilt={8}
          glowColor="rgba(99, 102, 241, 0.2)"
          className="glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90"
        >
          {/* Logo / Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-3d-glow mb-3">
              <Sparkles className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              TaskBoard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your intelligent 3D spatial task workspace
            </p>
          </div>

          {/* Quick Demo Login Pill */}
          <div className="mb-5 flex justify-center">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Fill Demo Login (demo@taskboard.com)
            </button>
          </div>

          {/* Tabs: Log in / Sign up */}
          <div className="relative flex p-1 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleTabSwitch(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isLoginTab
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                !isLoginTab
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Error Message Alert (Matches Screen 1 mockup) */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (Sign up only) */}
            {!isLoginTab && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@taskboard.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Must be at least 8 characters.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-3d-btn active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 text-sm mt-5"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLoginTab ? 'Log in' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </Card3D>
      </div>
    </div>
  );
}
