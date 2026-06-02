/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Task, Project } from '../../types';
import { 
  CheckCircle, Clock, AlertCircle, Play, Archive, Sparkles, Folder, 
  Plus, ChevronRight, Calendar, AlertTriangle, ArrowUpRight, PieChart as PieIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// Custom tooltip for Priority Distribution Pie Chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg shadow-md text-xs space-y-1">
        <p className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name} Priority
        </p>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex justify-between gap-4">
          <span>Tasks:</span> 
          <span className="font-bold text-slate-800 dark:text-slate-100">{data.value}</span>
        </p>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex justify-between gap-4">
          <span>Share:</span> 
          <span className="font-bold text-slate-800 dark:text-slate-100">{data.percent}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    tasks, 
    projects, 
    users, 
    starredProjectIds, 
    toggleStarProject,
    setIsCreateTaskOpen,
    setActiveTaskId
  } = useApp();

  const navigate = useNavigate();

  // Guard safety fallback
  if (!currentUser) return null;

  // Filter tasks assigned to current user
  const myTasks = useMemo(() => {
    return tasks.filter((t) => t.assigneeId === currentUser.id);
  }, [tasks, currentUser.id]);

  // Sort my tasks by impending deadline (so closest is up top)
  const mySortedTasks = useMemo(() => {
    return [...myTasks].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [myTasks]);

  // Projects roster where currentUser belongs
  const myProjects = useMemo(() => {
    return projects.filter((p) => p.memberIds.includes(currentUser.id));
  }, [projects, currentUser.id]);

  // Global counts across My Projects or My Tasks
  const metrics = useMemo(() => {
    const counts = { todo: 0, in_progress: 0, in_review: 0, done: 0 };
    
    // Calculate over all tasks belonging to my projects
    const myProjectIds = myProjects.map(p => p.id);
    const relevantTasks = tasks.filter(t => myProjectIds.includes(t.projectId));

    relevantTasks.forEach((t) => {
      if (t.status in counts) {
        counts[t.status as keyof typeof counts]++;
      }
    });

    return counts;
  }, [tasks, myProjects]);

  // Overdue Tasks: assigned to me, not done, due date < 2026-06-02
  const overdueTasks = useMemo(() => {
    const today = new Date('2026-06-02T00:00:00Z'); // Fixed local current time baseline per metadata
    return mySortedTasks.filter((t) => {
      if (t.status === 'done' || !t.dueDate) return false;
      const targetDate = new Date(t.dueDate + 'T23:59:59Z');
      return targetDate < today;
    });
  }, [mySortedTasks]);

  // Calculates completion rates for project progression bars
  const getProjectCompletionRate = (projId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projId);
    if (projTasks.length === 0) return 0;
    const completedTasks = projTasks.filter((t) => t.status === 'done');
    return Math.round((completedTasks.length / projTasks.length) * 100);
  };

  // Priority Distribution analytics across all tasks of all projects
  const priorityData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, urgent: 0 };
    tasks.forEach((t) => {
      const prio = t.priority;
      if (prio in counts) {
        counts[prio as keyof typeof counts]++;
      }
    });

    const total = counts.low + counts.medium + counts.high + counts.urgent;

    return [
      { name: 'Low', value: counts.low, percent: total > 0 ? Math.round((counts.low / total) * 100) : 0, color: '#10B981' },
      { name: 'Medium', value: counts.medium, percent: total > 0 ? Math.round((counts.medium / total) * 100) : 0, color: '#3B82F6' },
      { name: 'High', value: counts.high, percent: total > 0 ? Math.round((counts.high / total) * 100) : 0, color: '#F59E0B' },
      { name: 'Urgent', value: counts.urgent, percent: total > 0 ? Math.round((counts.urgent / total) * 100) : 0, color: '#EF4444' },
    ].filter(item => item.value > 0);
  }, [tasks]);

  const totalPriorityTasks = useMemo(() => {
    return priorityData.reduce((acc, item) => acc + item.value, 0);
  }, [priorityData]);

  const getPriorityBadgeColor = (prio: string) => {
    switch (prio) {
      case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-955/30 dark:text-blue-300';
      case 'high': return 'bg-amber-100 text-amber-800 dark:bg-amber-955/30 dark:text-amber-300';
      case 'urgent': return 'bg-rose-100 text-rose-800 dark:bg-rose-955/35 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div id="dashboard-view-content" className="space-y-6">
      
      {/* 1. Welcoming Hero Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight font-sans tracking-tight">
            Hello, {currentUser.name}! 🌅
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
            Here's the summary state across your {myProjects.length} synchronized projects. Active date: <span className="font-mono font-bold">June 2, 2026</span>.
          </p>
        </div>
        
        <button
          id="dashboard-new-task-btn"
          onClick={() => setIsCreateTaskOpen(true)}
          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Quick Commit Task</span>
        </button>
      </div>

      {/* 2. Overdue Alerts (High-Impact banner if any) */}
      {overdueTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-rose-50 dark:bg-rose-950/20 border border-rose-150 dark:border-rose-900/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-450 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-rose-200">
                You have {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                These assignments have passed their deadlines without receiving a "Done" submission.
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            {overdueTasks.slice(0, 3).map((t) => (
              <button
                id={`overdue-claim-${t.id}`}
                key={t.id}
                onClick={() => setActiveTaskId(t.id)}
                className="px-3 py-1.5 bg-white hover:bg-rose-100 dark:bg-slate-900/40 dark:hover:bg-rose-950/30 text-[11px] font-bold rounded-lg border border-rose-250/20 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 transition-all truncate max-w-44 block select-none cursor-pointer"
              >
                {t.title}
              </button>
            ))}
            {overdueTasks.length > 3 && (
              <span className="text-[10px] font-bold text-rose-700 dark:text-slate-400">+{overdueTasks.length - 3} more</span>
            )}
          </div>
        </motion.div>
      )}
      {/* 3. Global Pipeline Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-400">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 tracking-wider uppercase font-sans">To Do</p>
            <h4 className="text-lg font-bold font-mono text-slate-800 dark:text-slate-205 mt-0.5">{metrics.todo}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-[#EFF6FF] dark:bg-blue-955/35 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
            <Play className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 tracking-wider uppercase font-sans">In Progress</p>
            <h4 className="text-lg font-bold font-mono text-blue-650 dark:text-blue-400 mt-0.5">{metrics.in_progress}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-amber-50 dark:bg-amber-955/20 flex items-center justify-center text-amber-600 dark:text-amber-405">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 tracking-wider uppercase font-sans">In Review</p>
            <h4 className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">{metrics.in_review}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-955/25 flex items-center justify-center text-emerald-600 dark:text-emerald-450">
            <CheckCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 tracking-wider uppercase font-sans">Completed</p>
            <h4 className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-450 mt-0.5">{metrics.done}</h4>
          </div>
        </div>

      </div>

    {/* 3.5. Priority Distribution Pie Chart view */}
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-5 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-850">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-955/20 flex items-center justify-center text-[#F59E0B]">
            <PieIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">Priority Distribution</h3>
            <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium tracking-normal mt-0.5">
              Workload allocation spread of High, Medium, Low, and Urgent priorities globally
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-500 block">Total Active Scope</span>
          <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-mono mt-0.5 inline-block">{totalPriorityTasks} Tasks</span>
        </div>
      </div>

      {priorityData.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-70">
          <PieIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No priority metrics computed</h4>
          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
            Register active tasks in your synchronized projects to process live priority distribution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Pie Chart container */}
          <div className="md:col-span-5 h-[180px] sm:h-[200px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Central stat block inside donut */}
            <div className="absolute inset-0 m-auto h-fit w-fit text-center pointer-events-none">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Global</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100 font-mono leading-none">{totalPriorityTasks}</span>
            </div>
          </div>

          {/* List Distribution counts */}
          <div className="md:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {priorityData.map((entry) => (
              <div 
                key={entry.name}
                className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-150/50 dark:border-slate-850/60"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{entry.name}</span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-slate-850 dark:text-slate-100 font-mono">{entry.value}</span>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{entry.percent}%</span>
                </div>
                {/* Indicator bar */}
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full rounded-full" style={{ width: `${entry.percent}%`, backgroundColor: entry.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* 4. Split Layout Center: My Tasks & Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: Assigned To Me Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-455 dark:text-slate-400 tracking-wide uppercase">
              Assigned To Me ({mySortedTasks.length})
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
            {mySortedTasks.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center space-y-2 opacity-70">
                <Archive className="h-10 w-10 text-slate-300 dark:text-slate-700 stroke-1" />
                <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300">Clean slate!</h5>
                <p className="text-xs text-slate-450 dark:text-slate-500 max-w-sm">No tasks assigned to your roster yet. Open active project boards to claim cards.</p>
              </div>
            ) : (
              mySortedTasks.map((t) => {
                const p = projects.find((proj) => proj.id === t.projectId);
                const isOverdue = t.status !== 'done' && t.dueDate && new Date(t.dueDate + 'T23:59:59Z') < new Date('2026-06-02');
                
                return (
                  <div
                    key={t.id}
                    id={`my-task-row-${t.id}`}
                    onClick={() => setActiveTaskId(t.id)}
                    className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-950/30 flex items-center justify-between gap-4 cursor-pointer transition-colors group"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                          style={{ color: p?.color || '#333', backgroundColor: `${p?.color || '#333'}15` }}
                        >
                          {p?.name || 'No project'}
                        </span>
                        
                        {isOverdue && (
                          <span className="text-[9px] font-bold bg-red-100 text-red-750 dark:bg-red-950/40 dark:text-red-400 px-1.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-0.5 select-none shrink-0 animate-pulse">
                            ⚠️ Overdue
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                        {t.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Priority Tag */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getPriorityBadgeColor(t.priority)}`}>
                        {t.priority}
                      </span>
                      
                      {/* Due Date Indicator */}
                      <span className="text-[11px] font-medium text-slate-450 dark:text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{t.dueDate || 'N/A'}</span>
                      </span>

                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-550 transition-colors hidden sm:block" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Projects Summary (2 cols) */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-slate-455 dark:text-slate-400 tracking-wide uppercase">
              My Projects ({myProjects.length})
            </h3>
            
            <button
              id="view-all-projects-fast"
              onClick={() => navigate('/projects')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 hover:underline cursor-pointer"
            >
              <span>View index</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {myProjects.length === 0 ? (
              <div className="p-8 bg-white dark:bg-slate-900 border border-slate-150 rounded-2xl text-center flex flex-col items-center justify-center opacity-75">
                <Folder className="h-8 w-8 text-slate-300" />
                <h5 className="text-xs font-bold text-slate-800 mt-2">No projects</h5>
                <button
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="mt-3 text-xs bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-lg hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            ) : (
              myProjects.map((p) => {
                const compRate = getProjectCompletionRate(p.id);
                const starredOpen = starredProjectIds.includes(p.id);
                const projectMembers = users.filter(u => p.memberIds.includes(u.id));

                return (
                  <div
                    key={p.id}
                    id={`proj-card-${p.id}`}
                    onClick={() => navigate(`/project/${p.id}`)}
                    className="relative bg-white dark:bg-slate-900 hover:shadow-md border border-slate-150 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-750 p-5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-40 group"
                  >
                    {/* Brand color accent strip */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl select-none" style={{ backgroundColor: p.color }} />

                    {/* Header: Title and toggles */}
                    <div className="flex justify-between items-start pl-2">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors max-w-44">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-450 dark:text-slate-500 truncate max-w-[200px]">
                          {p.description || 'Marketing fresh pipeline.'}
                        </p>
                      </div>

                      {/* Fast Launch Indicator */}
                      <span className="h-7 w-7 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>

                    {/* Footer: stack avatars and metrics rate bar */}
                    <div className="space-y-2.5 pl-2 mt-auto">
                      
                      {/* Avatar initials cluster overlap */}
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {projectMembers.slice(0, 4).map((m) => (
                          <span
                            key={m.id}
                            className="inline-block w-6 h-6 rounded-full text-[10px] font-bold leading-6 text-center text-white ring-2 ring-white dark:ring-slate-900 select-none bg-indigo-500 shrink-0"
                            style={{ backgroundColor: `hsl(${m.name.length * 45}, 60%, 50%)` }}
                            title={m.name}
                          >
                            {m.initials}
                          </span>
                        ))}
                        {projectMembers.length > 4 && (
                          <span className="w-6 h-6 rounded-full text-[9px] font-bold leading-6 text-center text-slate-500 bg-slate-100 ring-2 ring-white dark:ring-slate-900 shrink-0 select-none">
                            +{projectMembers.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Progress ratios block */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400 dark:text-slate-500">Task Completion</span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono">{compRate}%</span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${compRate}%`, backgroundColor: p.color }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
