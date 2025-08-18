import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./utils/ProtectedRoute"; 

import LandingPage from './Components/LandingPage';
import LoginPage from './LoginPage/LoginPage';
import SignInPage from './SignInPage/SignInPage';
import RegistrationPending from  './RegistrationLoading/RegistrationPending';

import DispatcherDashboard from './Admin&Dispatcher/DispatcherPage/DispatcherDashboard';

import AdminDashboard from './Admin&Dispatcher/AdminPage/AdminDashboard';
import AdminUserManagement from './Admin&Dispatcher/AdminPage/AdminUserManagement';
import AdminReportsPage from './Admin&Dispatcher/AdminPage/AdminReportsPage';
import AdminReportsPageView from './Admin&Dispatcher/AdminPage/AdminReportsPageView';
import AdminResponseTeam from './Admin&Dispatcher/AdminPage/AdminResponseTeam';
import AdminTeamPageView from "./Admin&Dispatcher/AdminPage/AdminTeamPageView";
import AdminAnnouncement from './Admin&Dispatcher/AdminPage/AdminAnnouncement';
import AdminSettings from './Admin&Dispatcher/AdminPage/AdminSettings';

import ResidentDashboard from './Resident/ResidentDashboard';
import ResidentAnnouncement from './Resident/ResidentAnnouncement';
import ResidentReport from './Resident/ResidentReport';
import ResidentNotification from './Resident/ResidentNotification';
import ResidentHistory from './Resident/ResidentHistory';
import ResidentProfile from './Resident/ResidentProfile';
import ResidentEditProfile from './Resident/ResidentEditProfile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignInPage />} />
        <Route path="/register" element={<RegistrationPending />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/user-management" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminUserManagement /></ProtectedRoute>} />
        <Route path="/admin/emergency-reports" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminReportsPage /></ProtectedRoute>} />
        <Route path="/admin/emergency-reports/:id" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminReportsPageView /></ProtectedRoute>} />
        <Route path="/admin/response-team" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminResponseTeam /></ProtectedRoute>} />
        <Route path="/admin/response-teams/:id" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminTeamPageView /></ProtectedRoute>} />
        <Route path="/admin/announcement" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminAnnouncement /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminSettings /></ProtectedRoute>} />

        {/* Dispatcher */}
        <Route path="/dispatcher" element={<ProtectedRoute allowedRoles={["MDRRMO"]}><DispatcherDashboard /></ProtectedRoute>} />

        {/* Resident */}
        <Route path="/resident" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentDashboard /></ProtectedRoute>} />
        <Route path="/resident/announcement" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentAnnouncement /></ProtectedRoute>} />
        <Route path="/resident/report" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentReport /></ProtectedRoute>} />
        <Route path="/resident/notification" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentNotification /></ProtectedRoute>} />
        <Route path="/resident/history" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentHistory /></ProtectedRoute>} />
        <Route path="/resident/profile" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentProfile /></ProtectedRoute>} />
        <Route path="/resident/edit-profile" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentEditProfile /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
