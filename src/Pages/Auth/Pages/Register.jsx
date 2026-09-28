import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import { useGoogleLogin } from '@react-oauth/google';
import { registerService, sendOtpService, googleAuthService, githubAuthService } from '../Services/authServices';
import '../Styles/Register.css';

const GITHUB_CLIENT_ID = "Ov23liQP3VuaKTBvWaqr";

const sliderData = [
    {
        step: "1",
        title: "Get Started with MarketLink",
        desc: "Complete these easy steps to register your account and explore the platform.",
        image: "https://images.pexels.com/photos/30521657/pexels-photo-30521657.jpeg?cs=srgb&dl=pexels-alexisricardoalaurin-30521657.jpg&fm=jpg"
    },
    {
        step: "2",
        title: "Set Up Your Workspace",
        desc: "Tailor your virtual professional dashboard exactly how you like it.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAzq8WTT1vUZwZIPTbDDVcCAArJ07SMeV2h748lH0adVPQ9208GhmFJvA&s=10"
    },
    {
        step: "3",
        title: "Perfect Your Profile",
        desc: "Add your customized headline and profile picture to stand out instantly.",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-gg_SDszup8EZvKLZNXLoHlu8MqJxP3Sjds5GBN-pNTwE4fGUCdhXtqs&s=10"
    }
];

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    const navigate = useNavigate();

    const leftPanelRef = useRef(null);
    const formContainerRef = useRef(null);
    const slideTextRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (leftPanelRef.current) {
                gsap.fromTo(leftPanelRef.current,
                    { opacity: 0, x: -40 },
                    { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
                );
            }

            if (formContainerRef.current) {
                gsap.fromTo(formContainerRef.current,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
                );
            }

            gsap.fromTo('.gsap-item',
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, delay: 0.3, ease: 'power2.out' }
            );
        });

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (slideTextRef.current) {
            gsap.fromTo(slideTextRef.current,
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
            );
        }
    }, [activeSlide]);

    // Google Auth Hook
    const googleLoginHandler = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                const data = await googleAuthService(tokenResponse.access_token, role);
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.dispatchEvent(new Event('userStateChange'));
                    toast.success("Google Account Registration/Login Successful! 🥳");
                    navigate('/');
                }
            } catch (err) {
                console.error("Google Auth Error:", err);
                toast.error(err.response?.data?.message || "Google Sign-In Failed!");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => toast.error("Google Registration Cancelled!")
    });

    // GitHub Auth Redirect
    const handleGitHubLogin = () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || GITHUB_CLIENT_ID;
        sessionStorage.setItem('pendingSocialRole', role);
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
    };

    // GitHub Callback Receiver
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            setIsLoading(true);
            const pendingRole = sessionStorage.getItem('pendingSocialRole') || role;
            window.history.replaceState({}, document.title, window.location.pathname);

            githubAuthService(code, pendingRole)
                .then((data) => {
                    if (data.token) {
                        localStorage.setItem('token', data.token);
                    }
                    if (data.user) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    sessionStorage.removeItem('pendingSocialRole');
                    window.dispatchEvent(new Event('userStateChange'));
                    toast.success("GitHub Login Successful! 🥳");

                    const userRole = data.user?.role || data.role;
                    if (userRole === 'farmer') {
                        navigate('/farmerdashboard');
                    } else {
                        navigate('/');
                    }
                })
                .catch((error) => {
                    console.error("GitHub Auth Error:", error);
                    toast.error(error.response?.data?.message || "GitHub Login Failed!");
                })
                .finally(() => setIsLoading(false));
        }
    }, [navigate, role]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const trimmedData = {
                username: username.trim(),
                email: email.trim(),
                password,
                role,
                contact_number: contactNumber.trim(),
                address: address.trim(),
                ...(role === 'farmer' && {
                    business_name: businessName.trim(),
                    contact_person: contactPerson.trim(),
                }),
                profile_picture: profilePicture.trim() || undefined
            };

            const registerRes = await registerService(trimmedData);
            toast.success(registerRes?.message || "Registration Successful!");

            const newUserObj = registerRes.user || { email: trimmedData.email, role: trimmedData.role, Verfy: false };
            localStorage.setItem('user', JSON.stringify(newUserObj));

            await sendOtpService(trimmedData.email);
            toast.success("Verification OTP email par bhej diya gaya hai! 📩");

            navigate('/verify-otp');
        } catch (error) {
            console.error("Register Error:", error.response?.data || error);
            const serverMsg = error.response?.data?.message || "Registration Failed!";
            toast.error(serverMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div ref={leftPanelRef} className="register-left">
                <div
                    className="register-bg-img"
                    style={{ backgroundImage: `url(${sliderData[activeSlide].image})` }}
                />
                <div className="register-overlay" />

                <div className="register-brand">
                    MarketLink <span className="green-accent">.</span>
                </div>

                <div ref={slideTextRef} className="register-slide-box">
                    <h1 className="register-slide-title">{sliderData[activeSlide].title}</h1>
                    <p className="register-slide-desc">{sliderData[activeSlide].desc}</p>
                </div>

                <div className="register-steps-grid">
                    {sliderData.map((slide, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setActiveSlide(index)}
                            className={`step-btn ${activeSlide === index ? 'active' : ''}`}
                        >
                            <span className="step-num">{slide.step}</span>
                            <div className="step-content">
                                <span className="step-tag">Step 0{slide.step}</span>
                                <span className="step-title">
                                    {index === 0 ? "Account" : index === 1 ? "Workspace" : "Profile"}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="register-right">
                <div ref={formContainerRef} className="register-form-card">
                    <div className="gsap-item">
                        <h2 className="form-heading">
                            Welcome to MarketLink <span className="green-accent">.</span>
                        </h2>
                        <p className="form-subheading">Enter your personal data to create your account.</p>
                    </div>

                    {/* MOVED ROLE SELECTOR HERE */}
                    <div className="field-group gsap-item" style={{ marginBottom: '16px' }}>
                        <label className="field-label">Before Google/Github Or Noramal Regiter, Select this</label>
                        <select
                            className="custom-input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="customer">Customer</option>
                            <option value="farmer">Farmer</option>
                        </select>
                    </div>

                    <div className="social-row gsap-item">
                        <button
                            type="button"
                            onClick={() => googleLoginHandler()}
                            disabled={isLoading}
                            className="social-btn"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                        </button>

                        <button
                            type="button"
                            onClick={handleGitHubLogin}
                            disabled={isLoading}
                            className="social-btn"
                        >
                            <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="invert-icon" alt="GitHub" />
                        </button>
                    </div>

                    <div className="divider gsap-item">
                        <span>OR</span>
                    </div>

                    <form onSubmit={handleRegister} className="register-form">
                        <div className="field-group gsap-item">
                            <label className="field-label">Username</label>
                            <input
                                type="text"
                                className="custom-input"
                                placeholder="eg. john_doe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="field-group gsap-item">
                            <label className="field-label">Contact Number</label>
                            <input type="tel" className="custom-input" placeholder="eg. +92 300 1234567" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
                        </div>

                        <div className="field-group gsap-item">
                            <label className="field-label">Address</label>
                            <input type="text" className="custom-input" placeholder="Your pickup/home address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                        </div>

                        <div className="field-group gsap-item">
                            <label className="field-label">Email</label>
                            <input
                                type="email"
                                className="custom-input"
                                placeholder="eg. john@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {role === 'farmer' && (
                            <>
                                <div className="field-group gsap-item">
                                    <label className="field-label">Stall / Business Name</label>
                                    <input type="text" className="custom-input" placeholder="eg. Green Valley Farm" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                                </div>
                                <div className="field-group gsap-item">
                                    <label className="field-label">Contact Person</label>
                                    <input type="text" className="custom-input" placeholder="Person responsible for the stall" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
                                </div>
                            </>
                        )}

                        <div className="field-group gsap-item">
                            <label className="field-label">Password</label>
                            <input
                                type="password"
                                className="custom-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span className="field-note">Must be at least 8 characters.</span>
                        </div>

                        <div className="field-group gsap-item">
                            <label className="field-label">
                                Profile Picture URL <span style={{ opacity: 0.6, fontSize: '0.85em' }}>(Optional)</span>
                            </label>
                            <input
                                type="url"
                                className="custom-input"
                                placeholder="https://example.com/my-photo.jpg"
                                value={profilePicture}
                                onChange={(e) => setProfilePicture(e.target.value)}
                            />
                        </div>

                        {/* REDUNDANT ACCOUNT ROLE SELECTOR REMOVED FROM HERE */}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="submit-btn gsap-item"
                        >
                            {isLoading ? 'Creating Account... ⏳' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="login-link-text gsap-item">
                        Already have an account?{' '}
                        <Link to="/login" className="login-link">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;