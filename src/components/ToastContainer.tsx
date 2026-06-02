/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = 'bg-slate-900 text-white';
          let icon = <Info className="h-5 w-5 text-blue-450" />;

          if (toast.type === 'success') {
            bgColor = 'bg-emerald-500 text-white border border-emerald-600/50 shadow-emerald-500/10';
            icon = <CheckCircle className="h-5 w-5 text-white shrink-0" />;
          } else if (toast.type === 'error') {
            bgColor = 'bg-red-500 text-white border border-red-650/50 shadow-red-500/10';
            icon = <AlertCircle className="h-5 w-5 text-white shrink-0" />;
          } else if (toast.type === 'info') {
            bgColor = 'bg-slate-800 text-slate-100 border border-slate-700/50 shadow-slate-950/20';
            icon = <Info className="h-5 w-5 text-blue-400 shrink-0" />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg ${bgColor} backdrop-blur-md`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium leading-snug">{toast.message}</span>
              </div>
              <button
                id={`toast-close-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
