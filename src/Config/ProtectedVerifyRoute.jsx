import React from 'react';
import { Navigate } from 'react-router-dom';
import VerifyOtp from '../Pages/Auth/Pages/VerifyOtp';

const ProtectedVerifyRoute = () => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    // 1. Agar user already verified hai, dashboard ya home par redirect karein
    if (storedUser?.Verfy === true) {
        if (storedUser.role === 'admin') return <Navigate to="/admindashboard" replace />;
        if (storedUser.role === 'farmer') return <Navigate to="/farmerdashboard" replace />;
        return <Navigate to="/" replace />;
    }

    // 2. Agar koi unverified account local storage me nahi hai
    if (!storedUser?.email) {
        return <Navigate to="/register" replace />;
    }

    // 3. Safe to display Verify OTP page
    return <VerifyOtp />;
};

export default ProtectedVerifyRoute;