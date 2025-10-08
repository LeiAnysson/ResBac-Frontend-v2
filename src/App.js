import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from "./utils/ProtectedRoute";
import { AuthProvider } from './context/AuthContext';

import LandingPage from './Components/LandingPage';
import LoginPage from './LoginPage/LoginPage';
import SignInPage from './SignInPage/SignInPage';
import RegistrationPending from  './RegistrationLoading/RegistrationPending';

import DispatcherDashboard from './Admin&Dispatcher/DispatcherPage/DispatcherDashboard';
import DispatcherNotifications from './Admin&Dispatcher/DispatcherPage/DispatcherNotifications';

import AdminDashboard from './Admin&Dispatcher/AdminPage/AdminDashboard';
import AdminUserManagement from './Admin&Dispatcher/AdminPage/AdminUserManagement';
import AdminReportsPage from './Admin&Dispatcher/AdminPage/AdminReportsPage';
import AdminReportsPageView from './Admin&Dispatcher/AdminPage/AdminReportsPageView';
import AdminResponseTeam from './Admin&Dispatcher/AdminPage/AdminResponseTeam';
import AdminTeamPageView from "./Admin&Dispatcher/AdminPage/AdminTeamPageView";
import AdminAnnouncement from './Admin&Dispatcher/AdminPage/AdminAnnouncement';
import AdminSettings from './Admin&Dispatcher/AdminPage/AdminSettings';
import AdminCreateTeam from './Admin&Dispatcher/AdminPage/Functionalities/AdminCreateTeam';
import AdminResidencyApproval from './Admin&Dispatcher/AdminPage/Functionalities/ResidentApprovalView';
import AdminCreateUser from './Admin&Dispatcher/AdminPage/Functionalities/AdminCreateUser';
import AdminUserPageView from './Admin&Dispatcher/AdminPage/AdminUserPageView';
import AdminCreateAnnouncement from './Admin&Dispatcher/AdminPage/Functionalities/AdminCreateAnnouncement';

import ResidentDashboard from './Resident/ResidentDashboard';
import ResidentAnnouncement from './Resident/ResidentAnnouncement';
import ResidentReport from './Resident/ResidentReport';
import ResidentNotification from './Resident/ResidentNotification';
import ResidentHistory from './Resident/ResidentHistory';
import ResidentProfile from './Resident/ResidentProfile';
import ResidentEditProfile from './Resident/ResidentEditProfile';
import ResidentCall from './Resident/ResidentCall';
import ResidentWaiting from './Resident/ResidentWaiting';
import ResidentArrived from './Resident/ResidentArrived';
import ResidentComplete from './Resident/ResidentComplete';
import ResidentWitReport from './Resident/ResidentWitReport';

import ResponderDashboard from './Responder/ResponderDashboard';
import ResponderProfile from './Responder/ResponderProfile';
import ResponderEditProfile from './Responder/ResponderEditProfile';
import ResponderNotification from './Responder/ResponderNotification';
import ResponderReports from './Responder/ResponderReports';
import ResponderViewReport from './Responder/ResponderViewReport';

function App() {
  return (
    <Router>
      <AuthProvider>
        <DispatcherNotifications />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignInPage />} />
          <Route path="/register" element={<RegistrationPending />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/user-management" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminUserManagement /></ProtectedRoute>} />
          <Route path="/admin/users/create" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminCreateUser mode="create" /></ProtectedRoute>} />
          <Route path="/admin/users/:id/edit" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminCreateUser mode="edit" /></ProtectedRoute>}/>
          <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminUserPageView /></ProtectedRoute>}/>
          <Route path="/admin/emergency-reports" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/admin/emergency-reports/:id" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminReportsPageView /></ProtectedRoute>} />
          <Route path="/admin/response-team" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminResponseTeam /></ProtectedRoute>} />
          <Route path="/admin/response-teams/create" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminCreateTeam mode="create" /></ProtectedRoute>} />
          <Route path="/admin/response-teams/:id/edit" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminCreateTeam mode="edit" /></ProtectedRoute>} /> 
          <Route path="/admin/response-teams/:id" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminTeamPageView /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminAnnouncement /></ProtectedRoute>} />
          <Route path="/admin/announcement/create" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminCreateAnnouncement /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/residency-approval/:id" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminResidencyApproval /></ProtectedRoute>} />\

          {/* Dispatcher */}
          <Route path="/dispatcher" element={<ProtectedRoute allowedRoles={["MDRRMO"]}><DispatcherDashboard /></ProtectedRoute>} />
          <Route path="/dispatcher/emergency-reports" element={<ProtectedRoute allowedRoles={["MDRRMO"]}><AdminReportsPage /></ProtectedRoute>} />
          <Route path="/dispatcher/response-team" element={<ProtectedRoute allowedRoles={["MDRRMO"]}><AdminResponseTeam /></ProtectedRoute>} />
          <Route path="/dispatcher/announcements" element={<ProtectedRoute allowedRoles={["MDRRMO"]}><AdminAnnouncement /></ProtectedRoute>} />
          <Route path="/dispatcher/emergency-reports/:id" element={<ProtectedRoute allowedRoles={["MDRRMO"]}><AdminReportsPageView /></ProtectedRoute>}/>

          {/* Resident */}
          <Route path="/resident" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentDashboard /></ProtectedRoute>} />
          <Route path="/resident/announcement" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentAnnouncement /></ProtectedRoute>} />
          <Route path="/resident/report" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentReport /></ProtectedRoute>} />
          <Route path="/resident/notification" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentNotification /></ProtectedRoute>} />
          <Route path="/resident/history" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentHistory /></ProtectedRoute>} />
          <Route path="/resident/profile" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentProfile /></ProtectedRoute>} />
          <Route path="/resident/edit-profile" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentEditProfile /></ProtectedRoute>} />
          <Route path="/resident/call" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentCall /></ProtectedRoute>} />
          <Route path="/resident/waiting" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentWaiting /></ProtectedRoute>} />
          <Route path="/resident/arrived" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentArrived /></ProtectedRoute>} />
          <Route path="/resident/complete" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentComplete /></ProtectedRoute>} />
          <Route path="/resident/witness-report" element={<ProtectedRoute allowedRoles={["Resident"]}><ResidentWitReport /></ProtectedRoute>} />

          {/* Responder */}
          <Route path="/responder" element={<ProtectedRoute allowedRoles={["Responder"]}><ResponderDashboard /></ProtectedRoute>} />
          <Route path="/responder/profile" element={<ProtectedRoute allowedRoles={["Responder"]}><ResponderProfile /></ProtectedRoute>} />
          <Route path="/responder/edit-profile" element={<ProtectedRoute allowedRoles={["Responder"]}><ResponderEditProfile /></ProtectedRoute>} />
          <Route path="/responder/notification" element={<ProtectedRoute allowedRoles={["Responder"]}><ResponderNotification /></ProtectedRoute>} />
          <Route path="/responder/reports" element={<ProtectedRoute allowedRoles={["Responder"]}><ResponderReports /></ProtectedRoute>} />
          <Route path="/responder/reports/view-report/:id" element={<ProtectedRoute allowedRoles={  ["Responder"]}><ResponderViewReport /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
