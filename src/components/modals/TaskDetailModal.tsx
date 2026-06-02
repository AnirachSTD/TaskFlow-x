/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskStatus, TaskPriority, User } from '../../types';
import { 
  X, Calendar, AlertTriangle, User as UserIcon, Tag, 
  MessageSquare, Trash2, Edit3, Check, Play, FileText, Folder
} from 'lucide-react';
import { motion } from 'motion/react';

interface TaskDetailModalProps {
  isOpen: boolean;
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, taskId, onClose }) => {
  const { 
    tasks, 
    projects, 
    users, 
    comments, 
    currentUser, 
    updateTask, 
    deleteTask, 
    addComment,
    showToast
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const task = tasks.find((t) => t.id === taskId);
  const project = task ? projects.find((p) => p.id === task.projectId) : null;
  const assignee = task ? users.find((u) => u.id === task.assigneeId) : null;

  // Set local state when editing is toggled or task changes
  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description);
    }
    setIsEditingText(false);
  }, [task, taskId]);

  if (!isOpen || !task) return null;

  const projectMembers = project 
    ? users.filter((u) => project.memberIds.includes(u.id))
    : users;

  const taskComments = comments.filter((c) => c.taskId === task.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Action: Add comment
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(task.id, commentText.trim());
    setCommentText('');
    showToast('Comment added.', 'success');
  };

  // Action: Inline textual edits save
  const handleSaveTextEdits = () => {
    if (!editTitle.trim()) {
      showToast('Title cannot be empty', 'error');
      return;
    }
    updateTask(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim()
    });
    setIsEditingText(false);
    showToast('Task details updated.', 'success');
  };

  // Action: Add Label
  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const labels = task.labels || [];
    if (labels.includes(newLabel.toLowerCase().trim())) {
      setNewLabel('');
      return;
    }

    updateTask(task.id, {
      labels: [...labels, newLabel.toLowerCase().trim()]
    });
    setNewLabel('');
  };

  // Action: Remove Label
  const handleRemoveLabel = (labelToRemove: string) => {
    updateTask(task.id, {
      labels: task.labels.filter(l => l !== labelToRemove)
    });
  };

  // Action: Delete Task
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task? This is irreversible.')) {
      deleteTask(task.id);
      onClose();
    }
  };

  // Get status color representation
  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'in_progress': return 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-950/40 dark:text-blue-350';
      case 'in_review': return 'bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
      case 'done': return 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    }
  };

  // Get priority colors representation
  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800';
      case 'medium': return 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50';
      case 'high': return 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50';
      case 'urgent': return 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        id="task-detail-backdrop"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Main Drawer Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-900 shadow-2xl rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-slate-200/60 dark:border-slate-850 z-10"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-700 dark:bg-slate-850 dark:text-slate-350">
              {project?.name || 'No Project'}
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">ID: {task.id}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              id="detail-delete-task-btn"
              onClick={handleDelete}
              title="Delete Task"
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              id="detail-close-btn"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Interior Two-Region Layout Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-150 dark:divide-slate-850">
          
          {/* REGION 1: FIELDS & METADATA (Left 3 cols) */}
          <div className="md:col-span-3 p-6 overflow-y-auto space-y-6">
            
            {/* Title & Description Section */}
            <div>
              {isEditingText ? (
                <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <input
                    id="edit-title-input"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-lg font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    id="edit-desc-textarea"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe this task..."
                    className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      id="cancel-text-edit-btn"
                      onClick={() => {
                        setEditTitle(task.title);
                        setEditDescription(task.description);
                        setIsEditingText(false);
                      }}
                      className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      id="save-text-edit-btn"
                      onClick={handleSaveTextEdits}
                      className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Check className="h-3 w-3" /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight pr-8">
                      {task.title}
                    </h2>
                    <button
                      id="toggle-edit-mode-btn"
                      onClick={() => setIsEditingText(true)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2.5 text-sm font-normal text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap min-h-12 bg-slate-50/45 dark:bg-slate-950/10 p-3 rounded-lg border border-slate-55 dark:border-slate-850/40">
                    {task.description || <em className="text-slate-400 dark:text-slate-600">No description provided. Click the edit icon to add details.</em>}
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Grid Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
              {/* Field: Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1">
                  <Play className="h-3 w-3" /> Status
                </label>
                <select
                  id="detail-status-select"
                  value={task.status}
                  onChange={(e) => {
                    updateTask(task.id, { status: e.target.value as TaskStatus });
                    showToast(`Updated status to "${e.target.value.replace('_', ' ')}"`, 'success');
                  }}
                  className={`w-full text-xs font-semibold px-2 px-3 py-2 rounded-xl border border-transparent transition-all focus:outline-hidden ${getStatusBadgeClass(task.status)}`}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Field: Priority */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Priority
                </label>
                <select
                  id="detail-priority-select"
                  value={task.priority}
                  onChange={(e) => {
                    updateTask(task.id, { priority: e.target.value as TaskPriority });
                    showToast(`Updated task priority to "${e.target.value}"`, 'info');
                  }}
                  className={`w-full text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-transparent focus:outline-hidden ${getPriorityBadgeClass(task.priority)}`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Field: Assignee */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1">
                  <UserIcon className="h-3 w-3" /> Assignee
                </label>
                <select
                  id="detail-assignee-select"
                  value={task.assigneeId || ''}
                  onChange={(e) => {
                    const nextId = e.target.value || null;
                    const nextAssignee = nextId ? users.find((u) => u.id === nextId) : null;
                    updateTask(task.id, { assigneeId: nextId });
                    showToast(nextAssignee ? `Assigned to ${nextAssignee.name}` : 'Unassigned task', 'success');
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field: Due Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Due Date
                </label>
                <input
                  id="detail-due-date-input"
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => {
                    updateTask(task.id, { dueDate: e.target.value });
                    showToast(`Updated deadline for work.`, 'info');
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Labels Manager Block */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
              <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase flex items-center gap-1 mb-2.5">
                <Tag className="h-3 w-3" /> Labels
              </label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {task.labels && task.labels.map((item) => (
                  <span
                    key={item}
                    id={`label-tag-${item}`}
                    className="group select-none inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-800"
                  >
                    #{item}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(item)}
                      className="hover:text-red-500 rounded-full cursor-pointer ml-1 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                
                <form onSubmit={handleAddLabel} className="inline-flex">
                  <input
                    id="add-label-input"
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="+ Label"
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border border-dashed border-slate-300 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-0 max-w-20"
                  />
                </form>
              </div>
            </div>

          </div>

          {/* REGION 2: COMMENTS THREAD & COMPOSER (Right 2 cols) */}
          <div className="md:col-span-2 flex flex-col h-full overflow-hidden bg-slate-50/40 dark:bg-slate-900/40">
            
            {/* Context Header */}
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/80">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Task Discussion ({taskComments.length})
              </h4>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {taskComments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-60">
                  <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-755 stroke-1" />
                  <p className="text-xs font-semibold text-slate-550 dark:text-slate-400">No discussion yet</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-550 max-w-[200px]">Be the first to post comments or questions details about this task.</p>
                </div>
              ) : (
                taskComments.map((com) => {
                  const author = users.find((u) => u.id === com.authorId);
                  const isMe = currentUser && author?.id === currentUser.id;
                  
                  return (
                    <div key={com.id} className="flex gap-2.5 items-start">
                      {/* Initials avatar */}
                      <span className="w-7 h-7 rounded-full text-xs font-bold leading-7 text-center text-white shrink-0 select-none bg-blue-600 dark:bg-blue-755">
                        {author?.initials || 'AW'}
                      </span>
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-semibold text-slate-850 dark:text-slate-200">
                            {author?.name || 'Unknown User'}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {new Date(com.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 overflow-hidden break-words font-normal leading-relaxed shadow-xs">
                          {com.body}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Composer */}
            <div className="p-4 border-t border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900/80">
              <form onSubmit={handleSendComment} className="flex items-end gap-2">
                <textarea
                  id="comment-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ask a question or leave updates..."
                  rows={2}
                  className="flex-1 min-h-12 max-h-24 p-2.5 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 resize-none font-normal"
                />
                <button
                  id="send-comment-btn"
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3.5 py-2.5 bg-blue-650 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-650 text-white font-semibold rounded-xl text-xs transition-colors shrink-0"
                >
                  Send
                </button>
              </form>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
};
