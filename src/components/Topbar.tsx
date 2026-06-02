/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Bell, Search, Plus, Menu, User, Settings, LogOut, Sun, Moon, 
  Sparkles, RefreshCw, ChevronDown, Sliders
} from 'lucide-react';

interface TopbarProps {
  onOpenMobileNav: () => void;
  onOpenCreateTask: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileNav,
  onOpenCreateTask,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}) => {
  const { 
    currentUser, 
    logout, 
    globalSearchQuery, 
    setGlobalSearchQuery,
    theme,
    setTheme,
    resetAllData
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Sync/redirect to search route if search query is active
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalSearchQuery(value);
    
    if (value.trim() && location.pathname !== '/search') {
      navigate('/search');
    }
  };

  // Close dropdowns on outside mouse click
  useEffect(() => {
    const clickOutside = (ev: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(ev.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  // Sample static notifications
  const sampleNotifications = [
    { id: 1, title: 'Marcus Reed assigned a task', body: 'Set up navigation stack', time: '10m ago', unread: true },
    { id: 2, title: 'Comment on Website Redesign', body: '"Can we try a darker background?"', time: '2h ago', unread: false }
  ];

  return (
    <header 
      id="app-topbar"
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-800"
    >
      {/* Left side actions */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger toggle */}
        <button
          id="mobile-nav-toggle-btn"
          onClick={onOpenMobileNav}
          className="md:hidden p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Expand rail sidebar toggle */}
        {isSidebarCollapsed && (
          <button
            id="desktop-expand-sidebar-btn"
            onClick={() => setIsSidebarCollapsed(false)}
            className="hidden lg:block p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Expand menu sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="hidden sm:block">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-405 select-none animate-fade-in">
            Workspace Sandbox
          </span>
        </div>
      </div>

      {/* Global search middle block */}
      <div className="flex-1 max-w-sm mx-6">
        <div className="relative">
          <Search className="absolute inset-y-0 left-3 m-auto h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            id="global-search-input"
            type="search"
            value={globalSearchQuery}
            onChange={handleSearchChange}
            placeholder="Search tasks, priorities, tags..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-[#64748B] dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all font-medium"
          />
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-2.5">
        
        {/* Fast Action Create Task Button */}
        <button
          id="topbar-quick-add-task-btn"
          onClick={onOpenCreateTask}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Task</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          id="toggle-dark-mode-topbar"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1.5 text-slate-400 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-805 rounded-lg transition-colors cursor-pointer"
          title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Notifications Button */}
        <div className="relative" ref={notifRef}>
          <button
            id="topbar-notifications-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-805 rounded-lg transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 select-none animate-pulse" />
          </button>

          {/* Interactive Notifications Drawer */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl py-3 text-slate-800 dark:text-slate-200 z-40 overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
              <div className="px-4 pb-2.5 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-505 dark:text-slate-400 tracking-wide uppercase">Workspace Alerts</h4>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-350 px-2 py-0.5 rounded-full">New</span>
              </div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {sampleNotifications.map((notif) => (
                  <div key={notif.id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-950 flex items-start gap-2.5 cursor-pointer`}>
                    <span className={`w-2 h-2 mt-1.5 shrink-0 rounded-full ${notif.unread ? 'bg-blue-650' : 'bg-transparent'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-850 dark:text-slate-100 leading-snug truncate">{notif.title}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{notif.body}</p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-555 block mt-1">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 pt-2.5 text-center">
                <button
                  id="mark-all-notifications-btn"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Dismiss all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="topbar-profile-dropdown-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 focus:outline-hidden group cursor-pointer"
          >
            <span className="w-8 h-8 rounded-full bg-blue-600 text-xs font-bold leading-8 text-center text-white shrink-0 select-none border border-slate-150 shadow-xs group-hover:scale-105 transition-transform">
              {currentUser.initials}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition-colors hidden sm:block" />
          </button>

          {/* Expanded Menu Options */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl py-3 text-slate-800 dark:text-slate-200 z-45 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850 mb-1.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-tight">{currentUser.email}</p>
              </div>
              
              <button
                id="profile-menu-settings-btn"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-2.5 text-left text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-950 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Theme & Account</span>
              </button>

              <button
                id="profile-menu-reset-btn"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (confirm('Restore default tasks and projects data? Your changes will be reverted.')) {
                    resetAllData();
                    navigate('/dashboard');
                  }
                }}
                className="w-full px-4 py-2.5 text-left text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-950 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-slate-400" />
                <span>Reset Demo Data</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-850 my-1.5" />

              <button
                id="profile-menu-logout-btn"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2.5 font-bold transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
