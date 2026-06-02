/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Folder, Plus, Heart, Calendar, FileCheck, CheckCircle2, Star, Users } from 'lucide-react';
import { motion } from 'motion/react';

export const ProjectsIndexView: React.FC = () => {
  const { 
    projects, 
    tasks, 
    users, 
    starredProjectIds, 
    toggleStarProject,
    setIsCreateProjectOpen 
  } = useApp();

  const navigate = useNavigate();

  // Helper metrics calculator
  const projectMetrics = useMemo(() => {
    const stats: { [projId: string]: { total: number; completed: number; rate: number } } = {};

    projects.forEach((p) => {
      const projTasks = tasks.filter((t) => t.projectId === p.id);
      const completed = projTasks.filter((t) => t.status === 'done').length;
      const total = projTasks.length;
      const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
      
      stats[p.id] = { total, completed, rate };
    });

    return stats;
  }, [projects, tasks]);

  return (
    <div id="projects-index-view" className="space-y-6">
      
      {/* Upper header action strip */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-950 dark:text-white leading-tight font-sans tracking-tight">Projects Repository</h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
            Monitor workloads, task margins, and completion speed across your active projects databases.
          </p>
        </div>

        <button
          id="index-create-project-btn"
          onClick={() => setIsCreateProjectOpen(true)}
          className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Grid inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 p-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl mx-auto max-w-md w-full opacity-70">
            <Folder className="h-12 w-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-extrabold mt-4">Draft Your First Project</h4>
            <p className="text-xs text-slate-500 mt-1">Let's create a shared sprint canvas where your team can assign tasks.</p>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="mt-4 px-3.5 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Create Project
            </button>
          </div>
        ) : (
          projects.map((p) => {
            const metrics = projectMetrics[p.id] || { total: 0, completed: 0, rate: 0 };
            const isStarred = starredProjectIds.includes(p.id);
            const projectMembers = users.filter((u) => p.memberIds.includes(u.id));

            return (
              <motion.div
                key={p.id}
                id={`index-proj-card-${p.id}`}
                whileHover={{ y: -2 }}
                className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 hover:border-slate-250 dark:hover:border-slate-700 p-6 rounded-lg flex flex-col justify-between h-56 shadow-sm group"
              >
                {/* Accent brand strip top */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg select-none" style={{ backgroundColor: p.color }} />

                {/* Card Top: Title description and star */}
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between items-start gap-4">
                    <h2 
                      onClick={() => navigate(`/project/${p.id}`)}
                      className="text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer group-hover:text-blue-600 transition-colors"
                    >
                      {p.name}
                    </h2>
                    
                    {/* Star Project Fast Action toggle */}
                    <button
                      id={`index-star-btn-${p.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarProject(p.id);
                      }}
                      className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md text-slate-350 hover:text-amber-500 transition-colors cursor-pointer shrink-0"
                    >
                      <Star className={`h-4.5 w-4.5 ${isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-xs text-[#64748B] dark:text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
                    {p.description || 'Sprint deliverables, task flow checklists, and QA releases.'}
                  </p>
                </div>

                {/* Card middle: Task Completion counts */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400 flex items-center gap-1">
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Progression Pipeline</span>
                    </span>
                    <span className="text-slate-600 dark:text-slate-350 font-mono">
                      {metrics.completed} / {metrics.total} ({metrics.rate}%)
                    </span>
                  </div>

                  {/* Completion Meter progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${metrics.rate}%`, backgroundColor: p.color }}
                    />
                  </div>
                </div>

                {/* Card Bottom: Member initials list and fast links */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 select-none">
                  {/* Avatars Overlapping initials group */}
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {projectMembers.slice(0, 5).map((m) => (
                      <span
                        key={m.id}
                        className="inline-block w-6 h-6 rounded-full text-[10px] font-bold leading-6 text-center text-white ring-2 ring-white dark:ring-slate-900 select-none shrink-0"
                        style={{ backgroundColor: `hsl(${m.name.length * 40}, 65%, 48%)` }}
                        title={m.name}
                      >
                        {m.initials}
                      </span>
                    ))}
                    {projectMembers.length > 5 && (
                      <span className="w-6 h-6 rounded-full text-[9px] font-bold leading-6 text-center text-slate-500 bg-slate-100 ring-2 ring-white dark:ring-slate-900 shrink-0 select-none">
                        +{projectMembers.length - 5}
                      </span>
                    )}
                  </div>

                  <button
                    id={`enter-project-${p.id}-btn`}
                    onClick={() => navigate(`/project/${p.id}`)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    <span>Pipeline Board</span>
                    <Folder className="h-3.5 w-3.5 ml-1 select-none" />
                  </button>
                </div>

              </motion.div>
            );
          })
        )}
      </div>

    </div>
  );
};
