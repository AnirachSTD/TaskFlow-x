/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { Search, SlidersHorizontal, Calendar, Folder, MessageSquare, X, Play, AlertCircle, ArrowUpRight } from 'lucide-react';

export const SearchResultsView: React.FC = () => {
  const { 
    tasks, 
    projects, 
    users, 
    globalSearchQuery, 
    setGlobalSearchQuery,
    setActiveTaskId,
    showToast
  } = useApp();

  // Secondary search filters inside results view
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Filtering Engine
  const matchingTasks = useMemo(() => {
    return tasks.filter((t) => {
      // 1. Text Query scan matching Title, description, tags, or labels
      if (globalSearchQuery.trim()) {
        const query = globalSearchQuery.toLowerCase().trim();
        const inTitle = t.title.toLowerCase().includes(query);
        const inDesc = t.description.toLowerCase().includes(query);
        const inLabels = t.labels ? t.labels.some(l => l.includes(query)) : false;
        
        if (!inTitle && !inDesc && !inLabels) return false;
      }

      // 2. Project filter match
      if (filterProject && t.projectId !== filterProject) return false;

      // 3. Priority filter match
      if (filterPriority && t.priority !== filterPriority) return false;

      // 4. Status filter match
      if (filterStatus && t.status !== filterStatus) return false;

      return true;
    });
  }, [tasks, globalSearchQuery, filterProject, filterPriority, filterStatus]);

  const handleClearAllFilters = () => {
    setGlobalSearchQuery('');
    setFilterProject('');
    setFilterPriority('');
    setFilterStatus('');
    showToast('All search query parameters reset.', 'info');
  };

  const getPriorityColorClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/45 dark:text-blue-300';
      case 'high': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/45 dark:text-amber-300';
      case 'urgent': return 'bg-red-100 text-red-750 dark:bg-red-955/45 dark:text-red-400';
    }
  };

  const getStatusColorClass = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-slate-50 text-slate-655 border border-slate-200 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800';
      case 'in_progress': return 'bg-blue-50 text-blue-750 border border-blue-250/20 dark:bg-blue-955/20 dark:text-blue-350 dark:border-blue-900/50';
      case 'in_review': return 'bg-amber-50 text-amber-750 border border-amber-250/20 dark:bg-amber-955/20 dark:text-amber-300 dark:border-amber-900/50';
      case 'done': return 'bg-emerald-50 text-emerald-700 border border-emerald-250/20 dark:bg-emerald-955/20 dark:text-emerald-405 dark:border-emerald-900/50';
    }
  };

  return (
    <div id="search-results-content" className="space-y-6">
      
      {/* 1. View Header with static stats summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-150 p-5 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Global Workspace Search</h1>
          <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
            {globalSearchQuery.trim() ? (
              <span>Found <span className="font-bold underline">{matchingTasks.length} search matches</span> for text query: <span className="font-mono font-bold">"{globalSearchQuery}"</span></span>
            ) : (
              <span>Scan your entire TaskFlow database pipelines. Type query word inside search toolbar.</span>
            )}
          </p>
        </div>
      </div>

      {/* 2. CHIP FILTERS CONTROLS DRAWER BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row flex-wrap items-center gap-3.5 shadow-xs select-none">
        <span className="text-xs font-bold text-slate-455 flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Narrow scan:</span>
        </span>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Project origin select */}
          <select
            id="search-filter-project"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350 focus:outline-hidden cursor-pointer"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Status Select */}
          <select
            id="search-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-350 focus:outline-hidden cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Completed</option>
          </select>

          {/* Priority Select */}
          <select
            id="search-filter-priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-700 dark:text-slate-350 focus:outline-hidden cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent font-semibold">Urgent</option>
          </select>

          {/* Reset Helper link toggle */}
          {(globalSearchQuery || filterProject || filterPriority || filterStatus) && (
            <button
              id="search-reset-all-btn"
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Reset scan</span>
              <X className="h-3 w-3" />
            </button>
          )}

        </div>
      </div>

      {/* 3. SEARCH MATCHES TABLE LIST INDEX */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {matchingTasks.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto opacity-75">
            <Search className="h-10 w-10 text-slate-350" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching search query entries found</h4>
            <p className="text-xs text-slate-500">Provide more details or change clear filter values to run wide scans.</p>
            <button
              id="empty-search-reset-btn"
              onClick={handleClearAllFilters}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer text-slate-705"
            >
              Clear All Search Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Task Assignment Title</th>
                  <th className="px-6 py-4">Required Due Date</th>
                  <th className="px-6 py-4">Owner Assg</th>
                  <th className="px-6 py-4">Priority Hierarchy</th>
                  <th className="px-6 py-4">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                {matchingTasks.map((t) => {
                  const proj = projects.find(p => p.id === t.projectId);
                  const ass = users.find(u => u.id === t.assigneeId);
                  
                  return (
                    <tr
                      key={t.id}
                      id={`search-task-row-${t.id}`}
                      onClick={() => setActiveTaskId(t.id)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-950/20 group cursor-pointer transition-colors text-xs font-semibold text-slate-800 dark:text-slate-300"
                    >
                      {/* Project identity */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0 select-none" style={{ backgroundColor: proj?.color || '#eee' }} />
                          <span className="truncate max-w-40 font-bold text-slate-900 dark:text-slate-400">{proj?.name || 'Project'}</span>
                        </div>
                      </td>

                      {/* Task title */}
                      <td className="px-6 py-3.5 group-hover:text-blue-600 transition-all font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 dark:text-slate-50 truncate max-w-sm">{t.title}</span>
                          <ArrowUpRight className="h-3 w-3 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                      </td>

                      {/* Due date */}
                      <td className="px-6 py-3.5 text-slate-450 dark:text-slate-500 font-mono">
                        {t.dueDate || 'N/A'}
                      </td>

                      {/* Assignee initials fallback badge */}
                      <td className="px-6 py-3.5">
                        {ass ? (
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-5.2 h-5.2 rounded-full text-[9px] font-extrabold leading-5.2 text-center text-white"
                              style={{ backgroundColor: `hsl(${ass.name.length * 40}, 62%, 50%)` }}
                            >
                              {ass.initials}
                            </span>
                            <span className="truncate max-w-28 text-slate-700 dark:text-slate-400 font-medium">{ass.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded ${getPriorityColorClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>

                      {/* Table Cell Status */}
                      <td className="px-6 py-3.5">
                        <span className={`text-[9px] font-bold uppercase py-0.5 px-2 rounded-sm ${getStatusColorClass(t.status)}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
