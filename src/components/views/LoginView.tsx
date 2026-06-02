/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ClipboardList, Sparkles, Check, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginView: React.FC = () => {
  const { login, users } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const success = login(email.trim());
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid account details');
    }
  };

  // Safe login for demo purposes
  const handleQuickDemoLogin = (demoEmail: string) => {
    login(demoEmail);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6"
      >
        {/* Brand visual header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-2xl select-none">
            TF
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome to TaskFlow
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Organize work, track pipelines, and ship tasks together.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-650 dark:text-slate-350 uppercase tracking-wide">
              Work Email Address
            </label>
            <input
              id="login-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. anira@taskflow.app"
              autoComplete="email"
              aria-label="Email Address"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-650 transition-all sm:text-sm"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-slate-650 dark:text-slate-350 uppercase tracking-wide">
                Password
              </label>
              <a href="#" className="text-xs text-blue-600 hover:underline hover:text-blue-700 font-semibold">
                Forgot password?
              </a>
            </div>
            <input
              id="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-label="Password"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-650 transition-all sm:text-sm"
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl shadow-md sm:text-sm shadow-blue-500/10 hover-translate-y-0.5 transition-all cursor-pointer"
          >
            Sign In
          </button>
        </form>

        {/* Demo Fast Login Selector Accordion */}
        <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-3">
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
            <Info className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-wider">Fast-track Demo Accs</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {users.slice(0, 4).map((usr) => (
              <button
                id={`demo-user-${usr.id}-btn`}
                key={usr.id}
                type="button"
                onClick={() => handleQuickDemoLogin(usr.email)}
                className="p-2.5 hover:p-3 text-left border border-slate-150 dark:border-slate-800 bg-slate-50/60 hover:bg-blue-50 dark:bg-slate-950/20 dark:hover:bg-slate-900 rounded-xl hover:border-blue-300 dark:hover:border-slate-750 transition-all text-slate-700 dark:text-slate-350 font-semibold cursor-pointer shrink-0 truncate flex flex-col justify-start"
              >
                <span className="font-bold truncate text-[11px]">{usr.name}</span>
                <span className="text-[9px] text-slate-400 truncate mt-0.5 font-mono">{usr.email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Signup Redirect Nav Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-455">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:underline hover:text-blue-700 font-bold">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
