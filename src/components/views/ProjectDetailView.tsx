/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { TaskStatus, TaskPriority, Task, User } from '../../types';
import { 
  Star, Kanban, List, Search, Filter, Plus, Calendar, MessageSquare, 
  Trash2, ChevronDown, ChevronUp, CheckCircle, Clock, Play, User as UserIcon, X, SlidersHorizontal, ArrowUpDown,
  TrendingUp, TrendingDown, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Custom tooltip component for modern chart styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-md text-xs space-y-1.5 min-w-[130px]">
        <p className="font-extrabold text-slate-800 dark:text-slate-100">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500 dark:text-slate-400 capitalize">{entry.name}:</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 ml-auto">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ProjectDetailView: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { 
    projects, 
    tasks, 
    users, 
    starredProjectIds, 
    toggleStarProject,
    updateTask,
    setActiveTaskId,
    setIsCreateTaskOpen,
    showToast,
    theme
  } = useApp();

  // Screen layout render mode ('board' | 'list')
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Analytics panel visibility & chart type configurations
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
  const [chartType, setChartType] = useState<'burnup' | 'burndown'>('burnup');

  // Filter configurations
  const [textSearch, setTextSearch] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Table sorting configurations
  const [sortField, setSortField] = useState<keyof Task | 'commentCount'>('dueDate');
  const [sortAscending, setSortAscending] = useState(true);

  // Drag and drop state management
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDragColumn, setActiveDragColumn] = useState<TaskStatus | null>(null);

  // Validate and retrieve active project
  const project = useMemo(() => {
    return projects.find((p) => p.id === projectId);
  }, [projects, projectId]);

  if (!project) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border rounded-2xl max-w-lg mx-auto opacity-80 space-y-4">
        <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Selected project could not be found</h4>
        <p className="text-xs text-slate-500">It may have been deleted or the pointer address is invalid.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isStarred = starredProjectIds.includes(project.id);
  
  // Associated members
  const projectMembers = useMemo(() => {
    return users.filter(u => project.memberIds.includes(u.id));
  }, [users, project.memberIds]);

  // Dynamic progress timeline data (dates, total scope, completed, remaining, ideal lines)
  const chartData = useMemo(() => {
    // Find all tasks of this project (regardless of query filter, to show true overall progress)
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    if (projectTasks.length === 0) return [];

    // Earliest start date (default to project.createdAt or 2026-05-15)
    let minDate = new Date('2026-05-20');
    if (project.createdAt) {
      const projCreated = new Date(project.createdAt);
      if (!isNaN(projCreated.getTime())) {
        minDate = projCreated;
      }
    }
    
    // Check if any tasks were created earlier
    projectTasks.forEach(t => {
      const tCreated = new Date(t.createdAt);
      if (!isNaN(tCreated.getTime()) && tCreated < minDate) {
        minDate = tCreated;
      }
    });

    // Anchor active system date: 2026-06-02
    const activeDate = new Date('2026-06-02');
    
    // Horizon limit (max dueDate or 7 days in future from active)
    let maxDate = new Date(activeDate);
    maxDate.setDate(maxDate.getDate() + 7);
    
    projectTasks.forEach(t => {
      if (t.dueDate) {
        const dDate = new Date(t.dueDate);
        if (!isNaN(dDate.getTime()) && dDate > maxDate) {
          maxDate = dDate;
        }
      }
    });

    // Guardrail range so we don't spam rendering (e.g. max 50 days)
    const diffTime = Math.abs(maxDate.getTime() - minDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 50) {
      minDate = new Date(activeDate);
      minDate.setDate(minDate.getDate() - 15);
      maxDate = new Date(activeDate);
      maxDate.setDate(maxDate.getDate() + 15);
    }

    const dataPoints = [];
    const curr = new Date(minDate);
    curr.setHours(0,0,0,0);
    
    const endLimit = new Date(maxDate);
    endLimit.setHours(0,0,0,0);

    const totalDays = Math.ceil((endLimit.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;

    let dayIndex = 0;
    while (curr <= endLimit) {
      const dateStr = curr.toISOString().split('T')[0];
      
      // Tasks created on or before this day
      const scopeTasks = projectTasks.filter(t => {
        const cDate = t.createdAt.split('T')[0];
        return cDate <= dateStr;
      });

      // Tasks completed (status === 'done') on or before this day
      const completedTasks = scopeTasks.filter(t => {
        if (t.status !== 'done') return false;
        const uDate = (t.updatedAt || t.createdAt).split('T')[0];
        return uDate <= dateStr;
      });

      const totalScope = scopeTasks.length;
      const completed = completedTasks.length;
      const remaining = totalScope - completed;

      // Ideal Remaining burndown line
      const totalProjectTasks = projectTasks.length;
      const idealRemaining = Math.max(
        0, 
        Number((totalProjectTasks - (totalProjectTasks * (dayIndex / totalDays))).toFixed(1))
      );

      // Short display string: e.g. "May 25"
      const displayMonth = curr.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      dataPoints.push({
        date: dateStr,
        displayDate: displayMonth,
        totalScope,
        completed,
        remaining,
        ideal: idealRemaining
      });

      curr.setDate(curr.getDate() + 1);
      dayIndex++;
    }

    return dataPoints;
  }, [tasks, project.id, project.createdAt]);

  // Query & Chip Filters Filtering Engine
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Must belong to this project
      if (t.projectId !== project.id) return false;

      // Text query search matches title, description, or labels
      if (textSearch.trim()) {
        const query = textSearch.toLowerCase().trim();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesLabels = t.labels ? t.labels.some(l => l.includes(query)) : false;
        if (!matchesTitle && !matchesDesc && !matchesLabels) return false;
      }

      // Assignee id selection match
      if (selectedAssignee && t.assigneeId !== selectedAssignee) return false;

      // Priority match
      if (selectedPriority && t.priority !== selectedPriority) return false;

      return true;
    });
  }, [tasks, project.id, textSearch, selectedAssignee, selectedPriority]);

  // Table Sorted Tasks list
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Safe checks for empty null points
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      // Numbers sort
      return sortAscending 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    });
  }, [filteredTasks, sortField, sortAscending]);

  // Clear filters callback
  const handleClearFilters = () => {
    setTextSearch('');
    setSelectedAssignee('');
    setSelectedPriority('');
    showToast('Filters cleared.', 'info');
  };

  // Table sorting triggers
  const triggerSort = (field: keyof Task | 'commentCount') => {
    if (sortField === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortField(field);
      setSortAscending(true);
    }
  };

  // HTML5 Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDragColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, colStatus: TaskStatus) => {
    e.preventDefault();
    if (activeDragColumn !== colStatus) {
      setActiveDragColumn(colStatus);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    
    if (taskId) {
      const taskObj = tasks.find(t => t.id === taskId);
      if (taskObj && taskObj.status !== targetStatus) {
        updateTask(taskId, { status: targetStatus });
        showToast(`Moved "${taskObj.title}" to ${targetStatus.replace('_', ' ')}`, 'success');
      }
    }
    setDraggedTaskId(null);
    setActiveDragColumn(null);
  };

  // Badges color styles
  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
      case 'medium': return 'bg-blue-105 text-blue-700 dark:bg-blue-950/40 dark:text-blue-350';
      case 'high': return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-955/40 dark:text-red-400';
    }
  };

  return (
    <div id={`project-detail-view-container`} className="space-y-6">
      
      {/* 1. PROJECT META HEADER WITH SWAP MODE SWITCHER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
        {/* Left header titles */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="h-5 w-1.5 rounded-sm shrink-0" style={{ backgroundColor: project.color }} />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-md tracking-tight">
              {project.name}
            </h1>
            
            {/* Project Star Toggle Indicator */}
            <button
              id={`star-project-${project.id}-btn`}
              onClick={() => toggleStarProject(project.id)}
              className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-amber-500 dark:hover:text-amber-405 transition-colors shrink-0 cursor-pointer"
              title={isStarred ? 'Remove from starred' : 'Add to starred'}
            >
              <Star className={`h-4.5 w-4.5 ${isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 pl-4.5 font-medium leading-normal">
            {project.description || 'Develop marketing sprint deliverables and roadmaps.'}
          </p>
        </div>

        {/* Right header toggles: Board / List */}
        <div className="flex items-center gap-3 self-stretch lg:self-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-805">
          {/* Board/List visual toggle buttons */}
          <div className="inline-flex rounded-lg bg-slate-50 dark:bg-slate-950 p-1 select-none text-xs border border-slate-200 dark:border-slate-800">
            <button
              id="viewmode-board-toggle-btn"
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-850 text-[#2563EB] dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-800/50'
                  : 'text-slate-400 dark:text-slate-505 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Board</span>
            </button>
            <button
              id="viewmode-list-toggle-btn"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-extrabold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-850 text-[#2563EB] dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-800/50'
                  : 'text-slate-400 dark:text-slate-505 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          <button
            id="header-create-task-btn"
            onClick={() => setIsCreateTaskOpen(true)}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* SPRINT PROGRESS GRAPH CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden transition-all">
        {/* Toggleable card header */}
        <div 
          onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
          className="flex justify-between items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none hover:bg-slate-50/20 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-[#2563EB]" style={{ color: project.color }} />
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">Sprint Progress Metrics</h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 font-medium tracking-normal mt-0.5">
                {chartType === 'burnup' 
                  ? 'Scope growth vs Completed delivery tracking' 
                  : 'Total workload remaining vs ideal burndown rate'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
            {/* Chart variant toggler */}
            {isAnalyticsOpen && (
              <div className="inline-flex rounded-lg bg-slate-50 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                <button
                  onClick={() => {
                    setChartType('burnup');
                    showToast('Switched to Burn-up tracking.', 'info');
                  }}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    chartType === 'burnup'
                      ? 'bg-white dark:bg-slate-850 text-[#2563EB] dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-800/10'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Burn-up</span>
                </button>
                <button
                  onClick={() => {
                    setChartType('burndown');
                    showToast('Switched to Burn-down tracking.', 'info');
                  }}
                  className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                    chartType === 'burndown'
                      ? 'bg-white dark:bg-slate-850 text-[#2563EB] dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-800/10'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <TrendingDown className="h-3 w-3" />
                  <span>Burn-down</span>
                </button>
              </div>
            )}

            {/* Collapse button */}
            <button 
              onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
              className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {isAnalyticsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible card body */}
        <AnimatePresence initial={false}>
          {isAnalyticsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 py-6">
                {chartData.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-70">
                    <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Sprint Milestones logged yet</h4>
                    <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
                      Add deliverables with due dates to compile sprint tracking visual pathways dynamically.
                    </p>
                  </div>
                ) : (
                  <div className="w-full h-64 md:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'burnup' ? (
                        <AreaChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={project.color || '#3B82F6'} stopOpacity={0.15}/>
                              <stop offset="95%" stopColor={project.color || '#3B82F6'} stopOpacity={0.01}/>
                            </linearGradient>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false}
                            stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} 
                          />
                          <XAxis 
                            dataKey="displayDate" 
                            tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 15 }}
                          />
                          <Area 
                            type="monotone" 
                            name="Total Scope" 
                            dataKey="totalScope" 
                            stroke={project.color || '#3B82F6'} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                          />
                          <Area 
                            type="monotone" 
                            name="Completed" 
                            dataKey="completed" 
                            stroke="#10B981" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorCompleted)" 
                          />
                        </AreaChart>
                      ) : (
                        <LineChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid 
                            strokeDasharray="3 3" 
                            vertical={false}
                            stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} 
                          />
                          <XAxis 
                            dataKey="displayDate" 
                            tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 15 }}
                          />
                          {/* Ideal Burndown Line */}
                          <Line 
                            type="monotone" 
                            name="Ideal Remaining" 
                            dataKey="ideal" 
                            stroke="#94A3B8" 
                            strokeWidth={2} 
                            strokeDasharray="4 4"
                            dot={false}
                          />
                          {/* Actual Remaining Line */}
                          <Line 
                            type="monotone" 
                            name="Current Remaining" 
                            dataKey="remaining" 
                            stroke={project.color || '#F43F5E'} 
                            strokeWidth={2.5}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. DYNAMIC SEARCH & CHIP FILTER RAIL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Search Input bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute inset-y-0 left-3 m-auto h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            id="project-query-search"
            type="search"
            value={textSearch}
            onChange={(e) => setTextSearch(e.target.value)}
            placeholder="Search this project..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-[#64748B] dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] font-medium text-xs transition-all"
          />
        </div>

        {/* Dropdowns logic */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] dark:text-slate-500 shrink-0 font-medium font-sans">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          {/* Filter: Assignee select */}
          <select
            id="filter-assignee-select"
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="">All Assignees</option>
            {projectMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Filter: Priority select */}
          <select
            id="filter-priority-select"
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Clear Filters helper */}
          {(textSearch || selectedAssignee || selectedPriority) && (
            <button
              id="clear-active-filters-btn"
              onClick={handleClearFilters}
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Clear Filter</span>
              <X className="h-3 w-3" />
            </button>
          )}

        </div>
      </div>

      {/* RENDER VIEW 1: DAMPENED KANBAN COLUMN BOARD */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start select-none overflow-x-auto min-h-[50vh]">
          
          {(['todo', 'in_progress', 'in_review', 'done'] as TaskStatus[]).map((colKey) => {
            const colTasks = filteredTasks.filter((t) => t.status === colKey);
            const isColumnTarget = activeDragColumn === colKey;

            const colName = colKey === 'todo' ? 'To Do' 
                          : colKey === 'in_progress' ? 'In Progress' 
                          : colKey === 'in_review' ? 'In Review' 
                          : 'Completed';

            return (
              <div
                key={colKey}
                id={`kanban-column-${colKey}`}
                onDragOver={(e) => handleDragOver(e, colKey)}
                onDrop={(e) => handleDrop(e, colKey)}
                className={`flex flex-col h-full rounded-2xl p-4 bg-slate-50 dark:bg-slate-900 border transition-all duration-150 ${
                  isColumnTarget 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 scale-[0.98]' 
                    : 'border-slate-200 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-900/60'
                }`}
              >
                {/* Column header title */}
                <div className="flex items-center justify-between pb-3 select-none">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`h-2.5 w-2.5 rounded-full select-none ${
                        colKey === 'todo' ? 'bg-slate-500' 
                        : colKey === 'in_progress' ? 'bg-blue-600 animate-pulse' 
                        : colKey === 'in_review' ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                      }`} 
                    />
                    <h2 className="text-xs font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider">{colName}</h2>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-400 bg-slate-200/50 dark:bg-slate-950/60 px-2 py-0.5 rounded-full shrink-0">
                    {colTasks.length}
                  </span>
                </div>

                {/* Vertical lists drawer portal */}
                <div className="flex-1 space-y-3 min-h-[400px]">
                  {colTasks.length === 0 ? (
                    <div className="h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-8 text-center flex flex-col justify-center items-center opacity-65">
                      <SlidersHorizontal className="h-5 w-5 text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">No tasks here</p>
                      <p className="text-[9px] text-slate-400 max-w-[140px] mt-0.5 whitespace-normal">Drag assignments here or add new cards.</p>
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const cardAssignee = users.find(u => u.id === t.assigneeId);
                      const isOverdue = t.status !== 'done' && t.dueDate && new Date(t.dueDate + 'T23:59:59Z') < new Date('2026-06-02');

                      return (
                        <div
                          key={t.id}
                          id={`board-card-${t.id}`}
                          onClick={() => setActiveTaskId(t.id)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, t.id)}
                          onDragEnd={handleDragEnd}
                          className="bg-white dark:bg-slate-950 hover:shadow-md border border-slate-150 dark:border-slate-850 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:border-slate-250 dark:hover:border-slate-750 transition-all space-y-3 group"
                        >
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              {/* Labels */}
                              <div className="flex flex-wrap gap-1">
                                {t.labels && t.labels.slice(0, 2).map(l => (
                                  <span key={l} className="text-[8px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-1 rounded-sm">
                                    #{l}
                                  </span>
                                ))}
                              </div>
                              
                              {/* Priority */}
                              <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${getPriorityBadgeClass(t.priority)}`}>
                                {t.priority}
                              </span>
                            </div>

                            <h4 className="text-xs font-extrabold text-slate-850 dark:text-slate-100 leading-snug group-hover:text-blue-600 transition-colors">
                              {t.title}
                            </h4>
                          </div>

                          {/* Card Footer actions */}
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-850/60 mt-auto">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span className={`${isOverdue ? 'text-red-600 font-bold dark:text-red-400' : ''}`}>{t.dueDate}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Comments count bubble */}
                              {t.commentCount > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                                  <MessageSquare className="h-3 w-3 shrink-0" />
                                  <span>{t.commentCount}</span>
                                </div>
                              )}

                              {/* Assignee initials circle */}
                              {cardAssignee ? (
                                <span 
                                  className="w-5 h-5 rounded-full text-[9px] font-bold leading-5 text-center text-white select-none shrink-0"
                                  style={{ backgroundColor: `hsl(${cardAssignee.name.length * 40}, 65%, 50%)` }}
                                  title={cardAssignee.name}
                                >
                                  {cardAssignee.initials}
                                </span>
                              ) : (
                                <span className="h-5 w-5 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-[10px]">
                                  <UserIcon className="h-2.5 w-2.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}

        </div>
      ) : (
        
        /* RENDER VIEW 2: ORDERABLE SPREADSHEEET TABLE LIST */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden shadow-xs">
          {sortedTasks.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center space-y-4 opacity-75">
              <List className="h-12 w-12 text-slate-350" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching table entries found</h4>
              <p className="text-xs text-slate-500">Simplify your filter parameters or create a brand new task row.</p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Clear Active Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 text-[10px] font-extrabold uppercase tracking-wider select-none">
                    <th 
                      onClick={() => triggerSort('title')}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Task Title</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th 
                      onClick={() => triggerSort('dueDate')}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Due Date</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4">Assignee</th>
                    <th 
                      onClick={() => triggerSort('priority')}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Priority</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4">Status</th>
                    <th 
                      onClick={() => triggerSort('commentCount')}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Discussion</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                  {sortedTasks.map((t) => {
                    const rowAssignee = users.find(u => u.id === t.assigneeId);
                    const isOverdue = t.status !== 'done' && t.dueDate && new Date(t.dueDate + 'T23:59:59Z') < new Date('2026-06-02');

                    return (
                      <tr
                        key={t.id}
                        id={`list-row-${t.id}`}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-950/20 group cursor-pointer transition-colors text-xs font-medium text-slate-877 dark:text-slate-350"
                      >
                        <td 
                          onClick={() => setActiveTaskId(t.id)}
                          className="px-6 py-3.5 font-bold text-slate-900 dark:text-white truncate max-w-sm group-hover:text-blue-600 transition-colors"
                        >
                          {t.title}
                        </td>
                        <td 
                          onClick={() => setActiveTaskId(t.id)}
                          className={`px-6 py-3.5 font-mono ${isOverdue ? 'text-red-650 font-bold dark:text-red-450' : 'text-slate-500'}`}
                        >
                          {t.dueDate || 'N/A'}
                        </td>
                        <td className="px-6 py-3.5">
                          {rowAssignee ? (
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-5.5 h-5.5 rounded-full text-[10px] font-bold leading-5.5 text-center text-white"
                                style={{ backgroundColor: `hsl(${rowAssignee.name.length * 40}, 60%, 50%)` }}
                              >
                                {rowAssignee.initials}
                              </span>
                              <span>{rowAssignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-[9px] font-bold uppercase py-0.5 px-2 rounded ${getPriorityBadgeClass(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 clickable-cell">
                          {/* Inline drop selective selector option */}
                          <select
                            id={`row-status-select-${t.id}`}
                            value={t.status}
                            onChange={(e) => {
                              updateTask(t.id, { status: e.target.value as TaskStatus });
                              showToast(`Changed status to ${e.target.value}`, 'success');
                            }}
                            className="bg-transparent border-0 ring-1 ring-slate-200 hover:ring-slate-300 dark:ring-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer text-slate-800 dark:text-slate-300 focus:outline-hidden"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="in_review">In Review</option>
                            <option value="done">Completed</option>
                          </select>
                        </td>
                        <td 
                          onClick={() => setActiveTaskId(t.id)}
                          className="px-6 py-3.5 font-mono text-slate-500"
                        >
                          {t.commentCount > 0 ? (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-505 dark:text-slate-400">
                              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                              <span>{t.commentCount} posts</span>
                            </div>
                          ) : (
                            <span className="text-slate-350">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
