/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Task, Comment, ToastMessage, TaskStatus, TaskPriority } from '../types';
import { mockUsers, mockProjects, mockTasks, mockComments } from '../data/mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  projects: Project[];
  tasks: Task[];
  comments: Comment[];
  theme: 'light' | 'dark';
  toasts: ToastMessage[];
  starredProjectIds: string[];
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  login: (email: string) => boolean;
  signup: (name: string, email: string) => void;
  logout: () => void;
  createProject: (name: string, description: string, color: string) => Project;
  createTask: (task: Omit<Task, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (taskId: string, updatedFields: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addComment: (taskId: string, body: string) => void;
  toggleStarProject: (projectId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  resetAllData: () => void;
  
  // Global modal handlers
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  isCreateProjectOpen: boolean;
  setIsCreateProjectOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial data from localStorage if exists, otherwise use mocks
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('taskflow_current_user');
    return saved ? JSON.parse(saved) : mockUsers[0]; // Authenticate u1 (Anira Wong) by default per context shape
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('taskflow_users');
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('taskflow_projects');
    return saved ? JSON.parse(saved) : mockProjects;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : mockTasks;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('taskflow_comments');
    return saved ? JSON.parse(saved) : mockComments;
  });

  const [starredProjectIds, setStarredProjectIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('taskflow_starred_projects');
    return saved ? JSON.parse(saved) : ['p1']; // website redesign as default starred
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('taskflow_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Global modal triggers state
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Sychronize with localStorage whenever states change
  useEffect(() => {
    localStorage.setItem('taskflow_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('taskflow_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('taskflow_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('taskflow_starred_projects', JSON.stringify(starredProjectIds));
  }, [starredProjectIds]);

  useEffect(() => {
    localStorage.setItem('taskflow_theme', theme);
    // Apply class to document element for Tailwind dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Toast notifications trigger
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth functions
  const login = (email: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      showToast(`Welcome back, ${user.name}!`, 'success');
      return true;
    } else {
      // Create off-shelf demo login for ease of testing
      const parts = email.split('@');
      const name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'US';
      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substring(2, 9),
        name: name,
        email: email,
        avatarUrl: null,
        initials: initials
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      showToast(`Welcome to TaskFlow, ${name}!`, 'success');
      return true;
    }
  };

  const signup = (name: string, email: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'TF';
    const newUser: User = {
      id: 'u_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      avatarUrl: null,
      initials
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast(`Account created! Welcoming ${name}..`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Signed out successfully.', 'info');
  };

  // Project functions
  const createProject = (name: string, description: string, color: string) => {
    const newProject: Project = {
      id: 'p_' + Math.random().toString(36).substring(2, 9),
      name,
      description,
      color,
      memberIds: currentUser ? [currentUser.id] : ['u1'], // Creator is a member
      createdAt: new Date().toISOString()
    };
    setProjects((prev) => [newProject, ...prev]);
    showToast(`Project "${name}" created successfully!`, 'success');
    return newProject;
  };

  // Task functions
  const createTask = (taskData: Omit<Task, 'id' | 'commentCount' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 't_' + Math.random().toString(36).substring(2, 9),
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" added.`, 'success');
    return newTask;
  };

  const updateTask = (taskId: string, updatedFields: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            ...updatedFields,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setComments((prev) => prev.filter((c) => c.taskId !== taskId));
    showToast(`Task "${taskToDelete?.title || 'Selected task'}" deleted.`, 'info');
  };

  // Comment functions
  const addComment = (taskId: string, body: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      taskId,
      authorId: currentUser.id,
      body,
      createdAt: new Date().toISOString()
    };

    setComments((prev) => [...prev, newComment]);
    
    // Update task's denormalized comment count
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            commentCount: t.commentCount + 1,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      })
    );
  };

  // Star projects helper
  const toggleStarProject = (projectId: string) => {
    setStarredProjectIds((prev) => {
      const isStarred = prev.includes(projectId);
      if (isStarred) {
        showToast('Removed from starred projects.', 'info');
        return prev.filter((id) => id !== projectId);
      } else {
        showToast('Added to starred projects!', 'success');
        return [...prev, projectId];
      }
    });
  };

  const setTheme = (themeMode: 'light' | 'dark') => {
    setThemeState(themeMode);
  };

  const resetAllData = () => {
    localStorage.clear();
    setCurrentUser(mockUsers[0]);
    setUsers(mockUsers);
    setProjects(mockProjects);
    setTasks(mockTasks);
    setComments(mockComments);
    setStarredProjectIds(['p1']);
    setThemeState('light');
    showToast('Application reset to default demo mock data.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        tasks,
        comments,
        theme,
        toasts,
        starredProjectIds,
        globalSearchQuery,
        setGlobalSearchQuery,
        showToast,
        removeToast,
        login,
        signup,
        logout,
        createProject,
        createTask,
        updateTask,
        deleteTask,
        addComment,
        toggleStarProject,
        setTheme,
        resetAllData,
        
        // Modals state
        activeTaskId,
        setActiveTaskId,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        isCreateProjectOpen,
        setIsCreateProjectOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
