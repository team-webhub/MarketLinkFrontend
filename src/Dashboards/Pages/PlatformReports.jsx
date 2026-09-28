import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/PlatformReports.css';

const PlatformReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/reports/platform`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="reports-loading">📊 Loading Reports...</div>;
  }

  if (!reports) {
    return <div className="reports-error">❌ Failed to load reports</div>;
  }

  return (
    <div className="platform-reports">
      <div className="admin-page-heading">
        <button type="button" className="admin-back-button" onClick={() => navigate('/admindashboard')}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back to Admin Dashboard
        </button>
        <h1 className="reports-title"><i className="fa-solid fa-chart-line" aria-hidden="true"></i> Platform Reports</h1>
      </div>

      {/* TAB NAVIGATION */}
      <div className="reports-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'markets' ? 'active' : ''}`}
          onClick={() => setActiveTab('markets')}
        >
          🏬 Revenue by Market
        </button>
        <button
          className={`tab-btn ${activeTab === 'farmers' ? 'active' : ''}`}
          onClick={() => setActiveTab('farmers')}
        >
          👨‍🌾 Top Farmers
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="reports-content">
          <div className="reports-grid">
            {/* KPI Cards */}
            <div className="kpi-card total-orders">
              <div className="kpi-icon">📦</div>
              <div className="kpi-content">
                <h3>Total Orders</h3>
                <p className="kpi-value">{reports.totalOrders}</p>
                <p className="kpi-subtitle">All-time</p>
              </div>
            </div>

            <div className="kpi-card total-revenue">
              <div className="kpi-icon">💰</div>
              <div className="kpi-content">
                <h3>Total Revenue</h3>
                <p className="kpi-value">₹{reports.totalRevenue.toLocaleString('en-IN')}</p>
                <p className="kpi-subtitle">Platform earnings</p>
              </div>
            </div>

            <div className="kpi-card completed-orders">
              <div className="kpi-icon">✅</div>
              <div className="kpi-content">
                <h3>Completed This Month</h3>
                <p className="kpi-value">{reports.completedOrdersThisMonth}</p>
                <p className="kpi-subtitle">Current month</p>
              </div>
            </div>
          </div>

          {/* ORDER STATUS BREAKDOWN */}
          <div className="reports-section">
            <h2>📊 Order Status Breakdown</h2>
            <div className="status-breakdown">
              {reports.ordersByStatus.map((status) => (
                <div key={status._id} className="status-item">
                  <span className="status-label">{status._id || 'Unknown'}</span>
                  <div className="status-bar-container">
                    <div
                      className="status-bar"
                      style={{
                        width: `${(status.count / reports.totalOrders) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="status-count">{status.count} orders</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REVENUE BY MARKET TAB */}
      {activeTab === 'markets' && (
        <div className="reports-content">
          <div className="reports-section">
            <h2>🏬 Revenue Summary by Market</h2>
            <div className="table-responsive">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Orders</th>
                    <th>Total Revenue</th>
                    <th>Avg per Order</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.revenueByMarket.length > 0 ? (
                    reports.revenueByMarket.map((market, index) => (
                      <tr key={index}>
                        <td>
                          <span className="market-badge">
                            {market._id && market._id[0]
                              ? market._id[0]
                              : 'Unknown Market'}
                          </span>
                        </td>
                        <td>{market.orderCount}</td>
                        <td className="revenue-cell">
                          ₹{market.totalRevenue.toLocaleString('en-IN')}
                        </td>
                        <td>
                          ₹{(market.totalRevenue / market.orderCount).toFixed(0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">
                        No market data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TOP FARMERS TAB */}
      {activeTab === 'farmers' && (
        <div className="reports-content">
          <div className="reports-section">
            <h2>👨‍🌾 Most Active Farmers</h2>
            <div className="farmers-grid">
              {reports.activeFarmers.length > 0 ? (
                reports.activeFarmers.map((farmer, index) => (
                  <div key={farmer._id} className="farmer-card">
                    <div className="farmer-rank">#{index + 1}</div>
                    <div className="farmer-info">
                      <h3>{farmer.farmerName}</h3>
                      <p className="farm-name">
                        {farmer.businessName || 'N/A'}
                      </p>
                      <p className="contact-info">
                        📞 {farmer.contactNumber || 'N/A'}
                      </p>
                    </div>
                    <div className="farmer-stats">
                      <div className="stat">
                        <span className="stat-label">Orders</span>
                        <span className="stat-value">{farmer.orderCount}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">
                          ₹{farmer.totalRevenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-farmers">No farmer data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REFRESH BUTTON */}
      <div className="reports-footer">
        <button className="refresh-btn" onClick={fetchReports}>
          🔄 Refresh Reports
        </button>
      </div>
    </div>
  );
};

export default PlatformReports;
