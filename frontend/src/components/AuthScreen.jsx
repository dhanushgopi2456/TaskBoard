import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, User, Sparkles, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Card3D from './Card3D';
import { useToast } from './Toast';
import { apiFetch } from '../api';

export default function AuthScreen({
  onLoginSuccess,
  onBackToHome,
  autoDemo = false,
  initialMode = 'login',
}) {
  const { addToast } = useToast();
  const [isLoginTab, setIsLoginTab] = useState(() => initialMode !== 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => (initialMode === 'signup' ? '' : 'demo@taskboard.com'));
  const [password, setPassword] = useState(() => (initialMode === 'signup' ? '' : 'Demo@123'));
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoDemo) {
      setIsLoginTab(true);
      setEmail('demo@taskboard.com');
      setPassword('Demo@123');
      setName('');
      setErrorMessage('');
    } else if (initialMode === 'signup') {
      setIsLoginTab(false);
      setName('');
      setEmail('');
      setPassword('');
      setErrorMessage('');
    } else {
      setIsLoginTab(true);
      setEmail('demo@taskboard.com');
      setPassword('Demo@123');
      setName('');
      setErrorMessage('');
    }
  }, [autoDemo, initialMode]);

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
    addToast({
      type: 'info',
      title: 'Demo Filled',
      message: 'Demo credentials filled. Click "Sign in" to continue!',
    });
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

      addToast({
        type: 'success',
        title: isLoginTab ? 'Welcome back! 👋' : 'Account Created! 🎉',
        message: `Signed in as ${data.user.name}. Let's conquer the day!`,
      });

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password');
      addToast({
        type: 'error',
        title: 'Authentication Error',
        message: err.message || 'Invalid email or password',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Button */}
        {onBackToHome && (
          <motion.button
            type="button"
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </motion.button>
        )}

        {/* Floating 3D Card */}
        <Card3D
          maxTilt={7}
          glowColor="rgba(99, 102, 241, 0.25)"
          className="glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95"
        >
          {/* Logo / Badge */}
          <div className="text-center mb-6">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.3 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-3d-glow mb-3"
            >
              <Sparkles className="w-7 h-7" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              TaskBoard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {isLoginTab ? 'Welcome back! Sign in to access your missions' : 'Create your free account to start organizing tasks'}
            </p>
          </div>

          {/* Quick Demo Login Pill (Shown on Log in tab) */}
          {isLoginTab && (
            <div className="mb-5 flex justify-center">
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleQuickDemoFill}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                Fill Demo Login (demo@taskboard.com)
              </motion.button>
            </div>
          )}

          {/* Tabs: Log in / Register with sliding indicator */}
          <div className="relative flex p-1 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => handleTabSwitch(true)}
              className={`relative flex-1 py-2 text-sm font-bold rounded-xl transition-colors duration-150 z-10 ${
                isLoginTab
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {isLoginTab && (
                <motion.div
                  layoutId="authActiveTab"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-md z-0"
                  transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.15 }}
                />
              )}
              <span className="relative z-10">Log in</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch(false)}
              className={`relative flex-1 py-2 text-sm font-bold rounded-xl transition-colors duration-150 z-10 ${
                !isLoginTab
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {!isLoginTab && (
                <motion.div
                  layoutId="authActiveTab"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-md z-0"
                  transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.15 }}
                />
              )}
              <span className="relative z-10">Register</span>
            </button>
          </div>

          {/* Error Message Alert */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.2 }}
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
            <AnimatePresence>
              {!isLoginTab && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', visualDuration: 0.25, bounce: 0.1 }}
                  className="overflow-hidden"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium"
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
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-3d-btn active:scale-95 transition-all flex items-center justify-center gap-2 text-sm mt-5"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLoginTab ? 'Sign In to Workspace' : 'Create Free Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Quick Switch Between Login and Register */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => handleTabSwitch(!isLoginTab)}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {isLoginTab ? (
                  <span>
                    Don&apos;t have an account?{' '}
                    <strong className="font-bold underline text-indigo-600 dark:text-indigo-400">
                      Register new account
                    </strong>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <strong className="font-bold underline text-indigo-600 dark:text-indigo-400">
                      Log in here
                    </strong>
                  </span>
                )}
              </button>
            </div>
          </form>
        </Card3D>
      </div>
    </div>
  );
}
