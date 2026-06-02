/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from './ToastContainer';
import { CreateTaskModal } from './modals/CreateTaskModal';
import { CreateProjectModal } from './modals/CreateProjectModal';
import { TaskDetailModal } from './modals/TaskDetailModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    currentUser, 
    activeTaskId, 
    setActiveTaskId,
    isCreateTaskOpen, 
    setIsCreateTaskOpen,
    isCreateProjectOpen, 
    setIsCreateProjectOpen 
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Responsive boundary adjustments
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // At < 1024px, auto-collapse sidebar to icon rail
      if (width < 1024 && width >= 768) {
        setIsSidebarCollapsed(true);
      } else if (width >= 1024) {
        setIsSidebarCollapsed(false);
      }
      
      // Close mobile off-canvas drawer on desktop screens
      if (width >= 768) {
        setIsMobileNavOpen(false);
      }
    };

    // Run once on load and attach listener
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Safeguard: Force login state if accessing app pages anonymously
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  
  if (!currentUser) {
    if (!isAuthPage) {
      return <Navigate to="/login" replace />;
    }
    // Render full width container for auth pages
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center text-slate-900 dark:text-slate-100 transition-colors">
        {children}
        <ToastContainer />
      </div>
    );
  }

  // If user is logged in, and tries to land on login/signup, redirect to dashboard
  if (isAuthPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div id="taskflow-app-container" className="min-h-screen flex bg-slate-55 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      {/* 1. Collapsible & Responsive Sidebar */}
      <Sidebar
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
      />

      {/* 2. Main Content Grid Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header toolbar */}
        <Topbar
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        {/* Scrollable scroll port */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Toast HUD Notification Feed */}
      <ToastContainer />

      {/* Global Validation Modal Triggers */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSuccess={(id) => {
          navigate(`/project/${id}`);
        }}
      />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
      />

      <TaskDetailModal
        isOpen={activeTaskId !== null}
        taskId={activeTaskId}
        onClose={() => setActiveTaskId(null)}
      />
    </div>
  );
};
