import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../Core/api';
import toast from 'react-hot-toast';
import '../Styles/ManageCustomer.css';

const ManageCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      const response = await API.get('/admin/customers');
      setCustomers(response.data?.customers || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const activateCustomer = async (id) => {
    try {
      await API.put(`/admin/customers/${id}/activate`);
      toast.success('Customer Activated');
      fetchCustomers();
    } catch (error) {
      toast.error('Activation Failed');
    }
  };

  const deactivateCustomer = async (id) => {
    try {
      await API.put(`/admin/customers/${id}/deactivate`);
      toast.success('Customer Deactivated');
      fetchCustomers();
    } catch (error) {
      toast.error('Deactivation Failed');
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-spinner"></div>
        <p className="loader-text">Loading Customers...</p>
      </div>
    );
  }

  return (
    <div className="manage-customers-container">
      <div className="manage-customers-wrapper">
        <button type="button" className="admin-back-button" onClick={() => navigate('/admindashboard')}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          Back to Admin Dashboard
        </button>
        <h1 className="page-title">Customer Management</h1>

        <div className="customer-section-card">
          <h2 className="customer-section-title">
            <span className="status-dot-blue"></span>
            All Registered Customers
          </h2>

          {customers.length === 0 ? (
            <div className="empty-state">No customers found</div>
          ) : (
            <div className="customer-list">
              {customers.map((customer) => (
                <div key={customer._id} className="customer-item-card">
                  <div className="customer-info-group">
                    <div className="customer-avatar"><i className="fa-solid fa-user" aria-hidden="true"></i></div>
                    <div>
                      <h3 className="customer-username">{customer.username}</h3>
                      <p className="customer-email">{customer.email}</p>
                      <div className="status-badge-container">
                        <span className="status-label-text">Status:</span>
                        <span className={customer.isActive ? 'badge-active' : 'badge-inactive'}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {customer.isActive ? (
                    <button
                      onClick={() => deactivateCustomer(customer._id)}
                      className="btn-deactivate"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => activateCustomer(customer._id)}
                      className="btn-activate"
                    >
                      Activate
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageCustomers;