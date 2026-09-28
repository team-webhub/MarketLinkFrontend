import React, { useEffect, useRef, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import '../Styles/OurServices.css';
import API from '../../../Core/api';

gsap.registerPlugin(ScrollTrigger);

const normalizeProduct = (item) => ({
  _id: item?._id || item?.id,
  farmer_id: item?.Farmer_id?._id || item?.Farmer_id?.id || item?.farmer_id || null,
  name: item?.name || 'Fresh Produce',
  category: item?.category || 'General',
  price: Number(item?.price || 0),
  unit: item?.unit || 'unit',
  image_url: item?.image_url || item?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
  market: item?.market || item?.Farmer_id?.markets?.[0] || 'Local Market',
  operating_days: Array.isArray(item?.operating_days)
    ? item.operating_days
    : (Array.isArray(item?.Farmer_id?.operating_days) ? item.Farmer_id.operating_days : []),
  description: item?.description || 'Freshly sourced from local farms.',
  stock_quantity: Number(item?.stock_quantity || 0),
  farmer_name: item?.Farmer_id?.business_name || item?.Farmer_id?.username || 'Local Farmer',
  farmer_address: item?.Farmer_id?.address || 'Near local market',
  farmer_phone: item?.Farmer_id?.contact_number || '+92 300 0000000',
  farmer_image: item?.Farmer_id?.profile_picture || 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=600&auto=format&fit=crop',
  pickup_time_windows: Array.isArray(item?.Farmer_id?.pickup_time_windows) ? item.Farmer_id.pickup_time_windows : [],
  reviews: Array.isArray(item?.reviews) ? item.reviews : [],
  images: Array.isArray(item?.images) && item.images.length > 0 ? item.images : [item?.image_url || item?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop'],
});

function OurServices() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const btnRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('all');
  const [marketFilter, setMarketFilter] = useState('All');
  const [dayFilter, setDayFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [pickupDate, setPickupDate] = useState(() => {
    const next = new Date();
    next.setDate(next.getDate() + 2);
    return next.toISOString().split('T')[0];
  });
  const [pickupSlot, setPickupSlot] = useState('9:00 AM - 11:00 AM');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const defaultSlots = [
    '9:00 AM - 11:00 AM',
    '11:30 AM - 1:30 PM',
    '2:00 PM - 4:00 PM',
    '5:00 PM - 7:00 PM',
  ];

  const nextPickupOptions = cartItems[0]?.pickup_time_windows?.length
    ? cartItems[0].pickup_time_windows
    : defaultSlots;

  useEffect(() => {
    const farmerSlots = cartItems[0]?.pickup_time_windows || [];
    const availableSlots = farmerSlots.length ? farmerSlots : defaultSlots;
    setPickupSlot((currentSlot) => availableSlots.includes(currentSlot) ? currentSlot : availableSlots[0]);
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const invalidItems = cartItems.filter((item) => Number(item.quantity) > Number(item.stock_quantity));
  const canCheckout = cartItems.length > 0 && invalidItems.length === 0 && pickupDate && pickupSlot;

  const updateCartQuantity = (productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item._id !== productId) return item;
          const nextQuantity = Math.max(1, Number(item.quantity) + delta);
          return { ...item, quantity: Math.min(nextQuantity, Number(item.stock_quantity || nextQuantity)) };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item._id !== productId));
    setOrderConfirmed(false);
  };

  const handleAddToCart = (product) => {
    setOrderConfirmed(false);
    setCartItems((prev) => {
      const currentFarmerId = prev[0]?.farmer_id;
      if (currentFarmerId && product.farmer_id && currentFarmerId !== product.farmer_id) {
        alert('Please place the current farmer order before adding products from another farmer.');
        return prev;
      }

      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        const nextQuantity = Number(existing.quantity) + 1;
        if (nextQuantity > Number(product.stock_quantity || nextQuantity)) {
          return prev;
        }

        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: nextQuantity } : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handlePreOrderSubmit = async () => {
    if (!canCheckout) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!localStorage.getItem('token') || !user?.email) {
      alert('Please log in to place a pre-order.');
      return;
    }

    try {
      const checkoutPayload = cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        pickupDate,
        pickupSlot,
        farmerId: item?.farmer_id || item?.Farmer_id?._id || item?.farmerId,
        totalAmount: Number(item.price) * Number(item.quantity),
      }));
      await Promise.all(checkoutPayload.map((payload) => API.post('/customerOrder/create', payload)));
      setCartItems([]);
      setOrderConfirmed(true);
      setPickupDate(() => {
        const next = new Date();
        next.setDate(next.getDate() + 2);
        return next.toISOString().split('T')[0];
      });
      setPickupSlot(defaultSlots[0]);
      setSelectedProduct(null);
      navigate('/pre-orders');
    } catch (error) {
      console.error('Pre-order submission failed:', error);
      alert(error?.response?.data?.message || 'Unable to place your pre-order right now.');
    }
  };

  useEffect(() => {
    if (orderConfirmed) {
      const timer = setTimeout(() => setOrderConfirmed(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [orderConfirmed]);

  useEffect(() => {
    setCartItems((prev) =>
      prev.map((item) => ({
        ...item,
        quantity: Math.min(Number(item.quantity || 1), Number(item.stock_quantity || 1)),
      }))
    );
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError('');
      try {
        const response = await API.get('/product/Product');
        const productList = response?.data?.products || [];
        setProducts(Array.isArray(productList) ? productList.map(normalizeProduct) : []);
      } catch (error) {
        console.error('Product catalog fetch failed:', error);
        setProducts([]);
        setProductsError('Products could not be loaded from the server. Please try again.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          },
        }
      );

      if (btnRef.current) {
        gsap.fromTo(
          btnRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.4,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 70%',
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [products.length]);

  const categories = useMemo(() => ['All', ...new Set(products.map((item) => item.category || 'General'))], [products]);
  const marketOptions = useMemo(() => ['All', ...new Set(products.map((item) => item.market || 'Local Market'))], [products]);
  const dayOptions = useMemo(() => ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], []);

  const suggestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    const source = [...new Set(products.flatMap((product) => [product.name, product.category, product.market]))];
    return source.filter((item) => item.toLowerCase().includes(query)).slice(0, 6);
  }, [products, searchTerm]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.market.toLowerCase().includes(query);

      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesMarket = marketFilter === 'All' || product.market === marketFilter;
      const matchesDay = dayFilter === 'All' || (product.operating_days || []).includes(dayFilter);

      let matchesPrice = true;
      if (priceFilter === 'under-500') matchesPrice = product.price <= 500;
      if (priceFilter === '500-1000') matchesPrice = product.price > 500 && product.price <= 1000;
      if (priceFilter === '1000-plus') matchesPrice = product.price > 1000;

      return matchesSearch && matchesCategory && matchesMarket && matchesDay && matchesPrice;
    });
  }, [products, searchTerm, categoryFilter, priceFilter, marketFilter, dayFilter]);

  return (
    <section id='ourservices' ref={containerRef} className="os-section">
      <div className="os-container">
        <div className="os-header-grid">
          <div ref={titleRef} className="os-title-col">
            <span className="os-badge">— MARKET CATALOG</span>
            <h2 className="os-main-heading">
              PRODUCT <br />
              SEARCH
            </h2>
          </div>
          <div className="os-desc-col">
            <p className="os-desc-text">
              Browse fresh products by category, price, market, and operating day. Search local produce instantly and pre-order directly from nearby farms.
            </p>
          </div>
        </div>

        <div className="os-search-panel">
          <div className="os-search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search fruits, vegetables, dairy, herbs..."
              className="os-search-input"
            />

            {suggestions.length > 0 && (
              <div className="os-suggestion-list">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="os-suggestion-item"
                    onClick={() => setSearchTerm(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="os-filter-bar">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="os-filter-select">
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="os-filter-select">
              <option value="all">All Prices</option>
              <option value="under-500">Under Rs. 500</option>
              <option value="500-1000">Rs. 500 - Rs. 1000</option>
              <option value="1000-plus">Rs. 1000+</option>
            </select>

            <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className="os-filter-select">
              {marketOptions.map((market) => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>

            <select value={dayFilter} onChange={(e) => setDayFilter(e.target.value)} className="os-filter-select">
              {dayOptions.map((day) => (
                <option key={day} value={day}>{day === 'All' ? 'All Days' : day}</option>
              ))}
            </select>
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="os-cart-pill">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)} item(s) in cart
          </div>
        )}

        {isLoadingProducts && <div className="os-empty-state">Loading products from the market database...</div>}

        {!isLoadingProducts && productsError && (
          <div className="os-empty-state">
            <p>{productsError}</p>
            <button type="button" className="os-view-all-btn" onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}

        {!isLoadingProducts && !productsError && <div className="os-grid os-product-grid">
          {filteredProducts.map((product, index) => (
            <article
              key={product._id}
              ref={(el) => (cardsRef.current[index] = el)}
              className="os-card os-product-card"
            >
              <div className="os-card-image-wrapper">
                <img src={product.image_url} alt={product.name} className="os-card-img" />
                <div className="os-card-overlay" />

                <div className="os-card-content">
                  <div className="os-card-info">
                    <p className="os-card-count">{product.category}</p>
                    <h3 className="os-card-title">{product.name}</h3>
                  </div>
                  <span className="os-card-icon">✦</span>
                </div>
              </div>

              <div className="os-product-meta">
                <div className="os-price-row">
                  <span className="os-price">Rs. {product.price}</span>
                  <span className="os-unit">/{product.unit}</span>
                </div>
                <p className="os-product-market">📍 {product.market}</p>
                <p className="os-product-days">🗓 {product.operating_days.length ? product.operating_days.join(', ') : 'Schedule not provided'}</p>
                <p className="os-product-stock">{product.stock_quantity} available</p>
                <button type="button" className="os-product-btn" onClick={() => setSelectedProduct(product)}>
                  View Details
                </button>
              </div>
            </article>
          ))}
        </div>}

        {!isLoadingProducts && !productsError && filteredProducts.length === 0 && (
          <div className="os-empty-state">No products match your current filters.</div>
        )}

        <div ref={btnRef} className="os-btn-wrapper">
          <button type="button" className="os-view-all-btn" onClick={() => {
            setSearchTerm('');
            setCategoryFilter('All');
            setPriceFilter('all');
            setMarketFilter('All');
            setDayFilter('All');
          }}>Clear Filters</button>
        </div>
      </div>

      {cartItems.length > 0 && (
        <aside className="os-cart-widget">
          <div className="os-cart-header">
            <div>
              <span className="os-cart-label">Pre-Order</span>
              <h4>{totalItems} item(s)</h4>
            </div>
            <button type="button" className="os-cart-clear" onClick={() => setCartItems([])}>
              Clear
            </button>
          </div>

          <div className="os-cart-body">
            {cartItems.map((item) => (
              <div key={item._id} className="os-cart-item">
                <div className="os-cart-item-info">
                  <strong>{item.name}</strong>
                  <span>Rs. {item.price} / {item.unit}</span>
                </div>

                <div className="os-cart-controls">
                  <button type="button" onClick={() => updateCartQuantity(item._id, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateCartQuantity(item._id, 1)}>+</button>
                </div>
              </div>
            ))}

            <div className="os-cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>Rs. {subtotal}</strong>
              </div>
              <div>
                <span>Stock</span>
                <strong>{invalidItems.length > 0 ? 'Check quantity' : 'Valid'}</strong>
              </div>
            </div>

            <label className="os-cart-field">
              <span>Pickup Date</span>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </label>

            <label className="os-cart-field">
              <span>Pickup Time</span>
              <select value={pickupSlot} onChange={(e) => setPickupSlot(e.target.value)}>
                {nextPickupOptions.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </label>

            <div className="os-payment-note">Payment at Pickup — Online payments are temporarily disabled</div>

            <button
              type="button"
              className="os-cart-submit"
              disabled={!canCheckout}
              onClick={handlePreOrderSubmit}
            >
              Confirm Pre-Order
            </button>

            {orderConfirmed && (
              <div className="os-order-confirmed">
                Order confirmed for {pickupDate} • {pickupSlot}
              </div>
            )}
          </div>
        </aside>
      )}

      {selectedProduct && (
        <div className="os-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="os-modal-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="os-modal-close" onClick={() => setSelectedProduct(null)}>✕</button>

            <div className="os-modal-media">
              <img src={selectedProduct.image_url} alt={selectedProduct.name} className="os-modal-main-image" />
              <div className="os-modal-thumbs">
                {(selectedProduct.images || [selectedProduct.image_url]).slice(0, 3).map((image, index) => (
                  <img key={`${selectedProduct._id}-${index}`} src={image} alt={`${selectedProduct.name}-${index}`} className="os-modal-thumb" />
                ))}
              </div>
            </div>

            <div className="os-modal-content">
              <div className="os-modal-topline">
                <span className="os-modal-category">{selectedProduct.category}</span>
                <span className="os-modal-stock">{selectedProduct.stock_quantity} in stock</span>
              </div>

              <h3 className="os-modal-title">{selectedProduct.name}</h3>

              <div className="os-price-row os-price-row-modal">
                <span className="os-price">Rs. {selectedProduct.price}</span>
                <span className="os-unit">per {selectedProduct.unit}</span>
              </div>

              <p className="os-modal-description">{selectedProduct.description}</p>

              <div className="os-modal-meta-grid">
                <div>
                  <span className="os-meta-label">Market</span>
                  <p>{selectedProduct.market}</p>
                </div>
                <div>
                  <span className="os-meta-label">Operating Days</span>
                  <p>{(selectedProduct.operating_days || []).join(', ')}</p>
                </div>
              </div>

              <div className="os-farmer-box">
                <img src={selectedProduct.farmer_image} alt={selectedProduct.farmer_name} className="os-farmer-image" />
                <div>
                  <button
                    type="button"
                    className="os-farmer-name-btn"
                    onClick={() => {
                      const farmerId = selectedProduct.farmer_id || selectedProduct.Farmer_id?._id || selectedProduct._id;
                      navigate(`/farmer/${farmerId}`);
                      setSelectedProduct(null);
                    }}
                  >
                    {selectedProduct.farmer_name}
                  </button>
                  <p className="os-farmer-detail">📍 {selectedProduct.farmer_address}</p>
                  <p className="os-farmer-detail">📞 {selectedProduct.farmer_phone}</p>
                </div>
              </div>

              <div className="os-modal-actions">
                <button type="button" className="os-modal-cart-btn" onClick={() => {
                  handleAddToCart(selectedProduct);
                  setSelectedProduct(null);
                }}>
                  Add to Cart
                </button>
                <button type="button" className="os-modal-secondary-btn" onClick={() => setSelectedProduct(null)}>
                  Continue Shopping
                </button>
              </div>

              <div className="os-review-section">
                <h4>Customer Reviews</h4>
                <div className="os-review-list">
                  {(selectedProduct.reviews || []).map((review) => (
                    <div key={review.id || review.customer} className="os-review-item">
                      <div className="os-review-header">
                        <strong>{review.customer}</strong>
                        <span>{'★'.repeat(review.rating || 5)}{review.rating < 5 ? '☆'.repeat(5 - review.rating) : ''}</span>
                      </div>
                      <p>{review.comment}</p>
                      <small>{review.date}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OurServices;