import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../Core/api';
import toast from 'react-hot-toast';
import '../Styles/PlatformReports.css';

const ManageOrders = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/reports/platform');
      setReports(response.data?.data || null);
    } catch (error) {
      console.error('Error fetching order management data:', error);
      toast.error(error?.response?.data?.message || 'Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="reports-loading">📦 Loading Orders...</div>;
  }

  if (!reports) {
    return <div className="reports-error">❌ Failed to load order data</div>;
  }

  return (
    <div className="platform-reports">
      <div className="admin-page-heading">
        <button type="button" className="admin-back-button" onClick={() => navigate('/admindashboard')}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back to Admin Dashboard
        </button>
        <h1 className="reports-title"><i className="fa-solid fa-box" aria-hidden="true"></i> Order Management</h1>
      </div>

      <div className="reports-grid order-kpi-grid">
        <div className="kpi-card total-orders">
          <div className="kpi-icon"><i className="fa-solid fa-box" aria-hidden="true"></i></div>
          <div className="kpi-content">
            <h3>Total Orders</h3>
            <p className="kpi-value">{reports.totalOrders || 0}</p>
            <p className="kpi-subtitle">All-time</p>
          </div>
        </div>

        <div className="kpi-card total-revenue">
          <div className="kpi-icon"><i className="fa-solid fa-indian-rupee-sign" aria-hidden="true"></i></div>
          <div className="kpi-content">
            <h3>Total Revenue</h3>
            <p className="kpi-value">₹{Number(reports.totalRevenue || 0).toLocaleString('en-IN')}</p>
            <p className="kpi-subtitle">Platform earnings</p>
          </div>
        </div>

        <div className="kpi-card completed-orders">
          <div className="kpi-icon"><i className="fa-solid fa-circle-check" aria-hidden="true"></i></div>
          <div className="kpi-content">
            <h3>Completed This Month</h3>
            <p className="kpi-value">{reports.completedOrdersThisMonth || 0}</p>
            <p className="kpi-subtitle">Current month</p>
          </div>
        </div>
      </div>

      <div className="reports-section order-section">
        <h2><i className="fa-solid fa-chart-pie" aria-hidden="true"></i> Order Status Breakdown</h2>
        <div className="status-breakdown">
          {(reports.ordersByStatus || []).length > 0 ? (
            reports.ordersByStatus.map((status) => {
              const total = Number(reports.totalOrders || 0);
              const width = total > 0 ? (Number(status.count || 0) / total) * 100 : 0;

              return (
                <div key={status._id || 'unknown'} className="status-item">
                  <span className="status-label">{status._id || 'Unknown'}</span>
                  <div className="status-bar-container">
                    <div className="status-bar" style={{ width: `${width}%` }}></div>
                  </div>
                  <span className="status-count">{status.count || 0} orders</span>
                </div>
              );
            })
          ) : (
            <div className="no-data">No order status data available</div>
          )}
        </div>
      </div>

      <div className="reports-section order-section">
        <h2><i className="fa-solid fa-store" aria-hidden="true"></i> Revenue by Market</h2>
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Orders</th>
                <th>Total Revenue</th>
                <th>Avg / Order</th>
              </tr>
            </thead>
            <tbody>
              {(reports.revenueByMarket || []).length > 0 ? (
                reports.revenueByMarket.map((market, index) => (
                  <tr key={`${market._id || 'market'}-${index}`}>
                    <td>
                      <span className="market-badge">
                        {Array.isArray(market._id) ? market._id[0] : (market._id || 'Unknown Market')}
                      </span>
                    </td>
                    <td>{market.orderCount || 0}</td>
                    <td className="revenue-cell">₹{Number(market.totalRevenue || 0).toLocaleString('en-IN')}</td>
                    <td>
                      ₹{market.orderCount ? (Number(market.totalRevenue || 0) / Number(market.orderCount)).toFixed(0) : 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">No market data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="reports-footer">
        <button className="refresh-btn" onClick={fetchOrders}><i className="fa-solid fa-rotate" aria-hidden="true"></i> Refresh</button>
      </div>
    </div>
  );
};

export default ManageOrders;
