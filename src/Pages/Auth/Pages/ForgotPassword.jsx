import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPasswordService, resetPasswordService } from '../Services/authServices';
import '../Styles/Login.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // Step 1: Send OTP | Step 2: Set New Password
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await forgotPasswordService(email.trim());
            toast.success(res?.message || "Reset OTP email par bhej diya gaya hai!");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Is email par account nahi mila!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await resetPasswordService(email.trim(), otpCode.trim(), newPassword);
            toast.success(res?.message || "Password successfully update ho gaya hai!");
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Password reset nahi ho saka!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', minHeight: '100vh' }}>
            <div className="login-form-card" style={{ maxWidth: '420px', width: '100%', padding: '30px' }}>
                <h2 className="login-heading">
                    Forgot Password <span className="green-accent">.</span>
                </h2>
                <p className="login-subheading">
                    {step === 1 ? "Enter your registered email to receive OTP." : "Enter OTP and your new password."}
                </p>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="login-form">
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
                        <button type="submit" disabled={isLoading} className="submit-btn">
                            {isLoading ? 'Sending OTP... ⏳' : 'Send Reset OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="login-form">
                        <div className="field-group">
                            <label className="field-label">6-Digit OTP Code</label>
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

                        <div className="field-group">
                            <label className="field-label">New Password</label>
                            <input
                                type="password"
                                className="custom-input"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" disabled={isLoading} className="submit-btn">
                            {isLoading ? 'Updating Password... ⏳' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p className="register-link-text" style={{ marginTop: '20px' }}>
                    Remembered password? <Link to="/login" className="register-link">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;