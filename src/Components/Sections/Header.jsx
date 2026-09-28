import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import gsap from 'gsap';
import '../Styles/Header.css';
import NotificationBell from '../../Dashboards/Components/NotificationBell';

function Header() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const pillRef = useRef(null);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const headerWrapperRef = useRef(null);
  const linksRef = useRef([]);

  const normalizeMediaUrl = (value) => {
    if (!value || typeof value !== 'string') return value;
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) return value;
    if (value.startsWith('/uploads/')) return `http://localhost:5000${value}`;
    if (value.startsWith('uploads/')) return `http://localhost:5000/${value}`;
    return value;
  };

  const safeUser = user ? {
    ...user,
    profile_picture: normalizeMediaUrl(user.profile_picture),
    banner: normalizeMediaUrl(user.banner),
  } : null;

  // Load User Data from localStorage
  const loadUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          profile_picture: normalizeMediaUrl(parsedUser.profile_picture),
          banner: normalizeMediaUrl(parsedUser.banner),
        });
      } catch (err) {
        console.error("Error parsing user data:", err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  // Sync state on route change & custom events
  useEffect(() => {
    loadUser();

    window.addEventListener('userStateChange', loadUser);
    window.addEventListener('storage', loadUser);

    return () => {
      window.removeEventListener('userStateChange', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, [location.pathname]);

  // Outside Click Handler to auto-close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerWrapperRef.current && !headerWrapperRef.current.contains(event.target)) {
        if (isMenuOpen) closeMenu();
        if (isProfileOpen) closeProfile();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isProfileOpen]);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success("Successfully Logged Out!");
    closeProfile();
    window.dispatchEvent(new Event('userStateChange'));
    navigate('/login');
  };

  // GSAP Animations
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (!pillRef.current) return;
    gsap.to(pillRef.current, {
      width: 'min(380px, 90vw)',
      borderRadius: '28px',
      duration: 0.4,
      ease: 'power3.out',
      onComplete: () => {
        if (pillRef.current) {
          pillRef.current.style.overflow = 'visible';
        }
      },
    });
  };

  const handleMouseLeave = () => {
    if (!isMenuOpen && !isProfileOpen) {
      setIsHovered(false);
      if (pillRef.current) {
        pillRef.current.style.overflow = 'hidden';
        gsap.to(pillRef.current, {
          width: '56px',
          borderRadius: '28px',
          duration: 0.4,
          ease: 'power3.inOut',
        });
      }
    }
  };

  const closeMenu = () => {
    if (!menuRef.current) return;
    gsap.to(menuRef.current, {
      opacity: 0,
      y: -20,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        if (menuRef.current) gsap.set(menuRef.current, { display: 'none' });
        setIsMenuOpen(false);
      },
    });
  };

  const openMenu = () => {
    if (!menuRef.current) return;
    setIsMenuOpen(true);
    gsap.to(menuRef.current, {
      display: 'flex',
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.2)',
    });

    const validLinks = linksRef.current.filter(Boolean);
    if (validLinks.length > 0) {
      gsap.fromTo(
        validLinks,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, delay: 0.1, ease: 'power2.out' }
      );
    }
  };

  const closeProfile = () => {
    if (!profileRef.current) return;
    gsap.to(profileRef.current, {
      opacity: 0,
      y: -15,
      scale: 0.95,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (profileRef.current) gsap.set(profileRef.current, { display: 'none' });
        setIsProfileOpen(false);
        if (pillRef.current && !isHovered) {
          pillRef.current.style.overflow = 'hidden';
        }
      },
    });
  };

  const openProfile = () => {
    if (!profileRef.current) return;
    setIsProfileOpen(true);
    if (pillRef.current) {
      pillRef.current.style.overflow = 'visible';
    }
    gsap.to(profileRef.current, {
      display: 'flex',
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.2)',
    });
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (isMenuOpen) {
      closeMenu();
    } else {
      if (isProfileOpen) closeProfile();
      openMenu();
    }
  };

  const toggleProfile = (e) => {
    e.stopPropagation();
    if (isProfileOpen) {
      closeProfile();
    } else {
      if (isMenuOpen) closeMenu();
      openProfile();
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Markets & Stalls', path: '/markets' },
    { name: 'Products', path: '/services' },
    { name: 'About Us', path: '/about' },
    { name: 'Pre-Orders', path: '/pre-orders' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="header-wrapper" ref={headerWrapperRef}>
      <div
        ref={pillRef}
        className={`floating-pill ${isHovered || isMenuOpen || isProfileOpen ? 'expanded' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle Menu">
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className="pill-content">
          {/* <h6 className="middle-text">Menu</h6> */}

          <div className="profile-container flex w-full items-center justify-end gap-2">
            {user && <NotificationBell className="text-zinc-800" />}
            {/* Header Pill Profile Button */}
            <button className="profile-btn" onClick={toggleProfile}>
              {safeUser?.profile_picture ? (
                <img
                  src={safeUser.profile_picture}
                  alt={safeUser.username}
                  className="avatar"
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : safeUser?.username ? (
                <div className="avatar-initials">
                  {safeUser.username.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                  alt="User Avatar"
                  className="avatar"
                />
              )}
            </button>

            {/* Profile Dropdown with Banner & Profile Picture */}
            <div ref={profileRef} className="profile-dropdown" style={{ padding: '0 0 15px 0', overflow: 'hidden' }}>
              {/* Dropdown Banner Header */}
              <div
                className="dropdown-banner"
                style={{
                  backgroundImage: "url('https://i.pinimg.com/736x/b9/ec/3e/b9ec3eea254c85cc88e566510871e13b.jpg')",
                  height: '100px',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
              >
                {/* Profile Picture inside Banner */}
                <div style={{ position: 'absolute', bottom: '-22px', left: '20px' }}>
                  <img
                    src={safeUser?.profile_picture || 'https://i.pinimg.com/736x/3e/4e/04/3e4e04e1cc89af1cf02ccbf135576401.jpg'}
                    alt="Profile"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      border: '3px solid #fff',
                      objectFit: 'cover',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  />
                </div>
              </div>

              {/* User Information */}
              <div className="user-info" style={{ padding: '30px 20px 10px 20px' }}>
                <p className="user-name">{safeUser ? safeUser.username : 'Guest User'}</p>
                <p className="user-email">{safeUser ? safeUser.email : 'Log in to view account'}</p>
                {safeUser?.role && <span className="user-role-badge">{safeUser.role.toUpperCase()}</span>}
              </div>

              <hr style={{ margin: '5px 0' }} />

              {/* Menu Actions */}
              <div style={{ padding: '0 10px' }}>
                {user ? (
                  <>
                    <Link to="/profile" className="dropdown-item" onClick={closeProfile}>
                      <i className="fa-solid fa-user"></i> My Profile
                    </Link>

                    {user.role === 'farmer' && (
                      <Link to="/farmerdashboard" className="dropdown-item farmer-link" onClick={closeProfile}>
                        <i className="fa-solid fa-tractor"></i> Farmer Dashboard
                      </Link>
                    )}

                    {user.role === 'admin' && (
                      <Link to="/admindashboard" className="dropdown-item admin-link" onClick={closeProfile}>
                        <i className="fa-solid fa-user-shield"></i> Admin Panel
                      </Link>
                    )}

                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="dropdown-item" onClick={closeProfile}>
                    <i className="fa-solid fa-right-to-bracket"></i> Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Panel */}
      <div ref={menuRef} className="green-menu-panel">
        <div className="menu-links-container">
          {navLinks.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.name}
                ref={(el) => (linksRef.current[index] = el)}
                className="menu-item-wrapper"
              >
                <Link
                  to={item.path}
                  className={`green-menu-link ${isActive ? 'active-link' : ''}`}
                  onClick={closeMenu}
                >
                  <span className="link-text">{item.name}</span>
                  <i className="fa-solid fa-arrow-right link-arrow"></i>
                </Link>
              </div>
            );
          })}

          {user?.role === 'farmer' && (
            <div className="menu-item-wrapper">
              <Link to="/farmerdashboard" className="green-menu-link farmer-highlight" onClick={closeMenu}>
                <span className="link-text">Farmer Dashboard</span>
                <i className="fa-solid fa-arrow-right link-arrow"></i>
              </Link>
            </div>
          )}
        </div>

        <div className="menu-footer">
          <div className="menu-brand">
            <span className="brand-title">MarketLink</span>
          </div>
          <br />
          <div className="menu-contact-info">
            <p>eGreen Basket Platform</p>
            <a href="mailto:support@marketlink.com">support@marketlink.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;