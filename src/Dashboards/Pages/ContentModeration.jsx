import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import '../Styles/ContentModeration.css';

const ContentModeration = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [flaggedProducts, setFlaggedProducts] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flagReasonModal, setFlagReasonModal] = useState({ show: false, id: null, type: null });
  const [reason, setReason] = useState('');

  const token = localStorage.getItem('token');
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'products') {
      fetchFlaggedProducts();
    } else {
      fetchFlaggedReviews();
    }
  }, [activeTab]);

  const fetchFlaggedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/moderation/products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFlaggedProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching flagged products:', error);
      toast.error('Failed to load flagged products');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlaggedReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/admin/moderation/reviews`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFlaggedReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching flagged reviews:', error);
      toast.error('Failed to load flagged reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagProduct = (productId) => {
    setFlagReasonModal({ show: true, id: productId, type: 'product' });
  };

  const handleFlagReview = (reviewId) => {
    setFlagReasonModal({ show: true, id: reviewId, type: 'review' });
  };

  const submitFlag = async () => {
    try {
      if (flagReasonModal.type === 'product') {
        await axios.post(
          `${API_BASE_URL}/admin/moderation/products/${flagReasonModal.id}/flag`,
          { reason: reason || 'Inappropriate content' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Product flagged successfully');
        fetchFlaggedProducts();
      } else {
        await axios.post(
          `${API_BASE_URL}/admin/moderation/reviews/${flagReasonModal.id}/flag`,
          { reason: reason || 'Inappropriate content' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Review flagged successfully');
        fetchFlaggedReviews();
      }
      setFlagReasonModal({ show: false, id: null, type: null });
      setReason('');
    } catch (error) {
      console.error('Error flagging content:', error);
      toast.error('Failed to flag content');
    }
  };

  const removeProduct = async (productId) => {
    if (window.confirm('Are you sure you want to permanently remove this product?')) {
      try {
        await axios.delete(
          `${API_BASE_URL}/admin/moderation/products/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Product removed successfully');
        fetchFlaggedProducts();
      } catch (error) {
        console.error('Error removing product:', error);
        toast.error('Failed to remove product');
      }
    }
  };

  const removeReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to permanently remove this review?')) {
      try {
        await axios.delete(
          `${API_BASE_URL}/admin/moderation/reviews/${reviewId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Review removed successfully');
        fetchFlaggedReviews();
      } catch (error) {
        console.error('Error removing review:', error);
        toast.error('Failed to remove review');
      }
    }
  };

  return (
    <div className="content-moderation-container">
      <button type="button" className="admin-back-button" onClick={() => navigate('/admindashboard')}>
        <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        Back to Admin Dashboard
      </button>
      <div className="moderation-header">
        <h1><i className="fa-solid fa-shield-halved" aria-hidden="true"></i> Content Moderation</h1>
        <p>Review and remove inappropriate product listings and customer reviews</p>
      </div>

      <div className="moderation-tabs">
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <i className="fa-solid fa-box" aria-hidden="true"></i> Products ({flaggedProducts.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <i className="fa-solid fa-star" aria-hidden="true"></i> Reviews ({flaggedReviews.length})
        </button>
      </div>

      <div className="moderation-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : activeTab === 'products' ? (
          <div className="items-list">
            {flaggedProducts.length === 0 ? (
              <div className="empty-state">No flagged products found ✅</div>
            ) : (
              flaggedProducts.map((product) => (
                <div key={product._id} className="item-card">
                  <div className="item-header">
                    <h3>{product.name}</h3>
                    <span className="flag-badge">⚠️ Flagged</span>
                  </div>
                  <div className="item-details">
                    <p><strong>Category:</strong> {product.category}</p>
                    <p><strong>Price:</strong> ₹{product.price}/{product.unit}</p>
                    <p><strong>Description:</strong> {product.description || 'N/A'}</p>
                    <p><strong>Farmer:</strong> {product.Farmer_id?.username || 'Unknown'}</p>
                    {product.flag_reason && (
                      <p><strong>Flag Reason:</strong> {product.flag_reason}</p>
                    )}
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn btn-flag"
                      onClick={() => handleFlagProduct(product._id)}
                    >
                      Update Flag
                    </button>
                    <button
                      className="btn btn-remove"
                      onClick={() => removeProduct(product._id)}
                    >
                      Remove Product
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="items-list">
            {flaggedReviews.length === 0 ? (
              <div className="empty-state">No flagged reviews found ✅</div>
            ) : (
              flaggedReviews.map((review) => (
                <div key={review._id} className="item-card">
                  <div className="item-header">
                    <h3>{review.product_id?.name || 'Unknown Product'}</h3>
                    <span className="flag-badge">⚠️ Flagged</span>
                  </div>
                  <div className="item-details">
                    <p><strong>Customer:</strong> {review.customer_id?.username || 'Unknown'}</p>
                    <p><strong>Rating:</strong> {'⭐'.repeat(review.rating)}</p>
                    <p><strong>Comment:</strong> {review.comment}</p>
                    {review.farmer_response && (
                      <p><strong>Farmer Response:</strong> {review.farmer_response}</p>
                    )}
                    {review.flag_reason && (
                      <p><strong>Flag Reason:</strong> {review.flag_reason}</p>
                    )}
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn btn-flag"
                      onClick={() => handleFlagReview(review._id)}
                    >
                      Update Flag
                    </button>
                    <button
                      className="btn btn-remove"
                      onClick={() => removeReview(review._id)}
                    >
                      Remove Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {flagReasonModal.show && (
        <div className="modal-overlay" onClick={() => setFlagReasonModal({ show: false, id: null, type: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Update Flag Reason</h2>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for flagging (e.g., Inappropriate content, False advertisement, etc.)"
              rows="4"
            />
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={submitFlag}
              >
                Update Flag
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setFlagReasonModal({ show: false, id: null, type: null });
                  setReason('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentModeration;
