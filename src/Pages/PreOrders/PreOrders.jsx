import React, { useEffect, useMemo, useState, useRef } from 'react';
import gsap from 'gsap';
import API from '../../Core/api';
import './PreOrders.css';

const normalizeOrderStatus = (status = '') => String(status || '').trim().toLowerCase();

const getStatusColor = (status = '') => {
  const normalized = normalizeOrderStatus(status);
  if (['placed', 'pending'].includes(normalized)) return 'status-placed';
  if (['accepted'].includes(normalized)) return 'status-accepted';
  if (['ready_for_pickup', 'ready'].includes(normalized)) return 'status-ready';
  if (['completed', 'delivered'].includes(normalized)) return 'status-completed';
  if (['cancelled', 'declined'].includes(normalized)) return 'status-cancelled';
  return 'status-default';
};

const getDisplayStatus = (order = {}) => {
  const normalized = normalizeOrderStatus(order.order_status);
  const labelMap = {
    pending: 'Pending',
    placed: 'Placed',
    accepted: 'Accepted',
    declined: 'Declined',
    ready_for_pickup: 'Ready for Pickup',
    ready: 'Ready for Pickup',
    completed: 'Completed',
    cancelled: 'Cancelled',
    delivered: 'Delivered',
    shipped: 'Shipped',
    processing: 'Processing',
  };

  return order.order_status_label || labelMap[normalized] || 'Placed';
};

const canModifyOrder = (order = {}) => ['placed', 'pending'].includes(normalizeOrderStatus(order.order_status));
const canCancelOrder = (order = {}) => ['placed', 'pending'].includes(normalizeOrderStatus(order.order_status));
const canReviewOrder = (order = {}) => normalizeOrderStatus(order.order_status) === 'completed';

const defaultSlots = [
  '9:00 AM - 11:00 AM',
  '11:30 AM - 1:30 PM',
  '2:00 PM - 4:00 PM',
  '5:00 PM - 7:00 PM',
];

function PreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const containerRef = useRef(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get('/customerOrder/my-orders');
      const fetchedOrders = Array.isArray(response?.data?.orders) ? response.data.orders : [];
      setOrders(fetchedOrders.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0)));
      setError('');
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
      setError('Unable to load your pre-orders right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 15000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOrders();
      }
    };

    const handleWindowFocus = () => {
      fetchOrders();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll('.preorder-card'),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }, [loading, orders]);

  const activeOrders = useMemo(
    () => orders.filter((order) => !['cancelled', 'completed', 'declined'].includes(normalizeOrderStatus(order.order_status))),
    [orders]
  );

  const pastOrders = useMemo(
    () => orders.filter((order) => ['cancelled', 'completed', 'declined'].includes(normalizeOrderStatus(order.order_status))),
    [orders]
  );

  const handleCancel = async (orderId) => {
    const order = orders.find((item) => item._id === orderId);
    if (!order || !canCancelOrder(order)) {
      setError('This order cannot be cancelled because it has already been accepted or is no longer in a cancellable state.');
      return;
    }

    try {
      await API.delete(`/customerOrder/cancel/${orderId}`);
      setError('');
      await fetchOrders();
    } catch (err) {
      console.error('Cancel failed:', err);
      setError(err.response?.data?.message || 'Could not cancel this order.');
    }
  };

  const handleQuickReorder = async (orderId) => {
    try {
      await API.post(`/customerOrder/reorder/${orderId}`);
      setError('');
      fetchOrders();
    } catch (err) {
      console.error('Reorder failed:', err);
      setError(err.response?.data?.message || 'Could not reorder this item.');
    }
  };

  const handleModifyOrder = async () => {
    if (!selectedOrder) return;

    if (!canModifyOrder(selectedOrder)) {
      setError('This order can no longer be changed.');
      return;
    }

    const quantity = Number(selectedOrder.quantity || 1);
    if (quantity < 1) {
      setError('Quantity must be at least 1.');
      return;
    }

    if (!selectedOrder.pickup_date || !selectedOrder.pickup_slot) {
      setError('Please select both pickup date and pickup slot.');
      return;
    }

    try {
      await API.put(`/customerOrder/update/${selectedOrder._id}`, {
        quantity,
        pickupDate: selectedOrder.pickup_date,
        pickupSlot: selectedOrder.pickup_slot,
      });

      setSelectedOrder(null);
      setError('');
      fetchOrders();
    } catch (err) {
      console.error('Modify failed:', err);
      setError(err.response?.data?.message || 'Unable to modify this order right now.');
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    try {
      await API.post('/reviews', {
        orderId: reviewingOrder._id,
        productId: reviewingOrder.product_id?._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewingOrder(null);
      setReviewComment('');
      setReviewRating(5);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your review.');
    }
  };

  const renderOrderCard = (order) => (
    <div key={order._id} className="preorder-card">
      <div className="preorder-card-header">
        <div className="preorder-title-group">
          <h3 className="preorder-item-name">{order.product_id?.name || 'Fresh Produce'}</h3>
          <p className="preorder-farmer-name">
            <i className="fa fa-user-circle-o" aria-hidden="true" />{' '}
            {order.farmer_id?.business_name || order.farmer_id?.username || 'Local Farmer'}
          </p>
        </div>
        <span className={`status-badge ${getStatusColor(order.order_status)}`}>
          {getDisplayStatus(order)}
        </span>
      </div>

      <div className="preorder-details-grid">
        <div className="detail-item">
          <span className="detail-label">Quantity</span>
          <strong className="detail-value">{order.quantity}</strong>
        </div>
        <div className="detail-item">
          <span className="detail-label">Pickup Date</span>
          <strong className="detail-value">{order.pickup_date || 'Not set'}</strong>
        </div>
        <div className="detail-item">
          <span className="detail-label">Pickup Time</span>
          <strong className="detail-value">{order.pickup_slot || 'Any available slot'}</strong>
        </div>
        <div className="detail-item">
          <span className="detail-label">Total Amount</span>
          <strong className="detail-value price-highlight">Rs. {order.total_amount || 0}</strong>
        </div>
      </div>

      <div className="payment-note">
        <span className="pay-dot" /> {order.payment_method || 'pickup'} • {order.payment_status || (order.payment_method === 'online' ? 'pending' : 'unpaid')}
      </div>

      <div className="preorder-actions">
        <button type="button" className="po-btn btn-secondary" onClick={() => setSelectedOrder(order)}>
          View
        </button>

        {canModifyOrder(order) && (
          <button type="button" className="po-btn btn-secondary" onClick={() => setSelectedOrder(order)}>
            Modify
          </button>
        )}

        {canCancelOrder(order) && (
          <button type="button" className="po-btn btn-danger" onClick={() => handleCancel(order._id)}>
            Cancel
          </button>
        )}

        {['cancelled', 'completed', 'declined'].includes(normalizeOrderStatus(order.order_status)) && (
          <button type="button" className="po-btn btn-primary" onClick={() => handleQuickReorder(order._id)}>
            Reorder
          </button>
        )}

        {canReviewOrder(order) && (
          <button
            type="button"
            className="po-btn btn-review"
            onClick={() => (window.location.href = `/farmer/${order.farmer_id?._id || order.farmer_id}`)}
            title="Leave a review from the farmer's profile"
          >
            Leave Review
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="preorders-page" ref={containerRef}>
      {/* Top Banner Header */}
      <div className="preorders-header">
        <div className="header-title-wrap">
          <span className="po-eyebrow">— MY PICKUP BASKET</span>
          <h1 className="po-main-heading">
            CUSTOMER <span className="green-accent">PRE-ORDERS</span>
          </h1>
        </div>
        <button type="button" className="po-btn btn-primary header-cta" onClick={() => (window.location.href = '/services')}>
          Shop Produce <i className="fa fa-arrow-right" aria-hidden="true" />
        </button>
      </div>

      {error && <div className="form-error-box">{error}</div>}

      {/* Summary Stats Bar */}
      <div className="preorders-stats-bar">
        <div className="stat-card">
          <span className="stat-label">Active Pre-Orders</span>
          <span className="stat-value">{activeOrders.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Order History</span>
          <span className="stat-value">{pastOrders.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="empty-state-card">
          <div className="spinner-green" />
          <p>Loading your orders...</p>
        </div>
      ) : (
        <>
          {/* Active Orders Section */}
          <section className="preorders-section">
            <div className="section-title-wrap">
              <h2 className="section-title">Active Orders</h2>
              <span className="count-tag">{activeOrders.length}</span>
            </div>
            {activeOrders.length ? (
              <div className="orders-grid">{activeOrders.map(renderOrderCard)}</div>
            ) : (
              <div className="empty-state-card">
                <p>No active pre-orders yet.</p>
              </div>
            )}
          </section>

          {/* Past Orders Section */}
          <section className="preorders-section">
            <div className="section-title-wrap">
              <h2 className="section-title">Order History</h2>
              <span className="count-tag muted">{pastOrders.length}</span>
            </div>
            {pastOrders.length ? (
              <div className="orders-grid">{pastOrders.map(renderOrderCard)}</div>
            ) : (
              <div className="empty-state-card">
                <p>No previous orders yet.</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* Modal: View & Modify Order */}
      {selectedOrder && (
        <div className="preorder-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="preorder-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedOrder(null)}>
              ×
            </button>
            <span className="modal-eyebrow">— ORDER DETAILS</span>
            <h3 className="modal-title">{selectedOrder.product_id?.name || 'Order Details'}</h3>

            <div className="modal-grid">
              <div className="modal-info-block">
                <span>Farmer</span>
                <strong>{selectedOrder.farmer_id?.business_name || selectedOrder.farmer_id?.username}</strong>
              </div>
              <div className="modal-info-block">
                <span>Quantity</span>
                <strong>{selectedOrder.quantity}</strong>
              </div>
              <div className="modal-info-block">
                <span>Pickup Date</span>
                <strong>{selectedOrder.pickup_date || 'To be selected'}</strong>
              </div>
              <div className="modal-info-block">
                <span>Pickup Slot</span>
                <strong>{selectedOrder.pickup_slot || 'Any slot available'}</strong>
              </div>
              <div className="modal-info-block">
                <span>Order Status</span>
                <strong className="status-text-highlight">{getDisplayStatus(selectedOrder)}</strong>
              </div>
              <div className="modal-info-block">
                <span>Total</span>
                <strong className="price-highlight">Rs. {selectedOrder.total_amount || 0}</strong>
              </div>
            </div>

            {canModifyOrder(selectedOrder) && (
              <div className="modal-edit-section">
                <h4 className="edit-section-title">Modify Order</h4>
                <div className="preorder-inline-form">
                  <label className="form-group">
                    <span>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      className="po-input"
                      value={selectedOrder.quantity || 1}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, quantity: Number(e.target.value) || 1 })}
                    />
                  </label>
                  <label className="form-group">
                    <span>Pickup Date</span>
                    <input
                      type="date"
                      className="po-input"
                      value={selectedOrder.pickup_date || ''}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, pickup_date: e.target.value })}
                    />
                  </label>
                </div>

                <div className="slot-picker-wrap">
                  <span className="picker-label">Pickup Slot</span>
                  <div className="slot-list">
                    {defaultSlots.map((slot) => (
                      <span
                        key={slot}
                        className={selectedOrder.pickup_slot === slot ? 'slot active' : 'slot'}
                        onClick={() => setSelectedOrder({ ...selectedOrder, pickup_slot: slot })}
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="preorder-actions modal-actions" style={{ marginTop: '1.5rem' }}>
                  <button type="button" className="po-btn btn-primary" onClick={handleModifyOrder}>
                    Save Changes
                  </button>
                  <button type="button" className="po-btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                    Close
                  </button>
                </div>
              </div>
            )}

            {!canModifyOrder(selectedOrder) && (
              <div className="preorder-actions modal-actions">
                <button type="button" className="po-btn btn-secondary" onClick={() => setSelectedOrder(null)}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Write Review */}
      {reviewingOrder && (
        <div className="preorder-modal-backdrop" onClick={() => setReviewingOrder(null)}>
          <form className="preorder-modal" onSubmit={handleSubmitReview} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setReviewingOrder(null)}>
              ×
            </button>
            <span className="modal-eyebrow">— FEEDBACK</span>
            <h3 className="modal-title">Review {reviewingOrder.product_id?.name || 'your purchase'}</h3>

            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <span>Rating</span>
              <select className="po-input po-select" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                <option value={5}>5 ★ - Excellent</option>
                <option value={4}>4 ★ - Very Good</option>
                <option value={3}>3 ★ - Good</option>
                <option value={2}>2 ★ - Fair</option>
                <option value={1}>1 ★ - Poor</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <span>Comment</span>
              <textarea
                className="po-input po-textarea"
                rows="4"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this order..."
                required
              />
            </div>

            <div className="preorder-actions modal-actions">
              <button type="submit" className="po-btn btn-primary">
                Submit Review
              </button>
              <button type="button" className="po-btn btn-secondary" onClick={() => setReviewingOrder(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default PreOrders;