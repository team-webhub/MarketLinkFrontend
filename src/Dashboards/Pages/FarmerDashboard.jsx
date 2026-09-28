import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getFarmerProfileService,
  updateFarmerProfileService,
  getFarmerProductsService,
  addProductService,
  updateProductService,
  deleteProductService,
  getFarmerOrdersService,
  updateOrderStatusService,
  getFarmerAnalyticsService,
  getFarmerReviewsService,
  respondToReviewService,
  getAvailableMarketsService,
  importProductsService,
} from '../Services/farmerService';
import NotificationBell from '../Components/NotificationBell';
import '../Styles/FarmerDashboard.css';

const DAYS_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const parseWeeklyTemplate = (value = '') =>
  String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const formatWeeklyTemplate = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return String(value || '');
};

const normalizeMarketName = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value?.market_name === 'string') return value.market_name.trim();
  return String(value).trim();
};

const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  placed: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  ready: 'Ready',
  ready_for_pickup: 'Ready for Pickup',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const normalizeOrderStatus = (status) => ORDER_STATUS_LABELS[String(status || '').trim()] || 'Pending';

const getOrderStatusClassName = (status) => {
  const normalized = String(status || '').trim().toLowerCase().replace(/\s+/g, '_');

  if (!normalized || normalized === 'pending' || normalized === 'placed') return 'fd-order-status-pending';
  if (normalized === 'accepted') return 'fd-order-status-accepted';
  if (normalized === 'declined' || normalized === 'cancelled') return 'fd-order-status-declined';
  if (normalized === 'ready' || normalized === 'ready_for_pickup') return 'fd-order-status-ready';
  if (normalized === 'completed' || normalized === 'delivered') return 'fd-order-status-completed';

  return 'fd-order-status-pending';
};

const parsePickupSlots = (value) =>
  String(value || '')
    .split(',')
    .map((slot) => slot.trim())
    .filter(Boolean);

const FALLBACK_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80';

const getProfileImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return FALLBACK_PROFILE_IMAGE;
  const trimmed = imageUrl.trim();
  if (!trimmed) return FALLBACK_PROFILE_IMAGE;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }
  return FALLBACK_PROFILE_IMAGE;
};

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('insights');
  const [loading, setLoading] = useState(true);

  // New Farmer Check State
  const [isNewFarmer, setIsNewFarmer] = useState(false);
  const [setupStep, setSetupStep] = useState(1);

  // Data States
  const [profile, setProfile] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const prevOrdersRef = useRef([]);
  const [analytics, setAnalytics] = useState({});
  const [reviews, setReviews] = useState([]);
  const [availableMarkets, setAvailableMarkets] = useState([]);

  // Setup Form State
  const [setupData, setSetupData] = useState({
    business_name: '',
    contact_person: '',
    contact_number: '',
    address: '',
    latitude: 31.5204,
    longitude: 74.3587,
    markets: [],
    operating_days: ['Saturday', 'Sunday'],
    cutoff_time: '18:00',
    pickup_time_windows: ['09:00 AM - 12:00 PM', '04:00 PM - 07:00 PM'],
  });

  // New Product Form State
  const [newProd, setNewProd] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    stock_quantity: '',
    description: '',
    image_url: '',
    is_available: true,
    is_recurring_template: false,
    weekly_stock_template: '',
    availability_note: '',
  });

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [replyText, setReplyText] = useState({});

  // Product Editing State
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductEditorOpen, setIsProductEditorOpen] = useState(false);

  // Import Products State
  const [importingProducts, setImportingProducts] = useState(false);
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    fetchAvailableMarkets();
    checkInitialProfile();
  }, []);

  useEffect(() => {
    if (!isNewFarmer) {
      if (activeTab === 'insights') loadAnalytics();
      if (activeTab === 'stock') loadProducts();
      if (activeTab === 'orders') loadOrders();
      if (activeTab === 'profile') loadProfile();
      if (activeTab === 'reviews') loadReviews();
    }
  }, [activeTab, isNewFarmer]);

  useEffect(() => {
    if (isNewFarmer) return undefined;

    const intervalId = setInterval(() => {
      fetchOrdersAndNotify(false);
      loadAnalytics();
    }, 8000);

    return () => clearInterval(intervalId);
  }, [isNewFarmer]);

  const fetchAvailableMarkets = async () => {
    try {
      const res = await getAvailableMarketsService();
      const items = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data?.markets) ? res.data.markets : [];
      setAvailableMarkets(
        items
          .map((market) => ({
            _id: market?._id || market?.id || market?.market_id,
            label: normalizeMarketName(market?.market_name || market?.title || market?.name || market),
            value: normalizeMarketName(market?.market_name || market?.title || market?.name || market),
          }))
          .filter((market) => market.label)
      );
    } catch (err) {
      console.error('Failed to load markets', err);
      setAvailableMarkets([]);
    }
  };

  const toggleMarketSelection = (marketName) => {
    const cleanName = normalizeMarketName(marketName);
    if (!cleanName) return;

    setSetupData((prev) => {
      const existing = Array.isArray(prev.markets) ? prev.markets : [];
      const next = existing.includes(cleanName)
        ? existing.filter((name) => name !== cleanName)
        : [...existing, cleanName];
      return { ...prev, markets: next };
    });

    setProfile((prev) => {
      const existing = Array.isArray(prev.markets) ? prev.markets : [];
      const next = existing.includes(cleanName)
        ? existing.filter((name) => name !== cleanName)
        : [...existing, cleanName];
      return { ...prev, markets: next };
    });
  };

  const checkInitialProfile = async () => {
    try {
      setLoading(true);
      const res = await getFarmerProfileService();
      if (res.data?.success && res.data?.farmer) {
        const f = res.data.farmer;
        setProfile(f);

        if (!f.business_name || !f.contact_number || !f.address) {
          setIsNewFarmer(true);
          setSetupData({
            business_name: f.business_name || '',
            contact_person: f.contact_person || f.username || '',
            contact_number: f.contact_number || '',
            address: f.address || '',
            latitude: f.latitude || 31.5204,
            longitude: f.longitude || 74.3587,
            markets: Array.isArray(f.markets) ? f.markets : [],
            operating_days: f.operating_days?.length ? f.operating_days : ['Saturday', 'Sunday'],
            cutoff_time: f.cutoff_time || '18:00',
            pickup_time_windows: f.pickup_time_windows?.length ? f.pickup_time_windows : ['09:00 AM - 12:00 PM'],
          });
        } else {
          setIsNewFarmer(false);
          loadAnalytics();
        }
      }
    } catch (err) {
      toast.error('Profile fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await getFarmerAnalyticsService();
      setAnalytics(res.data?.analytics || {});
    } catch (err) {
      console.error(err);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await getFarmerProfileService();
      setProfile(res.data?.farmer || {});
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await getFarmerProductsService();
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    return fetchOrdersAndNotify(true);
  };

  const fetchOrdersAndNotify = async (suppressToasts = false) => {
    try {
      const res = await getFarmerOrdersService();
      const newOrders = res.data?.orders || [];

      try {
        const prev = prevOrdersRef.current || [];

        if (!suppressToasts && prev.length) {
          const prevMap = new Map(prev.map((o) => [String(o._id), o]));
          const newMap = new Map(newOrders.map((o) => [String(o._id), o]));

          // New orders
          newOrders.forEach((o) => {
            if (!prevMap.has(String(o._id))) {
              toast.success(`New order received: #${o.order_id || String(o._id).slice(-6)}`);
            }
          });

          // Status changes
          newOrders.forEach((o) => {
            const p = prevMap.get(String(o._id));
            if (p && String(p.order_status || '') !== String(o.order_status || '')) {
              toast(`Order #${o.order_id || String(o._id).slice(-6)} status: ${normalizeOrderStatus(o.order_status)}`);
            }
          });

          // Removed / cancelled orders
          prev.forEach((o) => {
            if (!newMap.has(String(o._id))) {
              toast.error(`Order removed: #${o.order_id || String(o._id).slice(-6)}`);
            }
          });
        }
      } catch (compareErr) {
        console.error('Order compare failed', compareErr);
      }

      setOrders(newOrders);
      prevOrdersRef.current = newOrders;

      return newOrders;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const loadReviews = async () => {
    try {
      const res = await getFarmerReviewsService();
      setReviews(res.data?.reviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatusService(order._id, status);
      toast.success(`Order status updated to ${normalizeOrderStatus(status)}`);
      await Promise.all([loadOrders(), loadAnalytics()]);
    } catch (err) {
      console.error('Failed to update order status', err);
      toast.error(err?.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCompleteSetup = async (e) => {
    e.preventDefault();

    if (!setupData.business_name || !setupData.contact_person || !setupData.contact_number || !setupData.address) {
      toast.error('Please complete all required stall details before continuing.');
      return;
    }

    if (!setupData.operating_days.length) {
      toast.error('Select at least one operating day for your stall.');
      return;
    }

    if (!setupData.markets || !setupData.markets.length) {
      toast.error('Select at least one market where your stall will operate.');
      return;
    }

    const pickupSlots = parsePickupSlots(
      Array.isArray(setupData.pickup_time_windows)
        ? setupData.pickup_time_windows.join(', ')
        : setupData.pickup_time_windows
    );
    if (!pickupSlots.length) {
      toast.error('Add at least one pickup slot before launching the dashboard.');
      return;
    }

    try {
      const payload = {
        ...setupData,
        markets: setupData.markets,
        pickup_time_windows: pickupSlots,
      };

      const res = await updateFarmerProfileService(payload);
      if (res.data?.success) {
        toast.success('🎉 Stall Setup Complete! Welcome to your Dashboard.');
        setProfile(res.data.farmer);
        setIsNewFarmer(false);
        setActiveTab('insights');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Setup failed. Please try again.');
    }
  };

  const toggleDay = (day) => {
    setSetupData((prev) => {
      const days = prev.operating_days.includes(day)
        ? prev.operating_days.filter((d) => d !== day)
        : [...prev.operating_days, day];
      return { ...prev, operating_days: days };
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProd,
        stock_quantity: Number(newProd.stock_quantity || 0),
        price: Number(newProd.price || 0),
        weekly_stock_template: parseWeeklyTemplate(newProd.weekly_stock_template),
      };

      await addProductService(payload);
      toast.success('Product added successfully!');
      setIsAddProductModalOpen(false);
      setNewProd({
        name: '',
        category: 'Vegetables',
        price: '',
        unit: 'kg',
        stock_quantity: '',
        description: '',
        image_url: '',
        is_available: true,
        is_recurring_template: false,
        weekly_stock_template: '',
        availability_note: '',
      });
      loadProducts();
    } catch (err) {
      toast.error('Failed to add product');
    }
  };

  const toggleAvailability = async (prod) => {
    try {
      await updateProductService(prod._id, { is_available: !prod.is_available });
      toast.success('Availability updated!');
      loadProducts();
    } catch (err) {
      toast.error('Status update failed');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductService(prodId);
        toast.success('Product deleted');
        loadProducts();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const openEditProductModal = (product) => {
    setEditingProduct({
      ...product,
      weekly_stock_template: formatWeeklyTemplate(product.weekly_stock_template || ''),
    });
    setIsProductEditorOpen(true);
  };

  const closeEditProductModal = () => {
    setIsProductEditorOpen(false);
    setEditingProduct(null);
  };

  const handleProductEditFieldChange = (field, value) => {
    setEditingProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEditedProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct?._id) return;

    try {
      const payload = {
        ...editingProduct,
        price: Number(editingProduct.price || 0),
        stock_quantity: Number(editingProduct.stock_quantity || 0),
        weekly_stock_template: parseWeeklyTemplate(editingProduct.weekly_stock_template),
      };

      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;

      await updateProductService(editingProduct._id, payload);
      toast.success('Product updated successfully!');
      closeEditProductModal();
      loadProducts();
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const exportOrderHistoryCsv = () => {
    if (!orders.length) {
      toast.error('No order history available to export.');
      return;
    }

    const header = ['Order ID', 'Customer', 'Product', 'Quantity', 'Total Amount', 'Status'];
    const rows = orders.map((o) => [
      o.order_id || o._id || '',
      o.customer_id?.username || 'Customer',
      o.product_id?.name || 'Product',
      o.quantity || 0,
      getOrderTotalAmount(o),
      normalizeOrderStatus(o.order_status),
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'farmer-order-history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Order history exported to CSV.');
  };

  const handleReviewReply = async (reviewId) => {
    const response = (replyText[reviewId] || '').trim();

    if (!response) {
      toast.error('Please write a reply before posting.');
      return;
    }

    try {
      await respondToReviewService(reviewId, response);
      toast.success('Review reply posted successfully.');
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
      loadReviews();
    } catch (err) {
      console.error('Failed to reply to review', err);
      toast.error(err?.response?.data?.message || 'Failed to post review reply');
    }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await importProductsService(formData);
      toast.success('Products imported successfully!');
      loadProducts();
    } catch (err) {
      toast.error('Failed to import products');
    }
  };

  const handleImportProducts = async () => {
    if (!importFile) {
      toast.error('Please choose a CSV or Excel file first.');
      return;
    }

    try {
      setImportingProducts(true);
      const res = await importProductsService(importFile);
      toast.success(res?.data?.message || 'Products imported successfully.');
      setImportFile(null);
      loadProducts();
    } catch (err) {
      const message = err?.response?.data?.message || 'Product import failed.';
      toast.error(message);
    } finally {
      setImportingProducts(false);
    }
  };

  const downloadImportTemplate = () => {
    const header = ['name', 'category', 'price', 'unit', 'stock_quantity', 'description', 'image_url'];
    const sampleRow = ['Organic Tomatoes', 'Vegetables', '120', 'kg', '75', 'Fresh local tomatoes harvested this morning', 'https://example.com/tomatoes.jpg'];
    const csv = [header, sampleRow]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'marketlink-product-import-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample import template downloaded.');
  };

  const getOrderTotalAmount = (order) => {
    const productPrice = Number(order?.product_id?.price ?? 0);
    const quantity = Number(order?.quantity ?? 0);
    const stored = Number(order?.total_amount ?? 0);

    if (productPrice > 0 && quantity > 0) {
      return productPrice * quantity;
    }

    return stored || 0;
  };

  if (loading) {
    return (
      <div className="fd-loading-screen">
        <div className="fd-spinner"></div>
        <p>Loading Farmer Dashboard...</p>
      </div>
    );
  }

  // ONBOARDING SETUP WIZARD FOR NEW FARMERS
  if (isNewFarmer) {
    return (
      <div className="fd-setup-overlay">
        <div className="fd-setup-card">
          <div className="fd-setup-header">
            <span className="fd-badge-neon">NEW FARMER ONBOARDING</span>
            <h2>Welcome! Let's Set Up Your Stall 🌾</h2>
            <p>Complete these basic details so customers can find your produce and place pre-orders.</p>
          </div>

          <div className="fd-stepper">
            <div className={`fd-step ${setupStep >= 1 ? 'active' : ''}`}>1. Business Info</div>
            <div className={`fd-step ${setupStep >= 2 ? 'active' : ''}`}>2. Location & Days</div>
            <div className={`fd-step ${setupStep >= 3 ? 'active' : ''}`}>3. Schedule & Finish</div>
          </div>

          <form onSubmit={handleCompleteSetup} className="fd-setup-form">
            {setupStep === 1 && (
              <div className="fd-step-content">
                <h3>Step 1: Stall & Contact Info</h3>
                <div className="fd-form-group">
                  <label>Stall / Farm Business Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahim Organic Farm"
                    value={setupData.business_name}
                    onChange={(e) => setSetupData({ ...setupData, business_name: e.target.value })}
                    required
                  />
                </div>
                <div className="fd-form-row">
                  <div className="fd-form-group">
                    <label>Contact Person Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahim Ahmed"
                      value={setupData.contact_person}
                      onChange={(e) => setSetupData({ ...setupData, contact_person: e.target.value })}
                      required
                    />
                  </div>
                  <div className="fd-form-group">
                    <label>Contact Phone Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. +92 300 1234567"
                      value={setupData.contact_number}
                      onChange={(e) => setSetupData({ ...setupData, contact_number: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="button" className="fd-btn-primary" onClick={() => setSetupStep(2)}>
                  Next Step: Location & Days →
                </button>
              </div>
            )}

            {setupStep === 2 && (
              <div className="fd-step-content">
                <h3>Step 2: Select Markets & Operating Days</h3>
                <div className="fd-form-group">
                  <label>Farm / Stall Address *</label>
                  <input
                    type="text"
                    placeholder="e.g. Stall #04, Karachi Central Market"
                    value={setupData.address}
                    onChange={(e) => setSetupData({ ...setupData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="fd-form-group">
                  <label>Select your active markets *</label>
                  <div className="fd-market-grid">
                    {availableMarkets.length ? (
                      availableMarkets.map((market) => (
                        <button
                          key={market.value}
                          type="button"
                          className={`fd-market-chip ${setupData.markets.includes(market.value) ? 'selected' : ''}`}
                          onClick={() => toggleMarketSelection(market.value)}
                        >
                          {market.label}
                        </button>
                      ))
                    ) : (
                      <p className="fd-empty-text">Loading markets...</p>
                    )}
                  </div>
                </div>

                <div className="fd-form-row">
                  <div className="fd-form-group">
                    <label>Latitude Coordinates</label>
                    <input
                      type="number"
                      step="any"
                      value={setupData.latitude}
                      onChange={(e) => setSetupData({ ...setupData, latitude: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="fd-form-group">
                    <label>Longitude Coordinates</label>
                    <input
                      type="number"
                      step="any"
                      value={setupData.longitude}
                      onChange={(e) => setSetupData({ ...setupData, longitude: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="fd-form-group">
                  <label>Select Operating Days *</label>
                  <div className="fd-days-grid">
                    {DAYS_OPTIONS.map((day) => (
                      <button
                        type="button"
                        key={day}
                        className={`fd-day-chip ${setupData.operating_days.includes(day) ? 'selected' : ''}`}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="fd-btn-row">
                  <button type="button" className="fd-btn-secondary" onClick={() => setSetupStep(1)}>
                    ← Back
                  </button>
                  <button type="button" className="fd-btn-primary" onClick={() => setSetupStep(3)}>
                    Next Step: Timings →
                  </button>
                </div>
              </div>
            )}

            {setupStep === 3 && (
              <div className="fd-step-content">
                <h3>Step 3: Pre-Order Timings & Finish</h3>
                <div className="fd-form-group">
                  <label>Daily Pre-Order Cut-off Time</label>
                  <input
                    type="time"
                    value={setupData.cutoff_time}
                    onChange={(e) => setSetupData({ ...setupData, cutoff_time: e.target.value })}
                  />
                  <small className="fd-help-text">Orders for next-day pickup must be placed before this time.</small>
                </div>

                <div className="fd-form-group">
                  <label>Pickup Time Window</label>
                  <input
                    type="text"
                    value={
                      Array.isArray(setupData.pickup_time_windows)
                        ? setupData.pickup_time_windows.join(', ')
                        : setupData.pickup_time_windows
                    }
                    onChange={(e) => setSetupData({ ...setupData, pickup_time_windows: e.target.value.split(',') })}
                    placeholder="e.g. 09:00 AM - 12:00 PM, 04:00 PM - 07:00 PM"
                  />
                </div>

                <div className="fd-btn-row">
                  <button type="button" className="fd-btn-secondary" onClick={() => setSetupStep(2)}>
                    ← Back
                  </button>
                  <button type="submit" className="fd-btn-success">
                    🚀 Launch Dashboard Now
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  const pendingOrderCount = orders.filter((o) => ['placed', 'Pending', 'pending'].includes(String(o.order_status || ''))).length;

  return (
    <div className="fd-dashboard-container">
      {/* Top Header Navigation */}
      <header className="fd-topbar">
        <div className="fd-brand-box">
          <span className="fd-logo-icon">🌾</span>
          <div>
            <h2 className="fd-brand-title">{profile.business_name || 'Farmer Portal'}</h2>
            <p className="fd-brand-sub">📍 {profile.address || 'Karachi Market Hub'}</p>
          </div>
        </div>

        <div className="fd-topbar-right">
          <button
            type="button"
            className="fd-home-btn"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <span>🏠</span>
            <small>Home</small>
          </button>

          <NotificationBell />

          <span className={`fd-status-badge ${profile.approvalStatus}`}>
            ● Status: {profile.approvalStatus?.toUpperCase() || 'APPROVED'}
          </span>

          <div className="fd-user-avatar">
            <img
              src={getProfileImageUrl(profile.profile_picture)}
              alt="Profile"
              onError={(event) => {
                event.target.onerror = null;
                event.target.src = FALLBACK_PROFILE_IMAGE;
              }}
            />
          </div>
        </div>
      </header>

      {/* Tabs Menu */}
      <nav className="fd-nav-tabs">
        <button className={activeTab === 'insights' ? 'active' : ''} onClick={() => setActiveTab('insights')}>
          📊 Overview
        </button>
        <button className={activeTab === 'stock' ? 'active' : ''} onClick={() => setActiveTab('stock')}>
          🥬 Stock & Pricing
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          📦 Pre-Orders ({pendingOrderCount})
        </button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          ⚙️ Stall Profile
        </button>
        <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
          ⭐ Reviews
        </button>
      </nav>

      <main className="fd-content-body">
        {/* OVERVIEW TAB */}
        {activeTab === 'insights' && (
          <div className="fd-tab-pane">
            <div className="fd-section-header">
              <h3>Sales Summary & Metrics</h3>
              <p>Live metrics from your MarketLink stall pre-orders</p>
            </div>

            <div className="fd-hero-strip">
              <div className="fd-hero-copy">
                <span className="fd-eyebrow">MarketLink Producer Suite</span>
                <h3>Grow smarter. Sell faster. Serve better.</h3>
                <p>
                  Track revenue, manage stock, and keep pre-orders flowing from one premium command center.
                </p>
              </div>
              <div className="fd-hero-stats">
                <div>
                  <strong>{products.length || 0}</strong>
                  <span>Live items</span>
                </div>
                <div>
                  <strong>{Math.max(0, orders.filter((o) => ['placed', 'Pending', 'pending'].includes(String(o.order_status || ''))).length)}</strong>
                  <span>Pending</span>
                </div>
                <div>
                  <strong>{reviews.length || 0}</strong>
                  <span>Reviews</span>
                </div>
              </div>
            </div>

            <div className="fd-metrics-grid">
              <div className="fd-metric-card accent-green">
                <span className="fd-card-icon">💵</span>
                <div>
                  <h4>Total Revenue</h4>
                  <p className="fd-metric-val">Rs. {analytics.revenueSummary || 0}</p>
                </div>
              </div>

              <div className="fd-metric-card accent-blue">
                <span className="fd-card-icon">📦</span>
                <div>
                  <h4>Orders</h4>
                  <p className="fd-metric-val">{analytics.totalOrders || 0}</p>
                </div>
              </div>

              <div className="fd-metric-card accent-gold">
                <span className="fd-card-icon">⭐</span>
                <div>
                  <h4>Average Rating</h4>
                  <p className="fd-metric-val">{analytics.averageRating || 0}/5</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STOCK & PRICING TAB */}
        {activeTab === 'stock' && (
          <div className="fd-tab-pane">
            <div className="fd-section-header fd-header-row">
              <div>
                <h3>Weekly Stock & Pricing Management</h3>
                <p>Add fresh produce items or mark items as sold out</p>
              </div>
              <div className="fd-stock-actions">
                <button type="button" className="fd-btn-secondary" onClick={downloadImportTemplate}>
                  Download Template
                </button>
                <label className="fd-btn-secondary fd-import-label">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                  Import Excel
                </label>
                <button type="button" className="fd-btn-success" onClick={() => setIsAddProductModalOpen(true)}>
                  + Add Product
                </button>
              </div>
            </div>

            {importFile && (
              <div className="fd-import-summary">
                <span>Selected file: {importFile.name}</span>
                <button type="button" className="fd-btn-primary" onClick={handleImportProducts} disabled={importingProducts}>
                  {importingProducts ? 'Importing...' : 'Upload Products'}
                </button>
              </div>
            )}

            <div className="fd-stock-summary-row">
              <div className="fd-mini-panel">
                <span>Items Listed</span>
                <strong>{products.length}</strong>
              </div>
              <div className="fd-mini-panel">
                <span>Available</span>
                <strong>{products.filter((item) => item.is_available).length}</strong>
              </div>
              <div className="fd-mini-panel">
                <span>Low Stock</span>
                <strong>{products.filter((item) => Number(item.stock_quantity) <= 10).length}</strong>
              </div>
            </div>

            <div className="fd-table-wrapper">
              <table className="fd-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Weekly Template</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div className="fd-table-item">
                            <img
                              src={p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                              alt={p.name}
                            />
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>Rs. {p.price} / {p.unit}</td>
                        <td>{p.stock_quantity} {p.unit}</td>
                        <td>{formatWeeklyTemplate(p.weekly_stock_template || p.weeklyStockTemplate || '') || 'Not set'}</td>
                        <td>
                          <span className={`fd-chip ${p.is_available ? 'available' : 'soldout'}`}>
                            {p.is_available ? 'Available' : 'Sold Out'}
                          </span>
                        </td>
                        <td>
                          <div className="fd-row-actions">
                            <button className="fd-btn-sm" onClick={() => toggleAvailability(p)}>
                              {p.is_available ? 'Mark Sold Out' : 'Mark Available'}
                            </button>
                            <button className="fd-btn-edit-sm" onClick={() => openEditProductModal(p)}>Edit</button>
                            <button className="fd-btn-danger-sm" onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="fd-empty-text">No produce added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRE-ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="fd-tab-pane">
            <div className="fd-section-header fd-header-row">
              <div>
                <h3>Incoming Customer Pre-Orders</h3>
                <p>Accept pre-orders or send "Ready for Pickup" notifications</p>
              </div>
              <button type="button" className="fd-btn-secondary" onClick={exportOrderHistoryCsv}>
                Export CSV
              </button>
            </div>

            <div className="fd-orders-list">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <div key={o._id} className="fd-order-card">
                    <div className="fd-order-header">
                      <div>
                        <strong>Order #{o.order_id || o._id.slice(-6)}</strong>
                        <span className={`fd-chip ${getOrderStatusClassName(o.order_status)}`}>
                          {normalizeOrderStatus(o.order_status)}
                        </span>
                      </div>
                      <span className="fd-order-price">Rs. {getOrderTotalAmount(o)}</span>
                    </div>

                    <div className="fd-order-body">
                      <p>👤 <strong>Customer:</strong> {o.customer_id?.username} ({o.customer_id?.contact_number || 'N/A'})</p>
                      <p>🥬 <strong>Product:</strong> {o.product_id?.name} x {o.quantity}</p>
                    </div>

                    <div className="fd-order-actions">
                      <button className="fd-btn-sm" onClick={() => handleStatusChange(o, 'accepted')}>
                        Accept & Notify
                      </button>
                      <button className="fd-btn-sm warning" onClick={() => handleStatusChange(o, 'ready_for_pickup')}>
                        ⏰ Ready for Pickup
                      </button>
                      <button className="fd-btn-sm success" onClick={() => handleStatusChange(o, 'completed')}>
                        Completed
                      </button>
                      <button className="fd-btn-danger-sm" onClick={() => handleStatusChange(o, 'declined')}>
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="fd-empty-text">No customer orders received yet.</p>
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="fd-tab-pane">
            <div className="fd-section-header">
              <h3>Edit Stall Profile & Pickup Windows</h3>
              <p>Keep stall address, market selection, phone, and cutoff timings updated</p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = {
                    ...profile,
                    markets: Array.isArray(profile.markets) ? profile.markets : [],
                    pickup_time_windows: parsePickupSlots(profile.pickup_time_windows?.join(', ') || ''),
                  };
                  const res = await updateFarmerProfileService(payload);
                  if (res.data?.success) {
                    setProfile(res.data.farmer || profile);
                    toast.success('Profile updated successfully!');
                  }
                } catch (err) {
                  toast.error(err?.response?.data?.message || 'Profile update failed');
                }
              }}
              className="fd-profile-form"
            >
              <div className="fd-form-grid">
                <div className="fd-form-group">
                  <label>Business / Stall Name</label>
                  <input
                    type="text"
                    value={profile.business_name || ''}
                    onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                  />
                </div>
                <div className="fd-form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    value={profile.contact_person || ''}
                    onChange={(e) => setProfile({ ...profile, contact_person: e.target.value })}
                  />
                </div>
                <div className="fd-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={profile.contact_number || ''}
                    onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })}
                  />
                </div>
                <div className="fd-form-group">
                  <label>Full Address</label>
                  <input
                    type="text"
                    value={profile.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>
                <div className="fd-form-group">
                  <label>Pre-Order Cut-Off Time</label>
                  <input
                    type="time"
                    value={profile.cutoff_time || '18:00'}
                    onChange={(e) => setProfile({ ...profile, cutoff_time: e.target.value })}
                  />
                </div>
                <div className="fd-form-group">
                  <label>Pickup Slots</label>
                  <input
                    type="text"
                    value={Array.isArray(profile.pickup_time_windows) ? profile.pickup_time_windows.join(', ') : (profile.pickup_time_windows || '')}
                    onChange={(e) => setProfile({ ...profile, pickup_time_windows: parsePickupSlots(e.target.value) })}
                    placeholder="09:00 AM - 12:00 PM, 04:00 PM - 07:00 PM"
                  />
                </div>
              </div>

              <div className="fd-form-group" style={{ marginTop: '20px' }}>
                <label>Active Markets</label>
                <div className="fd-market-grid">
                  {availableMarkets.length ? (
                    availableMarkets.map((market) => (
                      <button
                        key={market.value}
                        type="button"
                        className={`fd-market-chip ${((profile.markets || []).includes(market.value) || (profile.markets || []).includes(market.label)) ? 'selected' : ''}`}
                        onClick={() => {
                          const selected = Array.isArray(profile.markets) ? profile.markets : [];
                          const updated = selected.includes(market.value)
                            ? selected.filter((item) => item !== market.value)
                            : [...selected, market.value];
                          setProfile({ ...profile, markets: updated });
                        }}
                      >
                        {market.label}
                      </button>
                    ))
                  ) : (
                    <p className="fd-empty-text">No markets available right now.</p>
                  )}
                </div>
              </div>

              <button type="submit" className="fd-btn-success" style={{ marginTop: '20px' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="fd-tab-pane">
            <div className="fd-section-header">
              <h3>Customer Feedback & Ratings</h3>
              <p>Respond to customer reviews</p>
            </div>

            <div className="fd-reviews-list">
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <div key={r._id} className="fd-review-card">
                    <div className="fd-review-top">
                      <div>
                        <strong>{r.customer_id?.username || 'Customer'}</strong>
                        <p className="fd-review-product">Product: {r.product_id?.name}</p>
                      </div>
                      <div className="fd-stars">{'⭐'.repeat(r.rating || 0)}</div>
                    </div>

                    <p className="fd-comment">"{r.comment}"</p>

                    {r.farmer_response ? (
                      <div className="fd-farmer-reply">
                        <strong>Your Response:</strong> {r.farmer_response}
                      </div>
                    ) : (
                      <div className="fd-reply-box">
                        <input
                          type="text"
                          value={replyText[r._id] || ''}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [r._id]: e.target.value }))}
                          placeholder="Write a response to this review..."
                        />
                        <button type="button" className="fd-btn-primary" onClick={() => handleReviewReply(r._id)}>
                          Post Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="fd-empty-text">No customer reviews yet.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fd-modal-overlay" onClick={() => setIsAddProductModalOpen(false)}>
          <div className="fd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3>Add New Produce Item</h3>
              <button className="fd-modal-close" onClick={() => setIsAddProductModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="fd-modal-form">
              <div className="fd-form-grid">
                <div className="fd-form-group">
                  <label>Produce Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Tomatoes"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    required
                  />
                </div>
                <div className="fd-form-group">
                  <label>Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Herbs">Herbs</option>
                  </select>
                </div>
                <div className="fd-form-group">
                  <label>Price (Rs) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    required
                  />
                </div>
                <div className="fd-form-group">
                  <label>Unit (e.g. kg, dozen) *</label>
                  <input
                    type="text"
                    placeholder="e.g. kg"
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    required
                  />
                </div>
                <div className="fd-form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    placeholder="e.g. 100"
                    value={newProd.stock_quantity}
                    onChange={(e) => setNewProd({ ...newProd, stock_quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="fd-form-group">
                  <label>Image URL (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://example.com/image.jpg"
                    value={newProd.image_url}
                    onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
                  />
                </div>
                <div className="fd-form-group fd-full-span">
                  <label>Description</label>
                  <textarea
                    placeholder="Brief description of the produce"
                    value={newProd.description}
                    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="fd-form-group fd-full-span">
                  <label>Weekly Stock Template</label>
                  <input
                    type="text"
                    placeholder="e.g. Monday, Wednesday, Friday"
                    value={newProd.weekly_stock_template}
                    onChange={(e) => setNewProd({ ...newProd, weekly_stock_template: e.target.value })}
                  />
                </div>
              </div>

              <div className="fd-inline-toggle-row">
                <label>
                  <input
                    type="checkbox"
                    checked={newProd.is_recurring_template}
                    onChange={(e) => setNewProd({ ...newProd, is_recurring_template: e.target.checked })}
                  />
                  Use recurring weekly template
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={newProd.is_available}
                    onChange={(e) => setNewProd({ ...newProd, is_available: e.target.checked })}
                  />
                  Available for pre-orders
                </label>
              </div>

              <div className="fd-modal-actions">
                <button type="button" className="fd-btn-secondary" onClick={() => setIsAddProductModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="fd-btn-success">
                  Save Produce Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isProductEditorOpen && editingProduct && (
        <div className="fd-modal-overlay" onClick={closeEditProductModal}>
          <div className="fd-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="fd-modal-header">
              <h3>Edit Produce Item</h3>
              <button type="button" className="fd-modal-close" onClick={closeEditProductModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="fd-modal-form">
              <div className="fd-form-grid">
                <div className="fd-form-group">
                  <label>Produce Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => handleProductEditFieldChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="fd-form-group">
                  <label>Category</label>
                  <select
                    value={editingProduct.category || 'Vegetables'}
                    onChange={(e) => handleProductEditFieldChange('category', e.target.value)}
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Grains">Grains</option>
                    <option value="Herbs">Herbs</option>
                  </select>
                </div>
                <div className="fd-form-group">
                  <label>Price (Rs) *</label>
                  <input
                    type="number"
                    value={editingProduct.price || ''}
                    onChange={(e) => handleProductEditFieldChange('price', e.target.value)}
                    required
                  />
                </div>
                <div className="fd-form-group">
                  <label>Unit *</label>
                  <input
                    type="text"
                    value={editingProduct.unit || 'kg'}
                    onChange={(e) => handleProductEditFieldChange('unit', e.target.value)}
                    required
                  />
                </div>
                <div className="fd-form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    value={editingProduct.stock_quantity || ''}
                    onChange={(e) => handleProductEditFieldChange('stock_quantity', e.target.value)}
                    required
                  />
                </div>
                <div className="fd-form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    value={editingProduct.image_url || ''}
                    onChange={(e) => handleProductEditFieldChange('image_url', e.target.value)}
                  />
                </div>
                <div className="fd-form-group fd-full-span">
                  <label>Description</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => handleProductEditFieldChange('description', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="fd-form-group fd-full-span">
                  <label>Weekly Stock Template</label>
                  <input
                    type="text"
                    placeholder="e.g. Monday, Wednesday, Friday"
                    value={editingProduct.weekly_stock_template || ''}
                    onChange={(e) => handleProductEditFieldChange('weekly_stock_template', e.target.value)}
                  />
                </div>
              </div>

              <div className="fd-inline-toggle-row">
                <label>
                  <input
                    type="checkbox"
                    checked={editingProduct.is_recurring_template || false}
                    onChange={(e) => handleProductEditFieldChange('is_recurring_template', e.target.checked)}
                  />
                  Use recurring weekly template
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={editingProduct.is_available ?? true}
                    onChange={(e) => handleProductEditFieldChange('is_available', e.target.checked)}
                  />
                  Available for pre-orders
                </label>
              </div>

              <div className="fd-modal-actions">
                <button type="button" className="fd-btn-secondary" onClick={closeEditProductModal}>
                  Cancel
                </button>
                <button type="submit" className="fd-btn-success">
                  Update Produce Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;