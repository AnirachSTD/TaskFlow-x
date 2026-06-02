/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, Folder, Star, Settings, LogOut, ChevronLeft, ChevronRight, 
  Menu, X, Sparkles, FolderOpen, Heart, Landmark, Plus
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  onOpenCreateProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
  onOpenCreateProject
}) => {
  const { currentUser, logout, projects, starredProjectIds, tasks } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser) return null;

  const starredProjects = projects.filter(p => starredProjectIds.includes(p.id));

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const taskRatio = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'All Projects', path: '/projects', icon: <FolderOpen className="h-5 w-5" /> },
    { name: 'Workspace Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-[#E2E8F0] dark:border-slate-800 text-slate-850 dark:text-slate-100 select-none">
      {/* Upper Content */}
      <div className="flex-1 overflow-y-auto py-6 px-4 whitespace-nowrap scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        
        {/* Brand Header */}
        <div className={`flex items-center justify-between mb-8 px-1 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0 animate-fade-in">
              TF
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-base tracking-tight text-[#0F172A] dark:text-white">
                TaskFlow
              </span>
            )}
          </div>
          
          {/* Desktop Toggle Button */}
          {!isCollapsed && (
            <button
              id="sidebar-collapse-btn-desktop"
              onClick={() => setIsCollapsed(true)}
              className="hidden lg:block p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Primary Action Button (Add project fast) */}
        {!isCollapsed ? (
          <button
            id="sidebar-add-project-btn"
            onClick={onOpenCreateProject}
            className="w-full flex items-center justify-center gap-2 mb-6 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Create Project</span>
          </button>
        ) : (
          <button
            id="sidebar-add-project-btn-collapsed"
            onClick={onOpenCreateProject}
            title="Create Project"
            className="mx-auto flex items-center justify-center mb-6 h-8 w-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg shadow-sm select-none hover:scale-105 transition-transform cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}

        {/* Primary Routing Section */}
        <div className="space-y-1">
          <p className={`text-[10px] font-extrabold text-[#64748B] dark:text-slate-500 tracking-widest uppercase mb-2 px-2 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? 'Nav' : 'Main Menu'}
          </p>
          {navItems.map((item) => (
            <NavLink
              id={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#EFF6FF] dark:bg-blue-950/20 text-[#2563EB] dark:text-blue-400'
                    : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                } ${isCollapsed ? 'justify-center px-1' : ''}`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* Starred Projects Section */}
        <div className="mt-8">
          <div className={`flex items-center justify-between mb-2 px-2 text-[#64748B] dark:text-slate-500 ${isCollapsed ? 'justify-center' : ''}`}>
            <p className="text-[10px] font-extrabold tracking-widest uppercase">
              {isCollapsed ? '*' : 'Favorites'}
            </p>
            {!isCollapsed && <Heart className="h-3 w-3 text-red-500 fill-red-500" />}
          </div>
          
          <div className="space-y-1">
            {starredProjects.length === 0 ? (
              !isCollapsed && (
                <p className="text-[11px] font-normal text-slate-400 dark:text-slate-500 px-2 leading-relaxed italic whitespace-normal">
                  Star projects to highlight them here.
                </p>
              )
            ) : (
              starredProjects.map((p) => (
                <NavLink
                  id={`starred-link-${p.id}`}
                  key={p.id}
                  to={`/project/${p.id}`}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white'
                        : 'text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  title={p.name}
                >
                  <span
                    className="h-2 w-2 rounded-full ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 shrink-0 select-none"
                    style={{ backgroundColor: p.color, ringColor: p.color }}
                  />
                  {!isCollapsed && (
                    <span className="truncate max-w-[130px] font-medium">{p.name}</span>
                  )}
                </NavLink>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Lower Profile Content & Progress box */}
      <div className="p-4 border-t border-[#E2E8F0] dark:border-slate-800 bg-[#F8FAFC]/55 dark:bg-[#0F172A]/20">
        
        {/* Dynamic capacity or storage used task info card */}
        {!isCollapsed && (
          <div className="mb-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-605 dark:text-slate-400">Tasks Completed</p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-300" style={{ width: `${taskRatio}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">
              {doneTasks} of {totalTasks} ({taskRatio}%)
            </p>
          </div>
        )}

        {!isCollapsed ? (
          <div className="space-y-3 pt-1 border-t border-slate-150 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-lg bg-[#2563EB] text-xs font-bold leading-8 text-center text-white shrink-0 select-none border border-slate-100 dark:border-slate-800 shadow-xs">
                {currentUser.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-[#64748B] dark:text-slate-400 truncate mt-0.5 leading-none">{currentUser.email}</p>
              </div>
            </div>
            
            <button
              id="sidebar-logout-btn"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-red-950/20 text-[#64748B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-red-405 border border-slate-200 dark:border-slate-805 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span>SIGN OUT</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <span 
              onClick={() => navigate('/settings')}
              className="w-8 h-8 rounded-lg bg-[#2563EB] text-xs font-semibold leading-8 text-center text-white select-none shrink-0 cursor-pointer border border-transparent shadow shadow-slate-900/10 hover:scale-105 transition-transform"
              title="View settings"
            >
              {currentUser.initials}
            </span>
            <button
              id="sidebar-logout-collapsed-btn"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-[#64748B] hover:text-red-650 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Mobile Hamburger drawer layout toggle */}
      <div className={`md:hidden fixed inset-0 z-40 flex lg:hidden ${isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Backdrop filter */}
        <div
          id="mobile-sidebar-backdrop"
          className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-350 ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileOpen(false)}
        />
        
        {/* Mobile drawer panel content */}
        <div
          id="mobile-sidebar-drawer"
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 transition-transform duration-350 ease-out z-10 shadow-2xl ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-2 right-2 p-2">
            <button
              id="close-mobile-nav-btn"
              onClick={() => setIsMobileOpen(false)}
              className="p-1 text-slate-400 hover:text-white bg-slate-800/10 hover:bg-slate-800/30 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {sidebarContent}
        </div>
      </div>

      {/* 2. Desktop standard view sidebar */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:block transition-all duration-300 select-none ease-in-out shrink-0 h-screen sticky top-0 ${
          isCollapsed ? 'w-[72px]' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
