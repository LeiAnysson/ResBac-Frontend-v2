import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Components/LandingPage';
import LoginPage from './LoginPage/LoginPage';
import SignInPage from './SignInPage/SignInPage';
import RegistrationPending from  './RegistrationLoading/RegistrationPending';
import AdminDashboard from './Admin&Dispatcher/AdminPage/AdminDashboard';
import DispatcherDashboard from './Admin&Dispatcher/DispatcherPage/DispatcherDashboard';
import AdminUserManagement from './Admin&Dispatcher/AdminPage/AdminUserManagement';
import AdminReportsPage from './Admin&Dispatcher/AdminPage/AdminReportsPage';
import AdminReportsPageView from './Admin&Dispatcher/AdminPage/AdminReportsPageView';
import AdminResponseTeam from './Admin&Dispatcher/AdminPage/AdminResponseTeam';
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegistrationPending />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/user-management" element={<AdminUserManagement />} />
        <Route path="/admin/emergency-reports" element={<AdminReportsPage />} />
        <Route path="/admin/emergency-reports/:id" element={<AdminReportsPageView />} />
        <Route path="/admin/response-team" element={<AdminResponseTeam />} />
        <Route path="/admin/announcement" element={<AdminAnnouncement />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        <Route path="/resident" element={<ResidentDashboard />} />
        <Route path="/resident/announcement" element={<ResidentAnnouncement />} />
        <Route path="/resident/report" element={<ResidentReport />} />
        <Route path="/resident/notification" element={<ResidentNotification />} />
        <Route path="/resident/history" element={<ResidentHistory />} />
        <Route path="/resident/profile" element={<ResidentProfile />} />
        <Route path="/resident/edit-profile" element={<ResidentEditProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
