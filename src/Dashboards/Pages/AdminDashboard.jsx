import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../Core/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWheatAwn,
  faUsers,
  faStore,
  faBox,
  faShieldHalved,
  faChartLine,
  faHouse,
  faRotateRight,
  faBell,
  faRightFromBracket,
  faChevronDown,
  faArrowRight,
  faArrowUpRightFromSquare,
  faUserGear,
  faSliders,
} from '@fortawesome/free-solid-svg-icons';
import '../Styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalCustomers: 0,
    totalMarkets: 0,
    totalOrders: 0,
    pendingFarmers: 0,
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/stats');

      if (response.data.success) {
        setStats({
          totalFarmers: response.data.totalFarmers || 0,
          totalCustomers: response.data.totalCustomers || 0,
          totalMarkets: response.data.totalMarkets || 0,
          totalOrders: response.data.totalOrders || 0,
          pendingFarmers: response.data.pendingFarmers || 0,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Failed to load dashboard statistics'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userStateChange'));
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString();
  };

  const maxValue = Math.max(
    stats.totalFarmers,
    stats.totalCustomers,
    stats.totalMarkets,
    stats.totalOrders,
    1
  );

  const getHeight = (value) => {
    if (!value) return 8;
    return Math.max(Math.round((value / maxValue) * 100), 10);
  };

  const modules = [
    {
      title: 'Farmer Management',
      description: 'Review applications, approve farmers and manage farmer accounts.',
      path: '/admin/farmers',
      icon: faWheatAwn,
      badge: stats.pendingFarmers > 0 ? `${stats.pendingFarmers} Pending` : null,
    },
    {
      title: 'Customer Management',
      description: 'Manage customer accounts and platform access.',
      path: '/admin/customers',
      icon: faUsers,
    },
    {
      title: 'Market Management',
      description: 'Manage market locations, timings and operating days.',
      path: '/admin/markets',
      icon: faStore,
    },
    {
      title: 'Order Monitoring',
      description: 'Monitor customer pre-orders and order activity.',
      path: '/admin/orders',
      icon: faBox,
    },
    {
      title: 'Content Moderation',
      description: 'Review flagged products and customer reviews.',
      path: '/admin/moderation',
      icon: faShieldHalved,
    },
    {
      title: 'Platform Reports',
      description: 'View analytics, revenue summaries and farmer activity.',
      path: '/admin/reports',
      icon: faChartLine,
    },
    {
      title: 'System Configuration',
      description: 'Manage categories and publish platform announcements.',
      path: '/admin/system-config',
      icon: faSliders,
    },
  ];

  if (loading) {
    return (
      <div className="ml-loading">
        <div className="ml-loader"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="ml-dashboard">
      {/* HEADER */}
      <header className="ml-header">
        <div className="ml-header-left">
          <button
            className="ml-logo"
            onClick={() => navigate('/admindashboard')}
          >
            M
          </button>
          <div className="ml-brand">
            <strong>MarketLink</strong>
            <span>Admin Dashboard</span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="ml-navigation">
          <button
            className="ml-nav active"
            onClick={() => navigate('/admindashboard')}
          >
            Overview
          </button>
          <button className="ml-nav" onClick={() => navigate('/admin/farmers')}>
            Farmers
          </button>
          <button className="ml-nav" onClick={() => navigate('/admin/customers')}>
            Customers
          </button>
          <button className="ml-nav" onClick={() => navigate('/admin/markets')}>
            Markets
          </button>
          <button className="ml-nav" onClick={() => navigate('/admin/orders')}>
            Orders
          </button>
        </nav>

        {/* HEADER ACTIONS */}
        <div className="ml-header-actions">
          <button
            className="ml-action-btn"
            onClick={fetchStats}
            title="Refresh dashboard"
          >
            <FontAwesomeIcon icon={faRotateRight} />
            <small>Refresh</small>
          </button>

          <button
            className="ml-action-btn"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <FontAwesomeIcon icon={faHouse} />
            <small>Home</small>
          </button>

          <button className="ml-notification" title="Notifications">
            <FontAwesomeIcon icon={faBell} />
            {stats.pendingFarmers > 0 && <b>{stats.pendingFarmers}</b>}
          </button>

          <div className="ml-avatar" title="Admin Profile">
            <FontAwesomeIcon icon={faUserGear} />
          </div>

          <button className="ml-logout" onClick={handleLogout} title="Logout">
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="ml-main">
        <section className="ml-top-area">
          {/* LEFT ANALYTICS & STATS */}
          <div className="ml-stat-area">
            {/* STAT CARDS */}
            <div className="ml-stat-grid">
              <div className="ml-stat-card">
                <div className="stat-card-heading">
                  <div className="stat-round-icon">
                    <FontAwesomeIcon icon={faWheatAwn} />
                  </div>
                  <span>Farmers</span>
                </div>
                <strong>{formatNumber(stats.totalFarmers)}</strong>
                <small>Registered farmers</small>
              </div>

              <div className="ml-stat-card">
                <div className="stat-card-heading">
                  <div className="stat-round-icon">
                    <FontAwesomeIcon icon={faUsers} />
                  </div>
                  <span>Customers</span>
                </div>
                <strong>{formatNumber(stats.totalCustomers)}</strong>
                <small>Registered customers</small>
              </div>

              <div className="ml-stat-card">
                <div className="stat-card-heading">
                  <div className="stat-round-icon">
                    <FontAwesomeIcon icon={faStore} />
                  </div>
                  <span>Markets</span>
                </div>
                <strong>{formatNumber(stats.totalMarkets)}</strong>
                <small>Active markets</small>
              </div>
            </div>

            {/* ANALYTICS HEADING */}
            <div className="ml-analytics-heading">
              <h2>Platform Performance</h2>
              <button className="ml-time-filter">
                Last 6 months
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
            </div>

            {/* ANALYTICS GRID */}
            <div className="ml-analytics-grid">
              {/* LARGE GREEN CARD */}
              <div className="ml-large-analytics green-card">
                <div className="analytics-top">
                  <span>Farmers</span>
                  <strong>{formatNumber(stats.totalFarmers)}</strong>
                  <small>USERS</small>
                </div>
                <div className="analytics-number">
                  +{stats.totalFarmers > 0 ? '38' : '0'}%
                </div>
                <p>
                  platform growth
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="ml-trend-icon" />
                </p>

                <div className="mini-bars">
                  <i style={{ height: `${Math.max(getHeight(stats.totalFarmers) * 0.3, 25)}%` }}></i>
                  <i style={{ height: `${Math.max(getHeight(stats.totalFarmers) * 0.45, 30)}%` }}></i>
                  <i style={{ height: `${Math.max(getHeight(stats.totalFarmers) * 0.6, 35)}%` }}></i>
                  <i style={{ height: `${Math.max(getHeight(stats.totalFarmers) * 0.78, 45)}%` }}></i>
                  <i style={{ height: `${Math.max(getHeight(stats.totalFarmers) * 0.95, 55)}%` }}></i>
                </div>
              </div>

              {/* SMALL STAT METRICS */}
              <div className="ml-small-analytics-wrapper">
                <div className="ml-small-analytics">
                  <span>Markets</span>
                  <strong>{formatNumber(stats.totalMarkets)}</strong>
                  <b className="ml-growth">+17%</b>
                </div>

                <div className="ml-small-analytics">
                  <span>Orders</span>
                  <strong>{formatNumber(stats.totalOrders)}</strong>
                  <b className="ml-growth">+15%</b>
                </div>

                <div className="ml-small-analytics">
                  <span>Pending Approvals</span>
                  <strong>{formatNumber(stats.pendingFarmers)}</strong>
                  <b className="ml-growth warning">
                    {stats.pendingFarmers > 0 ? 'Action Needed' : '0'}
                  </b>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE PANEL */}
          <aside className="ml-side-panel">
            <div className="side-panel-title">
              Increase your platform activity
            </div>
            <div className="side-percentage">3.5%</div>
            <p className="side-description">projected quarterly growth</p>

            {/* AREA CHART */}
            <div className="growth-chart">
              <svg viewBox="0 0 300 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00CD58" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00CD58" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 140 C50 120, 100 130, 150 80 C200 40, 250 50, 300 20 L300 150 L0 150 Z"
                  fill="url(#growthGrad)"
                />
                <path
                  d="M0 140 C50 120, 100 130, 150 80 C200 40, 250 50, 300 20"
                  fill="none"
                  stroke="#00CD58"
                  strokeWidth="3"
                />
              </svg>
            </div>

            {/* QUICK HIGHLIGHTS */}
            <div className="recommendation-cards">
              <div className="recommendation-green">
                <strong>{formatNumber(stats.totalOrders)}</strong>
                <small>Total Orders Processed</small>
              </div>

              <div className="recommendation-dark">
                <strong>{formatNumber(stats.pendingFarmers)}</strong>
                <small>Pending Farmer Verification</small>
              </div>
            </div>
          </aside>
        </section>

        {/* MANAGEMENT MODULES SECTION */}
        <section className="ml-management">
          <div className="management-heading">
            <div>
              <span className="section-subtitle">ADMINISTRATION</span>
              <h2>Quick Management</h2>
            </div>
            <small>{modules.length} Active Modules</small>
          </div>

          <div className="management-grid">
            {modules.map((module, index) => (
              <button
                key={index}
                className="management-card"
                onClick={() => navigate(module.path)}
              >
                <div className="management-card-top">
                  <div className="management-icon">
                    <FontAwesomeIcon icon={module.icon} />
                  </div>
                  {module.badge && (
                    <span className="management-badge">{module.badge}</span>
                  )}
                </div>

                <div className="management-card-content">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>

                <div className="management-card-footer">
                  <span>Open Module</span>
                  <FontAwesomeIcon icon={faArrowRight} className="ml-arrow" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="ml-footer">
          <span>MarketLink Admin Dashboard</span>
          <span>Real-time platform insights & control</span>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;