import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const getRoleHome = (role) => {
  if (role === 'admin') return '/admindashboard';
  if (role === 'farmer') return '/farmerdashboard';
  return '/';
};

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 1. Agar login details bilkul nahi hain
  if (!token && !user.email) {
    return <Navigate to="/login" replace />;
  }

  // 2. Agar user verified nahi hai (Verfy === false), toh /verify-otp par bhejo
  if (user && user.Verfy === false) {
    return <Navigate to="/verify-otp" replace />;
  }

  // 3. Role-based access control check
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;