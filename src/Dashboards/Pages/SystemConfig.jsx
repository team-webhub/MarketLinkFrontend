import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../Core/api';
import toast from 'react-hot-toast';
import '../Styles/SystemConfig.css';

const SystemConfig = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Category form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '🏪', color: '#10b981' });
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  // Notification form states
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    priority: 'medium',
    target_audience: 'all',
    image_url: '',
    expires_at: ''
  });
  const [editingNotificationId, setEditingNotificationId] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/notifications');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories();
    } else {
      fetchNotifications();
    }
  }, [activeTab]);

  // ============= CATEGORY HANDLERS =============
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategoryId) {
        const response = await API.put(`/admin/categories/${editingCategoryId}`, categoryForm);
        if (response.data.success) {
          toast.success('Category updated successfully');
          setEditingCategoryId(null);
          fetchCategories();
        }
      } else {
        const response = await API.post('/admin/categories', categoryForm);
        if (response.data.success) {
          toast.success('Category added successfully');
          fetchCategories();
        }
      }
      setCategoryForm({ name: '', description: '', icon: '🏪', color: '#10b981' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await API.delete(`/admin/categories/${id}`);
        if (response.data.success) {
          toast.success('Category deleted successfully');
          fetchCategories();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', description: '', icon: '🏪', color: '#10b981' });
  };

  // ============= NOTIFICATION HANDLERS =============
  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    try {
      if (editingNotificationId) {
        const response = await API.put(`/admin/notifications/${editingNotificationId}`, notificationForm);
        if (response.data.success) {
          toast.success('Notification updated successfully');
          setEditingNotificationId(null);
          fetchNotifications();
        }
      } else {
        const response = await API.post('/admin/notifications', notificationForm);
        if (response.data.success) {
          toast.success('Notification published successfully');
          fetchNotifications();
        }
      }
      setNotificationForm({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'medium',
        target_audience: 'all',
        image_url: '',
        expires_at: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save notification');
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotificationId(notification._id);
    setNotificationForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      target_audience: notification.target_audience,
      image_url: notification.image_url,
      expires_at: notification.expires_at ? notification.expires_at.split('T')[0] : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const response = await API.delete(`/admin/notifications/${id}`);
        if (response.data.success) {
          toast.success('Notification deleted successfully');
          fetchNotifications();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete notification');
      }
    }
  };

  const handleCancelNotificationEdit = () => {
    setEditingNotificationId(null);
    setNotificationForm({
      title: '',
      message: '',
      type: 'announcement',
      priority: 'medium',
      target_audience: 'all',
      image_url: '',
      expires_at: ''
    });
  };

  // ============= RENDER =============
  return (
    <div className="system-config-container">
      {/* Header */}
      <div className="config-header">
        <div className="config-header-content">
          <button type="button" className="admin-back-button" onClick={() => navigate('/admindashboard')}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
            Back to Admin Dashboard
          </button>
          <h1 className="config-title"><i className="fa-solid fa-sliders" aria-hidden="true"></i> System Configuration</h1>
          <p className="config-subtitle">Manage master data and platform-wide settings</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="config-tabs">
        <button
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <span className="tab-icon">📦</span>
          <span className="tab-label">Categories</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <span className="tab-icon">📢</span>
          <span className="tab-label">Announcements</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="config-main">
        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="tab-content">
            <div className="content-grid">
              {/* Form Section */}
              <div className="form-section">
                <h2 className="section-title">{editingCategoryId ? 'Edit Category' : 'Add New Category'}</h2>
                <form onSubmit={handleCategorySubmit} className="config-form">
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Vegetables, Fruits, Dairy"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      maxLength="50"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Brief description of the category"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      maxLength="200"
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Icon (Emoji)</label>
                      <input
                        type="text"
                        placeholder="e.g., 🍅"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>Color</label>
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      {editingCategoryId ? 'Update Category' : 'Add Category'}
                    </button>
                    {editingCategoryId && (
                      <button type="button" className="btn-secondary" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Categories List */}
              <div className="list-section">
                <h2 className="section-title">All Categories ({categories.length})</h2>
                {loading && <p className="loading-text">Loading categories...</p>}
                {!loading && categories.length === 0 && <p className="empty-text">No categories yet. Add one to get started!</p>}
                <div className="categories-grid">
                  {categories.map((category) => (
                    <div key={category._id} className="category-card">
                      <div className="category-icon">{category.icon}</div>
                      <div className="category-info">
                        <h3 className="category-name">{category.name}</h3>
                        <p className="category-desc">{category.description || 'No description'}</p>
                        <div className="category-meta">
                          <span
                            className="category-color-badge"
                            style={{ backgroundColor: category.color }}
                            title={`Color: ${category.color}`}
                          />
                          <span className="category-status">{category.is_active ? '✓ Active' : '✗ Inactive'}</span>
                        </div>
                      </div>
                      <div className="category-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditCategory(category)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteCategory(category._id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="tab-content">
            <div className="content-grid">
              {/* Form Section */}
              <div className="form-section">
                <h2 className="section-title">{editingNotificationId ? 'Edit Announcement' : 'Publish Announcement'}</h2>
                <form onSubmit={handleNotificationSubmit} className="config-form">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      placeholder="Announcement title"
                      value={notificationForm.title}
                      onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                      maxLength="100"
                    />
                  </div>

                  <div className="form-group">
                    <label>Message *</label>
                    <textarea
                      placeholder="Announcement message"
                      value={notificationForm.message}
                      onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                      maxLength="500"
                      rows="4"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                      >
                        <option value="announcement">Announcement</option>
                        <option value="alert">Alert</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="promotion">Promotion</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select
                        value={notificationForm.priority}
                        onChange={(e) => setNotificationForm({ ...notificationForm, priority: e.target.value })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Target Audience</label>
                    <select
                      value={notificationForm.target_audience}
                      onChange={(e) => setNotificationForm({ ...notificationForm, target_audience: e.target.value })}
                    >
                      <option value="all">All Users</option>
                      <option value="farmers">Farmers Only</option>
                      <option value="customers">Customers Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={notificationForm.image_url}
                      onChange={(e) => setNotificationForm({ ...notificationForm, image_url: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Expires At (Optional)</label>
                    <input
                      type="date"
                      value={notificationForm.expires_at}
                      onChange={(e) => setNotificationForm({ ...notificationForm, expires_at: e.target.value })}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary">
                      {editingNotificationId ? 'Update Announcement' : 'Publish Announcement'}
                    </button>
                    {editingNotificationId && (
                      <button type="button" className="btn-secondary" onClick={handleCancelNotificationEdit}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Notifications List */}
              <div className="list-section">
                <h2 className="section-title">All Announcements ({notifications.length})</h2>
                {loading && <p className="loading-text">Loading announcements...</p>}
                {!loading && notifications.length === 0 && <p className="empty-text">No announcements yet. Publish one to get started!</p>}
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div key={notification._id} className="notification-card">
                      <div className="notification-header">
                        <div className="notification-badges">
                          <span className={`badge badge-type ${notification.type}`}>{notification.type}</span>
                          <span className={`badge badge-priority ${notification.priority}`}>{notification.priority}</span>
                          <span className="badge badge-audience">{notification.target_audience}</span>
                        </div>
                        <div className="notification-date">
                          {new Date(notification.published_at).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="notification-title">{notification.title}</h3>
                      <p className="notification-message">{notification.message}</p>
                      {notification.image_url && (
                        <div className="notification-image-preview">
                          <img src={notification.image_url} alt="Notification" />
                        </div>
                      )}
                      <div className="notification-meta">
                        <span>Views: {notification.views_count}</span>
                        {notification.expires_at && (
                          <span>Expires: {new Date(notification.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      <div className="notification-actions">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEditNotification(notification)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteNotification(notification._id)}
                          title="Delete"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SystemConfig;
