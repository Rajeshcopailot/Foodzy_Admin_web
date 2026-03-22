import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLogin from './components/Login/AdminLogin';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import ProfileScreen from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          {/* <Route path="reset-password/:token" element={<ResetPassword />} /> */}
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="admin" element={<AdminLogin />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Add your dashboard routes here */}
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<Menu />} />
          <Route path="profile" element={<ProfileScreen />} />
          <Route path="orders" element={<div>Orders Page</div>} />
        </Route>

        {/* Redirect root to auth/login */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        {/* Catch all other routes and redirect to auth/login */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
