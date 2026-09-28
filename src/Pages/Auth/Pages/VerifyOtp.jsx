import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { verifyOtpService, sendOtpService } from '../Services/authServices';
import '../Styles/Register.css';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    const [email, setEmail] = useState(storedUser.email || '');
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const verifyRes = await verifyOtpService(email.trim(), otpCode.trim());
            toast.success(verifyRes?.message || "Account Verified Successfully!");

            if (verifyRes.token) {
                localStorage.setItem('token', verifyRes.token);
            }

            // User state updated to verified
            const updatedUser = verifyRes.user || { ...storedUser, Verfy: true };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('userStateChange'));

            // Redirect according to role
            if (updatedUser.role === 'admin') navigate('/admindashboard');
            else if (updatedUser.role === 'farmer') navigate('/farmerdashboard');
            else navigate('/');
        } catch (error) {
            console.error("OTP Verify Error:", error);
            toast.error(error.response?.data?.message || "Invalid OTP Code!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) return toast.error("Please enter email address!");
        setIsResending(true);
        try {
            const res = await sendOtpService(email.trim());
            toast.success(res?.message || "Naya OTP aapke email par bhej diya gaya hai!");
        } catch (error) {
            toast.error(error.response?.data?.message || "OTP send karne me masla hua!");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="register-page" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '100vh' }}>
            <div className="register-form-card" style={{ maxWidth: '420px', width: '100%', padding: '30px' }}>
                <h2 className="form-heading">
                    Verify Email OTP <span className="green-accent">.</span>
                </h2>
                <p className="form-subheading">Verification code sent to <b>{email || 'your email'}</b>.</p>

                <form onSubmit={handleVerifyOtp} className="register-form">
                    {!storedUser.email && (
                        <div className="field-group">
                            <label className="field-label">Email Address</label>
                            <input
                                type="email"
                                className="custom-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="field-group">
                        <label className="field-label">Enter 6-Digit OTP</label>
                        <input
                            type="text"
                            className="custom-input"
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            maxLength="6"
                            required
                        />
                    </div>

                    <button type="submit" disabled={isLoading} className="submit-btn">
                        {isLoading ? 'Verifying... ⏳' : 'Verify & Continue'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending}
                        style={{ background: 'none', border: 'none', color: '#2e7d32', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {isResending ? 'Sending OTP... ⏳' : 'Resend OTP 📩'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;