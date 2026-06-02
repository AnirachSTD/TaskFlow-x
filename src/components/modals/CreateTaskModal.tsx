/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskStatus, TaskPriority } from '../../types';
import { X, Calendar, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProjectId?: string;
  preselectedStatus?: TaskStatus;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  preselectedProjectId = '',
  preselectedStatus = 'todo'
}) => {
  const { projects, users, createTask } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(preselectedProjectId);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>(preselectedStatus);
  const [dueDate, setDueDate] = useState('');
  
  // Validation errors state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset/populate fields when modal opens/closes or when project is preselected
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setProjectId(preselectedProjectId || (projects[0]?.id || ''));
      setAssigneeId('');
      setPriority('medium');
      setStatus(preselectedStatus || 'todo');
      setDueDate('');
      setErrors({});
    }
  }, [isOpen, preselectedProjectId, preselectedStatus, projects]);

  if (!isOpen) return null;

  // Selected project members
  const activeProject = projects.find((p) => p.id === projectId);
  const eligibleAssignees = activeProject 
    ? users.filter((u) => activeProject.memberIds.includes(u.id))
    : users;

  const handleValidation = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 120) {
      newErrors.title = 'Title must be 120 characters or less';
    }

    if (!projectId) {
      newErrors.projectId = 'Please select a project';
    }

    if (dueDate) {
      const selected = new Date(dueDate + 'T23:59:59'); // end of day local
      const today = new Date();
      today.setHours(0, 0, 0, 0); // start of day local
      
      if (selected < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) {
      // Focus on first invalid field
      const firstError = Object.keys(errors)[0];
      const el = document.getElementById(`field-${firstError}`);
      if (el) el.focus();
      return;
    }

    createTask({
      projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || new Date().toISOString().split('T')[0], // default to standard date if empty
      labels: []
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        id="task-create-backdrop"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in" 
        onClick={onClose} 
      />

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Create New Task</h3>
          </div>
          <button
            id="close-create-task-modal-btn"
            onClick={onClose}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          {/* Title Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              id="field-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g. Audit Broken Links, Design Hero Banner"
              className={`w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-950 text-slate-900 dark:text-white sm:text-sm transition-all focus:outline-hidden focus:ring-2 focus:border-transparent ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-blue-650'
              }`}
            />
            {errors.title && (
              <span className="text-xs font-medium text-red-500 dark:text-red-400 block mt-1">
                {errors.title}
              </span>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Description
            </label>
            <textarea
              id="field-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a short instruction overview or notes..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-650 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Select */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                id="field-projectId"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setAssigneeId(''); // Reset assignee as members belong to project
                  if (errors.projectId) setErrors((prev) => ({ ...prev, projectId: '' }));
                }}
                className={`w-full px-3 py-2 border bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white sm:text-sm focus:outline-hidden focus:ring-2 ${
                  errors.projectId
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-650'
                }`}
              >
                <option value="" disabled>Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <span className="text-xs font-medium text-red-500 dark:text-red-400 block mt-1">
                  {errors.projectId}
                </span>
              )}
            </div>

            {/* Assignee Select */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Assignee
              </label>
              <select
                id="field-assigneeId"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-650"
              >
                <option value="">Unassigned</option>
                {eligibleAssignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Select */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Priority
              </label>
              <select
                id="field-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-650"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                Status
              </label>
              <select
                id="field-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-650"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Due Date
            </label>
            <div className="relative">
              <input
                id="field-dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: '' }));
                }}
                className={`w-full px-4 py-2 border bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white sm:text-sm focus:outline-hidden focus:ring-2 focus:border-transparent ${
                  errors.dueDate
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 dark:border-slate-800 focus:ring-blue-650'
                }`}
              />
            </div>
            {errors.dueDate && (
              <span className="text-xs font-medium text-red-500 dark:text-red-400 block mt-1">
                {errors.dueDate}
              </span>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 justify-end">
            <button
              id="cancel-create-task-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-55 dark:hover:bg-slate-950 sm:text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-create-task-btn"
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl sm:text-sm shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-550"
            >
              Add Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
