import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../Core/api';
import toast from 'react-hot-toast';
import '../Styles/ManageFarmers.css';

const ManageFarmers = () => {
  const navigate = useNavigate();
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [approvedFarmers, setApprovedFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFarmers = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        API.get('/admin/farmers/pending'),
        API.get('/admin/farmers/approved')
      ]);

      setPendingFarmers(pendingRes.data?.farmers || []);
      setApprovedFarmers(approvedRes.data?.farmers || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load farmers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  const approveFarmer = async (id) => {
    try {
      await API.put(`/admin/farmers/${id}/approve`);
      toast.success('Farmer Approved');
      fetchFarmers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Approval Failed');
    }
  };

  const suspendFarmer = async (id) => {
    try {
      await API.put(`/admin/farmers/${id}/suspend`);
      toast.success('Farmer Suspended');
      fetchFarmers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Suspend Failed');
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">Loading Farmers...</p>
      </div>
    );
  }

  return (
    <div className="manage-farmers-container">
      <div className="manage-farmers-wrapper">
        <button type="button" className="admin-back-button" onClick={() => navigate('/admindashboard')}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back to Admin Dashboard
        </button>
        <h1 className="page-title mb-4">Farmer Management</h1>

        {/* Pending Farmers */}
        <div className="farmer-section-card">
          <h2 className="section-header-pending">Pending Approvals</h2>

          {pendingFarmers.length === 0 ? (
            <div className="empty-state">No pending farmers found.</div>
          ) : (
            <div className="farmer-list">
              {pendingFarmers.map((farmer) => (
                <div key={farmer._id} className="farmer-item-card">
                  <div className="farmer-info-group">
                    <div className="farmer-avatar pending"><i className="fa-solid fa-wheat-awn" aria-hidden="true"></i></div>
                    <div>
                      <h3 className="farmer-name">{farmer.username}</h3>
                      <p className="farmer-email">{farmer.email}</p>
                      <p className="farmer-contact">{farmer.contact_number}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => approveFarmer(farmer._id)}
                    className="btn-approve"
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Farmers */}
        <div className="farmer-section-card">
          <h2 className="section-header-approved">Approved Farmers</h2>

          {approvedFarmers.length === 0 ? (
            <div className="empty-state">No approved farmers found.</div>
          ) : (
            <div className="farmer-list">
              {approvedFarmers.map((farmer) => (
                <div key={farmer._id} className="farmer-item-card">
                  <div className="farmer-info-group">
                    <div className="farmer-avatar approved"><i className="fa-solid fa-tractor" aria-hidden="true"></i></div>
                    <div>
                      <h3 className="farmer-name">{farmer.username}</h3>
                      <p className="farmer-email">{farmer.email}</p>
                      <p className="farmer-contact">{farmer.contact_number}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => suspendFarmer(farmer._id)}
                    className="btn-suspend"
                  >
                    Suspend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageFarmers;