/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, FolderPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

const PALETTE_COLORS = [
  { hex: '#2563EB', name: 'Royal Blue' },
  { hex: '#7C3AED', name: 'Amethyst Purple' },
  { hex: '#0891B2', name: 'Teal Cyan' },
  { hex: '#16A34A', name: 'Emerald Green' },
  { hex: '#D97706', name: 'Amber Amber' },
  { hex: '#DC2626', name: 'Crimson Red' },
  { hex: '#EC4899', name: 'Deep Pink' }
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createProject } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PALETTE_COLORS[0].hex);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedColor(PALETTE_COLORS[0].hex);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    if (name.length > 50) {
      setError('Project name must be 50 characters or less');
      return;
    }

    const newProj = createProject(name.trim(), description.trim(), selectedColor);
    onClose();
    if (onSuccess) {
      onSuccess(newProj.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        id="project-modal-backdrop"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 z-10"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-150 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create New Project</h3>
          </div>
          <button
            id="close-create-project-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 tracking-wide uppercase">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="project-name-input"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign, Marketing Campaign"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-650 dark:focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 tracking-wide uppercase">
              Description
            </label>
            <textarea
              id="project-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="In brief, what's our objective default?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-650 dark:focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 tracking-wide uppercase mb-2">
              Brand Accent Color
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c.hex}
                  id={`color-preset-${c.hex}`}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  title={c.name}
                  className={`w-9 h-9 rounded-full relative transition-transform duration-100 shrink-0 select-none ${
                    selectedColor === c.hex
                      ? 'ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900 scale-105'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {selectedColor === c.hex && (
                    <span className="absolute inset-0 m-auto w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 justify-end">
            <button
              id="cancel-create-project-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-950 sm:text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-create-project-btn"
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl sm:text-sm shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-550"
            >
              Create Project
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
