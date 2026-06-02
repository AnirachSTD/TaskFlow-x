/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion } from 'motion/react';

export const SignupView: React.FC = () => {
  const { signup } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Preferred name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid work email');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    signup(name.trim(), email.trim().toLowerCase());
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
            Get Started on TaskFlow
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Create an account to manage team sprints and tasks pipelines.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/35 border border-red-100 dark:border-red-900/30 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-655 dark:text-slate-350 uppercase tracking-wide">
              Full Name
            </label>
            <input
              id="signup-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Sara Okafor"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-650 transition-all sm:text-sm shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-655 dark:text-slate-350 uppercase tracking-wide">
              Work Email
            </label>
            <input
              id="signup-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. sara@taskflow.app"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-650 transition-all sm:text-sm shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-350 uppercase tracking-wide">
                Password
              </label>
              <input
                id="signup-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Min 6 chars"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-650 transition-all sm:text-sm shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-350 uppercase tracking-wide">
                Confirm
              </label>
              <input
                id="signup-confirm-input"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-650 transition-all sm:text-sm shadow-xs"
              />
            </div>
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-bold rounded-xl shadow-md sm:text-sm shadow-blue-500/10 hover-translate-y-0.5 transition-all cursor-pointer"
          >
            Create Account
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-455 animate-fade-in">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline hover:text-blue-700 font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
