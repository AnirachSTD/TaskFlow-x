/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User as UserIcon, Settings, Sun, Moon, Bell, Shield, Info, RefreshCw, 
  CheckCircle, ToggleLeft, ToggleRight, Laptop, Sliders
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, theme, setTheme, resetAllData, showToast } = useApp();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [workspaceBrief, setWorkspaceBrief] = useState(false);

  if (!currentUser) return null;

  const triggerResetDemoAndGo = () => {
    if (confirm('Are you ABSOLUTELY sure you want to hard reset all tasks? Any mock projects you made will be deleted.')) {
      resetAllData();
      showToast('TaskFlow workspace has been restored.', 'success');
    }
  };

  return (
    <div id="settings-view-panel" className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-150 p-5 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Workspace Preferences</h1>
          <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
            Personalize your TaskFlow visual identity, layout theme, and automated notify rosters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN METRICS PROFILE SUMMARY (1 col) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-xs select-none">
          <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-slate-850">
            <UserIcon className="h-4.5 w-4.5 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">My Profile Shell</h3>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <span className="w-16 h-16 rounded-3xl bg-blue-600 border-4 border-white dark:border-slate-800 text-xl font-bold leading-[64px] text-center text-white shrink-0 shadow-lg">
              {currentUser.initials}
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{currentUser.name}</h4>
              <p className="text-xs text-slate-500 font-medium">{currentUser.email}</p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-350 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Workspace Member
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3.5 text-xs text-slate-655 font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-550">Access Level</span>
              <span className="text-slate-750 dark:text-slate-300 font-bold">Standard Contributor</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-550">Affiliated Domain</span>
              <span className="text-slate-750 dark:text-slate-300 font-mono text-[11px]">taskflow.app</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 dark:text-slate-550 font-medium">Session Status</span>
              <span className="text-emerald-600 dark:text-emerald-450 flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-md font-bold text-[10px]">
                ● ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* CENTER / RIGHT SECTION (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Color Toggles and Dark Theme Options */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-slate-850">
              <Sliders className="h-4.5 w-4.5 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 uppercase tracking-widest">Appearance Presets</h3>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-505 dark:text-slate-455">
                Customize your color contrast. Light theme handles crisp high-contrast day work; dark theme optimizes slate elements for night work.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Mode Select: Light */}
                <button
                  id="theme-light-card-btn"
                  onClick={() => {
                    setTheme('light');
                    showToast('White slate light mode loaded.', 'info');
                  }}
                  className={`p-4 border text-left rounded-2xl flex items-center justify-between gap-4 select-none hover:-translate-y-0.5 transition-all text-sm font-bold cursor-pointer ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50/25 ring-2 ring-blue-500/10'
                      : 'border-slate-150 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-755 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-200. flex items-center justify-center rounded-xl">
                      <Sun className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-150 leading-tight">Crisp Light Slate</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium mt-0.5 leading-none">Modern crisp workspace</p>
                    </div>
                  </div>
                  {theme === 'light' && <CheckCircle className="h-4.5 w-4.5 text-blue-600 shrink-0 select-none animate-pulse" />}
                </button>

                {/* Mode Select: Dark */}
                <button
                  id="theme-dark-card-btn"
                  onClick={() => {
                    setTheme('dark');
                    showToast('Cosmic slate dark mode loaded.', 'info');
                  }}
                  className={`p-4 border text-left rounded-2xl flex items-center justify-between gap-4 select-none hover:-translate-y-0.5 transition-all text-sm font-bold cursor-pointer ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-955/20 text-white ring-2 ring-blue-500/10'
                      : 'border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-755 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-200. flex items-center justify-center rounded-xl">
                      <Moon className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-150 leading-tight border-b-transparent">Cosmic Slate Dark</h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium mt-0.5 leading-none">Warm off-black shadows</p>
                    </div>
                  </div>
                  {theme === 'dark' && <CheckCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 select-none animate-pulse" />}
                </button>

              </div>
            </div>
          </div>

          {/* Section: Email Alerts mock checkboxes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-xs select-none">
            <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100 dark:border-slate-850">
              <Bell className="h-4.5 w-4.5 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 uppercase tracking-widest">Notification Channels</h3>
            </div>

            <div className="space-y-4 pt-1.5 text-xs text-slate-700 dark:text-slate-350 font-semibold">
              
              {/* Alert 1 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Synchronized Task Alerts</h4>
                  <p className="text-[11px] text-slate-450 dark:text-slate-500 font-medium leading-tight">Notify me as soon as a manager assigns a task card to my profile.</p>
                </div>
                <button
                  id="toggle-task-alert-btn"
                  onClick={() => setTaskAlerts(!taskAlerts)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {taskAlerts ? <ToggleRight className="h-7 w-7 text-blue-600" /> : <ToggleLeft className="h-7 w-7" />}
                </button>
              </div>

              {/* Alert 2 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Email Comment Summaries</h4>
                  <p className="text-[11px] text-slate-450 dark:text-slate-500 font-medium leading-tight">Trigger emails when collaborators post inquiries or comments to checklists.</p>
                </div>
                <button
                  id="toggle-email-alert-btn"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {emailAlerts ? <ToggleRight className="h-7 w-7 text-blue-600" /> : <ToggleLeft className="h-7 w-7" />}
                </button>
              </div>

              {/* Alert 3 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Daily Workspace Digests</h4>
                  <p className="text-[11px] text-slate-450 dark:text-slate-500 font-medium leading-tight">Weekly email summary containing overdue statistics and milestone ratios.</p>
                </div>
                <button
                  id="toggle-workspace-brief-btn"
                  onClick={() => setWorkspaceBrief(!workspaceBrief)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {workspaceBrief ? <ToggleRight className="h-7 w-7 text-blue-600" /> : <ToggleLeft className="h-7 w-7" />}
                </button>
              </div>

            </div>
          </div>

          {/* Section: Diagnostic hard database resets */}
          <div className="p-5 border border-red-155 bg-rose-50/30 dark:bg-red-955/10 border-red-200/50 dark:border-red-950 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-xs font-extrabold text-red-750 dark:text-red-400 flex items-center gap-1">
                <RefreshCw className="h-4 w-4 animate-spin-reverse text-red-500" /> Urgent: Hard Restore Data
              </h4>
              <p className="text-[11px] font-medium text-slate-505 dark:text-slate-405 leading-relaxed max-w-sm">
                Need original templates back? Erase all custom comments, projects edits, and reset demo states to seed standard mocks.
              </p>
            </div>
            
            <button
              id="settings-database-reset-btn"
              onClick={triggerResetDemoAndGo}
              type="button"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm hover:scale-103 transition-transform cursor-pointer shrink-0"
            >
              Reset Database
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
