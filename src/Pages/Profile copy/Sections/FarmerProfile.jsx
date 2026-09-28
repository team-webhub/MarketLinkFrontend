import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../../Core/api';
import {
  addFavoriteFarmer,
  removeFavoriteFarmer,
  getUserFavorites,
} from '../../../Core/favoritesService';
import '../Styles/FarmerProfile.css';

gsap.registerPlugin(ScrollTrigger);

const demoFarmer = {
  _id: 'farmer-1',
  business_name: 'Green Valley Farms',
  username: 'greenvalley',
  profile_picture: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=400&auto=format&fit=crop',
  address: 'Mughalpura, Lahore',
  contact_number: '+92 300 1234567',
  markets: ['Lahore Central Market', 'Green Valley Market'],
  operating_days: ['Friday', 'Saturday', 'Sunday'],
  rating: 4.8,
  totalReviews: 47,
  about: 'We specialize in organic produce from sustainable local farming. Our strawberries are picked fresh every morning to ensure maximum quality and freshness.',
  latitude: 31.5204,
  longitude: 74.3587,
  products: [
    { id: 1, name: 'Organic Strawberries', category: 'Fruits', price: 420, unit: 'kg', stock: 24 },
    { id: 2, name: 'Leafy Greens Mix', category: 'Vegetables', price: 260, unit: 'bundle', stock: 18 },
    { id: 3, name: 'Farm Eggs', category: 'Dairy', price: 310, unit: 'dozen', stock: 30 },
  ],
  reviews: [
    {
      id: 1,
      customer: 'Sara A.',
      rating: 5,
      comment: 'Excellent quality and very fresh. The farmer is also very friendly and helpful.',
      date: '2 days ago',
    },
    {
      id: 2,
      customer: 'Usman K.',
      rating: 4,
      comment: 'Beautiful produce and good communication. Will buy again.',
      date: '1 week ago',
    },
    {
      id: 3,
      customer: 'Hina M.',
      rating: 5,
      comment: 'Best local farmer market experience. Highly recommended!',
      date: '2 weeks ago',
    },
  ],
};

function FarmerProfile() {
  const { farmerId } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState(demoFarmer);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeReview, setActiveReview] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [customerCompletedOrders, setCustomerCompletedOrders] = useState([]);
  const [reviewOrderId, setReviewOrderId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewForm, setReviewForm] = useState({
    orderId: '',
    productId: '',
    rating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSummary, setReviewSummary] = useState({ avg_rating: 0, total_reviews: 0 });

  const headerRef = useRef(null);
  const aboutRef = useRef(null);
  const productsRef = useRef(null);
  const reviewsRef = useRef(null);
  const statsRef = useRef([]);

  const getProfileImage = (image) => {
    if (!image) return demoFarmer.profile_picture;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/uploads/')) return `http://localhost:5000${image}`;
    if (image.startsWith('uploads/')) return `http://localhost:5000/${image}`;
    return image;
  };

  const getReviewStars = (rating = 0) => '★'.repeat(Math.max(0, Number(rating) || 0));

  const renderStarPicker = (value, onChange) => (
    <div className="fp-star-picker" aria-label="Choose rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`fp-star-button ${star <= value ? 'filled' : ''}`}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  const sortedReviews = [...(farmer?.reviews || [])].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        setLoading(true);

        if (farmerId) {
          const response = await API.get(`/users/farmer/${farmerId}`);
          const apiProfile = response.data?.profile || response.data?.user || null;
          const apiProducts = response.data?.weekly_stock || response.data?.products || [];
          const apiReviews = response.data?.reviews || [];

          if (apiProfile) {
            const normalizedFarmer = {
              _id: apiProfile._id || farmerId,
              business_name: apiProfile.stall_name || apiProfile.business_name || apiProfile.username || 'Farmer Stall',
              username: apiProfile.username || apiProfile.contact_person || 'farmer',
              profile_picture: getProfileImage(apiProfile.profile_picture),
              address: apiProfile.address || 'Address not available',
              contact_number: apiProfile.phone || apiProfile.contact_number || demoFarmer.contact_number,
              markets: apiProfile.markets || ['Local Market'],
              operating_days: apiProfile.operating_days || demoFarmer.operating_days,
              rating: Number(apiProfile.avg_rating) || 4.8,
              totalReviews: Number(apiProfile.total_reviews || apiReviews.length || 0),
              about: apiProfile.about || 'Professional farmer committed to sustainable agriculture and fresh produce quality.',
              latitude: apiProfile.latitude || demoFarmer.latitude,
              longitude: apiProfile.longitude || demoFarmer.longitude,
              products: (apiProducts || []).map((product) => ({
                id: product._id || product.id,
                name: product.name,
                category: product.category || 'General',
                price: Number(product.price || 0),
                unit: product.unit || 'unit',
                stock: Number(product.stock_quantity || product.stock || 0),
                image: product.image_url || product.image || demoFarmer.profile_picture,
              })),
              reviews: apiReviews.length > 0
                ? apiReviews.map((review, index) => ({
                    id: review._id || review.id || index + 1,
                    customer: review.customer || review.name || 'Customer',
                    rating: Number(review.rating || 5),
                    comment: review.comment || review.review || 'Fresh and reliable quality.',
                    date: review.date || review.createdAt || 'Recently',
                  }))
                : demoFarmer.reviews,
            };

            setFarmer(normalizedFarmer);
            return;
          }
        }

        setFarmer(demoFarmer);
      } catch (error) {
        console.error('Farmer fetch failed:', error);
        setFarmer(demoFarmer);
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, [farmerId]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(
        statsRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'back.out(1.3)',
        }
      );

      gsap.fromTo(
        aboutRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: aboutRef.current,
            start: 'top 85%',
          },
        }
      );

      gsap.fromTo(
        productsRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: productsRef.current,
            start: 'top 85%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, [farmer]);

  useEffect(() => {
    const fetchSavedFavorites = async () => {
      try {
        const response = await getUserFavorites();
        const savedFarmers = (response.favoriteFarmers || []).map((item) => item._id || item);
        setFavorite(savedFarmers.includes(farmerId));
      } catch (error) {
        console.warn('User has no saved farmer favorites yet.', error);
      }
    };

    if (farmerId) fetchSavedFavorites();
  }, [farmerId]);

  const fetchFarmerReviews = async (currentFarmerId) => {
    try {
      const response = await API.get(`/reviews/farmer/${currentFarmerId}`);
      const apiReviews = Array.isArray(response?.data?.reviews) ? response.data.reviews : [];
      setReviewSummary({
        avg_rating: Number(response?.data?.avg_rating || 0),
        total_reviews: Number(response?.data?.total_reviews || apiReviews.length || 0),
      });
      setFarmer((prev) => ({
        ...prev,
        reviews: apiReviews.map((review, index) => ({
          id: review._id || review.id || index + 1,
          customer: review.customer_id?.username || 'Customer',
          rating: Number(review.rating || 5),
          comment: review.comment || 'Fresh and reliable quality.',
          date: review.review_date ? new Date(review.review_date).toLocaleDateString() : 'Recently',
        })),
        rating: Number(response?.data?.avg_rating || prev.rating || 0) || 0,
        totalReviews: Number(response?.data?.total_reviews || apiReviews.length || prev.totalReviews || 0),
      }));
    } catch (error) {
      console.warn('Farmer reviews fetch failed:', error);
    }
  };

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        const response = await API.get('/customerOrder/my-orders');
        const completedOrders = (response?.data?.orders || []).filter((order) =>
          String(order.order_status || '').toLowerCase() === 'completed'
        );
        setCustomerCompletedOrders(completedOrders);
      } catch (error) {
        console.warn('Customer completed orders fetch failed:', error);
      }
    };

    fetchCompletedOrders();
  }, []);

  useEffect(() => {
    if (farmerId) {
      fetchFarmerReviews(farmerId);
    }
  }, [farmerId]);

  const handleOpenMaps = () => {
    if (farmer?.latitude && farmer?.longitude) {
      const mapsUrl = `https://www.google.com/maps/?q=${farmer.latitude},${farmer.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleToggleFarmerFavorite = async () => {
    if (!farmerId) return;

    try {
      if (favorite) {
        await removeFavoriteFarmer(farmerId);
        setFavorite(false);
      } else {
        await addFavoriteFarmer(farmerId);
        setFavorite(true);
      }
    } catch (error) {
      console.error('Failed to update favorite farmer:', error);
      alert('Please login to save this farmer to your favorites.');
    }
  };

  const handleSubmitFarmerReview = async (event) => {
    event.preventDefault();
    if (!reviewForm.orderId || !reviewForm.productId || !reviewForm.comment.trim()) {
      setReviewError('Please select an order, product, and add a review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      await API.post('/reviews/farmer', {
        farmerId,
        orderId: reviewForm.orderId,
        productId: reviewForm.productId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });

      setReviewForm({ orderId: '', productId: '', rating: 5, comment: '' });
      if (farmerId) fetchFarmerReviews(farmerId);
      setCustomerCompletedOrders((prev) => prev.filter((order) => order._id !== reviewForm.orderId));
    } catch (error) {
      setReviewError(error.response?.data?.message || 'Could not submit your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const completedOrderOptions = customerCompletedOrders.filter((order) => String(order.farmer_id?._id || order.farmer_id) === String(farmerId));

  useEffect(() => {
    if (!reviewForm.orderId) {
      setReviewForm((prev) => ({ ...prev, productId: '' }));
      return;
    }

    const selectedOrder = completedOrderOptions.find((order) => order._id === reviewForm.orderId);
    if (selectedOrder && selectedOrder.product_id?._id) {
      setReviewForm((prev) => ({ ...prev, productId: selectedOrder.product_id._id }));
    }
  }, [reviewForm.orderId, completedOrderOptions]);

  if (loading) {
    return (
      <section className="fp-section">
        <div className="fp-loader">Loading farmer profile...</div>
      </section>
    );
  }

  return (
    <section className="fp-section">
      <div className="fp-container">
        <button className="fp-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div ref={headerRef} className="fp-header">
          <div className="fp-profile-card">
            <img src={farmer?.profile_picture} alt={farmer?.business_name} className="fp-profile-image" />
            <div className="fp-profile-info">
              <h1 className="fp-business-name">{farmer?.business_name}</h1>
              <p className="fp-username">@{farmer?.username}</p>
              <p className="fp-address">📍 {farmer?.address}</p>
              <p className="fp-contact">📞 {farmer?.contact_number}</p>
            </div>
          </div>

          <div className="fp-stats-grid">
            <div ref={(el) => (statsRef.current[0] = el)} className="fp-stat-box">
              <span className="fp-stat-value">★ {farmer?.rating || 4.5}</span>
              <span className="fp-stat-label">Rating</span>
            </div>
            <div ref={(el) => (statsRef.current[1] = el)} className="fp-stat-box">
              <span className="fp-stat-value">{farmer?.totalReviews || 0}</span>
              <span className="fp-stat-label">Reviews</span>
            </div>
            <div ref={(el) => (statsRef.current[2] = el)} className="fp-stat-box">
              <span className="fp-stat-value">{farmer?.products?.length || 0}</span>
              <span className="fp-stat-label">Products</span>
            </div>
            <div ref={(el) => (statsRef.current[3] = el)} className="fp-stat-box">
              <span className="fp-stat-value">{farmer?.markets?.length || 1}</span>
              <span className="fp-stat-label">Markets</span>
            </div>
          </div>

          <div className="fp-operating-info">
            <div>
              <span className="fp-label">Operating Days</span>
              <div className="fp-days-list">
                {(farmer?.operating_days || []).map((day) => (
                  <span key={day} className="fp-day-badge">{day}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="fp-label">Markets</span>
              <div className="fp-markets-list">
                {(farmer?.markets || []).map((market) => (
                  <span key={market} className="fp-market-badge">📍 {market}</span>
                ))}
              </div>
            </div>
          </div>

          <button className="fp-directions-btn" onClick={handleOpenMaps}>
            Get Directions on Map →
          </button>
        </div>

        <div ref={aboutRef} className="fp-about-section">
          <h2>About This Farmer</h2>
          <p>{farmer?.about || 'Professional farmer committed to sustainable agriculture and fresh produce quality.'}</p>
        </div>

        <div className="fp-section-divider" />

        <div className="fp-products-section">
          <h2>Weekly Stock</h2>
          <div ref={productsRef} className="fp-products-grid">
            {(farmer?.products || []).map((product) => (
              <div key={product.id} className="fp-product-card" onClick={() => setSelectedProduct(product)}>
                <div className="fp-product-header">
                  <h3>{product.name}</h3>
                  <span className="fp-product-category">{product.category}</span>
                </div>
                <div className="fp-product-details">
                  <span className="fp-product-price">Rs. {product.price}</span>
                  <span className="fp-product-unit">/ {product.unit}</span>
                </div>
                <div className="fp-product-footer">
                  <span className={`fp-product-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                  </span>
                  <span className="fp-product-rating-badge">★ {farmer?.rating || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fp-section-divider" />

        <div ref={reviewsRef} className="fp-reviews-section">
          <h2>Customer Reviews ({farmer?.totalReviews || 0})</h2>
          <div className="fp-review-summary">
            <strong>{reviewSummary.avg_rating ? Number(reviewSummary.avg_rating).toFixed(1) : 'No rating yet'}</strong>
            <span>{reviewSummary.total_reviews || 0} review(s)</span>
          </div>
          <div className="fp-reviews-container">
            {(sortedReviews || []).map((review, index) => (
              <div
                key={review.id}
                className={`fp-review-card ${index === activeReview ? 'active' : ''}`}
                onClick={() => setActiveReview(index)}
              >
                <div className="fp-review-header">
                  <strong>{review.customer}</strong>
                  <span className="fp-review-rating">{getReviewStars(review.rating)}</span>
                </div>
                <p className="fp-review-text">{review.comment}</p>
                <small className="fp-review-date">{review.date}</small>
              </div>
            ))}
          </div>

          {completedOrderOptions.length > 0 && (
            <form className="fp-review-form" onSubmit={handleSubmitFarmerReview}>
              <h3>Leave a Review for This Farmer</h3>
              <div className="fp-review-form-grid">
                <div className="fp-review-form-group">
                  <label>Completed Order</label>
                  <select
                    value={reviewForm.orderId}
                    onChange={(event) => setReviewForm((prev) => ({ ...prev, orderId: event.target.value }))}
                  >
                    <option value="">Select an order</option>
                    {completedOrderOptions.map((order) => (
                      <option key={order._id} value={order._id}>
                        {order.product_id?.name || 'Order'} • {order.pickup_date || 'Pickup date'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fp-review-form-group">
                  <label>Rating</label>
                  {renderStarPicker(reviewForm.rating, (value) => setReviewForm((prev) => ({ ...prev, rating: value })))}
                </div>
              </div>

              <div className="fp-review-form-group" style={{ marginTop: '1rem' }}>
                <label>Your Feedback</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, comment: event.target.value }))}
                  placeholder="Tell other customers about your experience with this farmer..."
                />
              </div>

              <div className="fp-review-actions">
                <button type="submit" className="fp-submit-review-btn" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>

              {reviewError && <span className="fp-review-error">{reviewError}</span>}
            </form>
          )}
        </div>

        <div className="fp-section-divider" />

        <div className="fp-cta-section">
          <h2>Ready to Order?</h2>
          <p>Browse fresh produce from this farmer and place your pre-order today.</p>
          <button className="fp-shop-btn" onClick={() => navigate('/Services')}>
            Go to Product Catalog →
          </button>
        </div>
      </div>

      {selectedProduct && (
        <div className="fp-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="fp-modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="fp-modal-close" onClick={() => setSelectedProduct(null)}>✕</button>
            <h3>{selectedProduct.name}</h3>
            <p><strong>Category:</strong> {selectedProduct.category}</p>
            <p><strong>Price:</strong> Rs. {selectedProduct.price} per {selectedProduct.unit}</p>
            <p><strong>Stock:</strong> {selectedProduct.stock} available</p>
            <button className="fp-modal-btn" onClick={() => {
              setSelectedProduct(null);
              navigate('/Services');
            }}>
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default FarmerProfile;
