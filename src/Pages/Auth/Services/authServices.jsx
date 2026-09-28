import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const registerService = async (userData) => {
    const res = await axios.post(`${API_URL}/register`, userData);
    return res.data;
};

export const loginService = async (credentials) => {
    const res = await axios.post(`${API_URL}/login`, credentials);
    return res.data;
};

export const sendOtpService = async (email) => {
    const res = await axios.post(`${API_URL}/send-otp`, { email });
    return res.data;
};

export const verifyOtpService = async (email, otpCode) => {
    const res = await axios.post(`${API_URL}/verify-otp`, { email, otpCode });
    return res.data;
};

export const googleAuthService = async (accessToken, role = 'customer') => {
    const res = await axios.post(`${API_URL}/google`, { accessToken, role });
    return res.data;
};

export const githubAuthService = async (code, role = 'customer') => {
    const res = await axios.post(`${API_URL}/github`, { code, role });
    return res.data;
};

export const forgotPasswordService = async (email) => {
    const res = await axios.post(`${API_URL}/forgetPassword`, { email });
    return res.data;
};

export const resetPasswordService = async (email, otpCode, newPassword) => {
    const res = await axios.post(`${API_URL}/reset-password`, { email, otpCode, newPassword });
    return res.data;
};