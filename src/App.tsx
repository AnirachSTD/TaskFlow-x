/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';

// View Imports
import { LoginView } from './components/views/LoginView';
import { SignupView } from './components/views/SignupView';
import { DashboardView } from './components/views/DashboardView';
import { ProjectsIndexView } from './components/views/ProjectsIndexView';
import { ProjectDetailView } from './components/views/ProjectDetailView';
import { SearchResultsView } from './components/views/SearchResultsView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            {/* Authenticated routes */}
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/projects" element={<ProjectsIndexView />} />
            <Route path="/project/:id" element={<ProjectDetailView />} />
            <Route path="/search" element={<SearchResultsView />} />
            <Route path="/settings" element={<SettingsView />} />

            {/* Guest auth screens */}
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignupView />} />

            {/* Fallback catcher */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}
