import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import { useGoogleLogin } from '@react-oauth/google';
import { loginService, googleAuthService, githubAuthService } from '../Services/authServices';
import '../Styles/Login.css';

const GITHUB_CLIENT_ID = "Ov23liQP3VuaKTBvWaqr";

const sliderData = [
  {
    step: "1",
    title: "Welcome Back to MarketLink",
    desc: "Log in to access your customized professional dashboard and resume your work seamlessly.",
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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const navigate = useNavigate();

  const rightPanelRef = useRef(null);
  const formContainerRef = useRef(null);
  const slideTextRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (rightPanelRef.current) {
        gsap.fromTo(rightPanelRef.current,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
        );
      }

      if (formContainerRef.current) {
        gsap.fromTo(formContainerRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
        );
      }

      gsap.fromTo('.gsap-login-item',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.3, ease: 'power2.out' }
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

  // Safely route based on role
  const navigateByRole = (userObj) => {
    const role = userObj?.role;
    if (role === 'admin') {
      navigate('/admindashboard');
    } else if (role === 'farmer') {
      navigate('/farmerdashboard');
    } else {
      navigate('/');
    }
  };

  // Google Login Hook
  const googleLoginHandler = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const data = await googleAuthService(tokenResponse.access_token);
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('userStateChange'));
          toast.success("Google Login Successful!");
          navigateByRole(data.user);
        }
      } catch (err) {
        console.error("Google Auth Error:", err);
        toast.error(err.response?.data?.message || "Google Login Failed!");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Google Sign-In Cancelled!")
  });

  // GitHub Login Redirect
  const handleGitHubLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
  };

  // GitHub Callback Receiver
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      setIsLoading(true);
      githubAuthService(code)
        .then((data) => {
          localStorage.setItem('token', data.token);
          const userData = data.user || data;
          if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
          window.dispatchEvent(new Event('userStateChange'));
          toast.success("GitHub Login Successful!");
          navigateByRole(userData);
        })
        .catch((error) => {
          console.error("GitHub Auth Error:", error);
          toast.error(error.response?.data?.message || "GitHub Login Failed!");
        })
        .finally(() => setIsLoading(false));
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginService({ email: email.trim(), password });

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      const userData = data.user || data;
      localStorage.setItem('user', JSON.stringify(userData));

      window.dispatchEvent(new Event('userStateChange'));

      // Agar user verified nahi hai, toh Verify OTP screen par bhejo
      if (userData.Verfy === false) {
        toast.error("Aapka account verified nahi hai. OTP Verify karein!");
        navigate('/verify-otp');
        return;
      }

      toast.success(data?.message || "Welcome back to MarketLink!");
      navigateByRole(userData);
    } catch (error) {
      console.error("Login Error:", error.response?.data || error);
      const serverMsg = error.response?.data?.message || "Invalid Email/Password!";
      toast.error(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div ref={formContainerRef} className="login-form-card">
          <div className="gsap-login-item">
            <h2 className="login-heading">
              Welcome Back <span className="green-accent">Genius</span> .
            </h2>
            <p className="login-subheading">Enter your personal data to access your account.</p>
          </div>

          <div className="social-row gsap-login-item">
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

          <div className="divider gsap-login-item">
            <span>OR</span>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="field-group gsap-login-item">
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

            <div className="field-group gsap-login-item">
              <label className="field-label">Password</label>
              <input
                type="password"
                className="custom-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#2e7d32', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn gsap-login-item"
            >
              {isLoading ? 'Authenticating... ⏳' : 'Sign In'}
            </button>
          </form>



          <p className="register-link-text gsap-login-item">
            Don't have an account?{' '}
            <Link to="/register" className="register-link">
              Create one now
            </Link>
          </p>
        </div>
      </div>

      <div ref={rightPanelRef} className="login-right">
        <div
          className="login-bg-img"
          style={{ backgroundImage: `url(${sliderData[activeSlide].image})` }}
        />
        <div className="login-overlay" />

        <div className="login-brand">
          MarketLink <span className="green-accent">.</span>
        </div>

        <div ref={slideTextRef} className="login-slide-box">
          <h1 className="login-slide-title">
            {sliderData[activeSlide].title} <span className="green-accent">.</span>
          </h1>
          <p className="login-slide-desc">{sliderData[activeSlide].desc}</p>
        </div>

        <div className="login-steps-grid">
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
    </div>
  );
};

export default Login;