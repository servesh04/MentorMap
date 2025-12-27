import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ProtectedRoute from './components/Auth/ProtectedRoute';

import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  useAuth(); // Initialize Auth Listener

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="/course/:id" element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
