import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import League from './pages/League';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Landing from './pages/Landing';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import AdminLayout from './components/AdminLayout';
import Unauthorized from './pages/Unauthorized';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminConfig from './pages/admin/AdminConfig';
import SplashScreen from './components/SplashScreen';
import WeeklyResultModal from './components/WeeklyResultModal';

import { useAuthListener } from './hooks/useAuth';
import { useStore } from './store/useStore';

const App: React.FC = () => {
  useAuthListener(); // Initialize Auth Listener (Single Instance)
  const authLoading = useStore(state => state.authLoading);

  return (
    <>
      <SplashScreen isLoading={authLoading} />
      <WeeklyResultModal />
      <Router>

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Landing />} />
          <Route path="/403" element={<Unauthorized />} />

          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/league" element={<League />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route path="/course/:id" element={
            <ProtectedRoute>
              <CourseDetail />
            </ProtectedRoute>
          } />

          {/* Admin Routes protected by claims validation guard */}
          <Route element={
            <ProtectedRoute>
              <AdminRoute />
            </ProtectedRoute>
          }>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/security" element={<AdminSecurity />} />
              <Route path="/admin/config" element={<AdminConfig />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
