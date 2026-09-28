import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/InspectServices.css';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../../Core/api';

gsap.registerPlugin(ScrollTrigger);

const normalizeProduct = (item) => ({
        id: item?._id,
        farmerId: item?.Farmer_id?._id,
        name: item?.name || 'Fresh Produce',
        category: String(item?.category || 'general').toLowerCase(),
        categoryName: item?.category || 'General',
        price: Number(item?.price || 0),
        unit: item?.unit || 'unit',
        stock_quantity: Number(item?.stock_quantity || 0),
        description: item?.description || 'Fresh produce from a local farmer.',
        market: item?.Farmer_id?.markets?.[0] || 'Local Market',
        operating_days: item?.Farmer_id?.operating_days || [],
        farmer: item?.Farmer_id?.business_name || item?.Farmer_id?.username || 'Local Farmer',
        farmerAddress: item?.Farmer_id?.address || 'Address not provided',
        farmerPhone: item?.Farmer_id?.contact_number || 'Contact not provided',
        profileImage: item?.Farmer_id?.profile_picture || '',
        pickup_time_windows: item?.Farmer_id?.pickup_time_windows || [],
        image: item?.image_url || '',
        images: [item?.image_url].filter(Boolean),
        reviews: [],
    });

/* Product records are loaded from the database. */
const productItems = [];

/*
    {
        id: 1,
        name: 'Organic Strawberries',
        category: 'fruits',
        categoryName: 'Fruits',
        price: 420,
        unit: 'kg',
        stock_quantity: 24,
        description: 'Freshly picked strawberries cultivated with natural soil care and harvested early in the morning for peak taste and nutrition.',
        market: 'Lahore Central Market',
        operating_days: ['Friday', 'Saturday', 'Sunday'],
        farmer: 'Green Valley Farms',
        farmerAddress: 'Mughalpura, Lahore',
        farmerPhone: '+92 300 1234567',
        profileImage: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=600&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=800&auto=format&fit=crop',
        ],
        reviews: demoReviews,
    },
    {
        id: 2,
        name: 'Leafy Greens Mix',
        category: 'vegetables',
        categoryName: 'Vegetables',
        price: 260,
        unit: 'bundle',
        stock_quantity: 18,
        description: 'A crunchy mix of spinach, lettuce, and mustard greens handpicked to keep flavor and freshness intact for your daily meals.',
        market: 'Green Valley Market',
        operating_days: ['Monday', 'Thursday', 'Saturday'],
        farmer: 'Sunrise Harvest',
        farmerAddress: 'Johar Town, Lahore',
        farmerPhone: '+92 321 7654321',
        profileImage: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=600&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1466637574441-2a3c4efb8a76?q=80&w=800&auto=format&fit=crop',
        ],
        reviews: demoReviews,
    },
    {
        id: 3,
        name: 'Farm Eggs',
        category: 'dairy',
        categoryName: 'Dairy',
        price: 310,
        unit: 'dozen',
        stock_quantity: 30,
        description: 'Free-range eggs collected daily from healthy birds, sized for breakfast, baking, and daily nutrition needs.',
        market: 'City Harvest Hub',
        operating_days: ['Tuesday', 'Wednesday', 'Saturday'],
        farmer: 'Happy Hen Farm',
        farmerAddress: 'Bahria Town, Lahore',
        farmerPhone: '+92 333 9876543',
        profileImage: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=800&auto=format&fit=crop',
        ],
        reviews: demoReviews,
    },
    {
        id: 4,
        name: 'Sweet Mangoes',
        category: 'fruits',
        categoryName: 'Fruits',
        price: 680,
        unit: 'kg',
        stock_quantity: 12,
        description: 'Premium seasonal mangoes with high sweetness and natural aroma for families, gifting, and dessert recipes.',
        market: 'Sunrise Market',
        operating_days: ['Thursday', 'Friday', 'Saturday'],
        farmer: 'Mango Valley',
        farmerAddress: 'Multan Road, Lahore',
        farmerPhone: '+92 334 2345678',
        profileImage: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=600&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?q=80&w=800&auto=format&fit=crop',
        ],
        reviews: demoReviews,
    },
    {
        id: 5,
        name: 'Root Veg Basket',
        category: 'vegetables',
        categoryName: 'Vegetables',
        price: 540,
        unit: 'basket',
        stock_quantity: 15,
        description: 'A daily essentials basket packed with carrots, beets, radishes, and local root vegetables for healthy family meals.',
        market: 'Lahore Central Market',
        operating_days: ['Tuesday', 'Thursday', 'Sunday'],
        farmer: 'Rootline Organics',
        farmerAddress: 'Model Town, Lahore',
        farmerPhone: '+92 312 4567890',
        profileImage: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=600&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1518843875459-f738682238a6?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=800&auto=format&fit=crop',
        ],
        reviews: demoReviews,
    },
    {
        id: 6,
        name: 'Herbal Honey',
        category: 'natural',
        categoryName: 'Natural',
        price: 870,
        unit: 'jar',
        stock_quantity: 9,
        description: 'Pure floral honey sourced from healthy nearby hives with a rich taste and traditional natural fermentation quality.',
        market: 'Green Valley Market',
        operating_days: ['Friday', 'Saturday', 'Sunday'],
        farmer: 'Bee Bloom Farms',
        farmerAddress: 'Ferozepur Road, Lahore',
        farmerPhone: '+92 315 2020202',
        profileImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=800&auto=format&fit=crop',
        ],
        reviews: demoReviews,
    },
]; */

function InspectServices() {
    const [activeTab, setActiveTab] = useState(0);
    const [activeProduct, setActiveProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    const categoryTabs = [
        { id: 'all', title: 'ALL PRODUCTS', count: `${products.length} items` },
        ...Array.from(new Set(products.map((product) => product.category))).map((category) => ({
            id: category,
            title: category.toUpperCase(),
            count: `${products.filter((product) => product.category === category).length} items`,
        })),
    ];

    const containerRef = useRef(null);
    const slotRef = useRef(null);
    const headerBracketsRef = useRef([]);
    const slotTextRef = useRef(null);
    const cardsGridRef = useRef(null);
    const detailRef = useRef(null);
    const matrixRef = useRef(null);
    const centerBoxRef = useRef(null);
    const centerBracketsRef = useRef([]);
    const centerTextRef = useRef(null);
    const modalOverlayRef = useRef(null);
    const modalBoxRef = useRef(null);

    const filteredProducts = activeTab === 0
        ? products
        : products.filter((item) => item.category === categoryTabs[activeTab]?.id);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await API.get('/product/Product');
                const productList = response?.data?.products || [];
                setProducts(Array.isArray(productList) ? productList.map(normalizeProduct) : []);
            } catch (error) {
                console.error('Inspect product catalog fetch failed:', error);
                setLoadError('Products could not be loaded from the database.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (!activeProduct?.id) return;

        API.get(`/reviews/product/${activeProduct.id}`)
            .then((response) => {
                setActiveProduct((product) => ({ ...product, reviews: response.data?.reviews || [] }));
            })
            .catch((error) => console.error('Product reviews fetch failed:', error));
    }, [activeProduct?.id]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (slotRef.current) {
                const fullWidth = slotRef.current.scrollWidth;
                const headerTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 85%',
                        end: 'top 20%',
                        scrub: 1.2,
                    },
                });

                headerTl
                    .fromTo(slotRef.current,
                        { width: 0, marginLeft: 0, marginRight: 0 },
                        { width: fullWidth, marginLeft: '0.35em', marginRight: '0.35em', duration: 1, ease: 'power2.inOut' }
                    )
                    .fromTo(headerBracketsRef.current[0], { x: 30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, 0.2)
                    .fromTo(headerBracketsRef.current[1], { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 }, 0.2)
                    .fromTo(slotTextRef.current, { opacity: 0, scale: 0.6, filter: 'blur(4px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5 }, 0.5);
            }

            if (cardsGridRef.current) {
                gsap.fromTo(
                    cardsGridRef.current.children,
                    { opacity: 0, y: 35 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.12,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: cardsGridRef.current,
                            start: 'top 85%',
                        },
                    }
                );
            }

            if (detailRef.current) {
                gsap.fromTo(
                    detailRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: detailRef.current,
                            start: 'top 85%',
                        },
                    }
                );
            }

            if (matrixRef.current) {
                gsap.fromTo(
                    matrixRef.current.children,
                    { opacity: 0, y: 40, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.7,
                        stagger: 0.1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: matrixRef.current,
                            start: 'top 80%',
                        },
                    }
                );
            }

            if (centerBoxRef.current) {
                const centerTl = gsap.timeline({
                    scrollTrigger: {
                        trigger: centerBoxRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                });

                centerTl
                    .fromTo(centerBoxRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' })
                    .fromTo(centerBracketsRef.current[0], { x: 25, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }, '-=0.2')
                    .fromTo(centerBracketsRef.current[1], { x: -25, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.8)' }, '<')
                    .fromTo(centerTextRef.current, { opacity: 0, scale: 0.5, filter: 'blur(3px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, '-=0.3');
            }
        }, containerRef);

        return () => ctx.revert();
    }, [activeTab]);

    const closeModal = () => {
        if (modalOverlayRef.current && modalBoxRef.current) {
            gsap.to(modalBoxRef.current, {
                opacity: 0,
                scale: 0.9,
                y: 20,
                duration: 0.25,
            });
            gsap.to(modalOverlayRef.current, {
                opacity: 0,
                duration: 0.25,
                onComplete: () => setActiveProduct(null),
            });
        } else {
            setActiveProduct(null);
        }
    };

    useEffect(() => {
        if (activeProduct && modalBoxRef.current) {
            gsap.fromTo(
                modalOverlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(
                modalBoxRef.current,
                { opacity: 0, scale: 0.88, y: 35 },
                { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.3)' }
            );
        }
    }, [activeProduct]);

    return (
        <section ref={containerRef} className="is-section">
            <div className="is-container">
                <div className="hero-top-bar">
                    <a href="/" className="hero-brand-logo" data-cursor-text="HOME">
                        <span>MarketLink</span>
                    </a>

                    <div className="is-cart-badge" data-cursor-text="CART">
                        CART ({cartCount})
                    </div>
                </div>

                <Link to={'/AllServices'} className="as-badge">— Go Back</Link>

                <h1 className="is-header-title">
                    <span ref={slotRef} className="is-expand-slot">
                        <span ref={(el) => (headerBracketsRef.current[0] = el)} className="is-bracket">&#123;</span>
                        <span ref={slotTextRef} className="is-slot-text">PRODUCTS</span>
                        <span ref={(el) => (headerBracketsRef.current[1] = el)} className="is-bracket">&#125;</span>
                    </span>
                </h1>

                <div ref={cardsGridRef} className="is-cards-grid">
                    {categoryTabs.map((tab, idx) => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(idx)}
                            className={`is-card ${activeTab === idx ? 'is-card-active' : ''}`}
                        >
                            <div className="is-card-bg-wrapper">
                                <img src={products.find((product) => idx === 0 || product.category === tab.id)?.images?.[0]} alt={tab.title} className="is-card-bg-img" />
                                <div className="is-card-overlay" />
                            </div>
                            <div className="is-card-content">
                                <div className="is-card-info">
                                    <h3 className="is-card-title">{tab.title}</h3>
                                    <p className="is-card-count">{tab.count}</p>
                                </div>
                                <span className="is-card-icon">✦</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div ref={detailRef} className="is-detail-wrapper">
                    <h2 className="is-detail-title">{categoryTabs[activeTab]?.title || 'ALL PRODUCTS'}</h2>
                    <div className="is-detail-right">
                        <p className="is-detail-p">
                            Discover fresh produce sourced directly from local farmers and available for quick market pickup or direct pre-order.
                        </p>
                        <p className="is-detail-p">
                            Every item includes trusted pricing, real stock availability, farmer details, and community reviews so customers can buy with confidence.
                        </p>
                    </div>
                </div>

                {isLoading && <div className="is-empty-state">Loading products from the database...</div>}
                {!isLoading && loadError && <div className="is-empty-state">{loadError}</div>}
                {!isLoading && !loadError && filteredProducts.length === 0 && <div className="is-empty-state">No products found in this category.</div>}

                {!isLoading && !loadError && <div ref={matrixRef} className="is-services-matrix is-product-matrix">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="is-item-card is-product-card" onClick={() => setActiveProduct(product)}>
                            <div className="is-product-image-wrap">
                                <img src={product.images[0]} alt={product.name} className="is-product-image" />
                            </div>

                            <div className="is-item-header">
                                <div className="is-product-name-row">
                                    <h3 className="is-item-title">{product.name}</h3>
                                    <span className="is-product-badge">{product.categoryName}</span>
                                </div>
                                <div className="is-item-meta-row">
                                    <span className="is-item-price">Rs. {product.price}</span>
                                    <span className="is-item-time-inline">/ {product.unit}</span>
                                </div>
                            </div>

                            <p className="is-item-desc">{product.description}</p>

                            <div className="is-product-meta-row">
                                <span>{product.stock_quantity} in stock</span>
                                <span>{product.farmer}</span>
                            </div>

                            <div className="is-item-footer">
                                <span className="is-item-time">📍 {product.market}</span>
                                <div className="is-item-actions">
                                    <button className="is-btn-book" onClick={(e) => { e.stopPropagation(); setActiveProduct(product); }}>View Details</button>
                                    <button className="is-btn-learn" onClick={(e) => { e.stopPropagation(); setCartCount((count) => count + 1); }}>Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>}
            </div>

            {activeProduct && (
                <div ref={modalOverlayRef} className="is-modal-overlay" onClick={closeModal}>
                    <div ref={modalBoxRef} className="is-modal-box is-product-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="is-modal-close" onClick={closeModal}>✕</button>

                        <div className="is-modal-left">
                            <div className="is-modal-img-frame">
                                <img src={activeProduct.images[0]} alt={activeProduct.name} />
                            </div>
                            <div className="is-modal-gallery">
                                {activeProduct.images.slice(0, 3).map((img, idx) => (
                                    <img key={`${activeProduct.id}-${idx}`} src={img} alt={`${activeProduct.name}-${idx}`} />
                                ))}
                            </div>
                        </div>

                        <div className="is-modal-right">
                            <div className="is-modal-rating">★ ★ ★ ★ ★ 4.9</div>

                            <h2 className="is-modal-title">{activeProduct.name}</h2>

                            <div className="is-modal-meta">
                                <span className="is-modal-price">Rs. {activeProduct.price}</span>
                                <span className="is-modal-time">per {activeProduct.unit}</span>
                            </div>

                            <p className="is-modal-desc">{activeProduct.description}</p>

                            <div className="is-modal-section is-product-stats">
                                <div>
                                    <span className="is-modal-label">AVAILABLE</span>
                                    <p className="is-modal-val">{activeProduct.stock_quantity} items in stock</p>
                                </div>
                                <div>
                                    <span className="is-modal-label">MARKET</span>
                                    <p className="is-modal-val">{activeProduct.market}</p>
                                </div>
                                <div>
                                    <span className="is-modal-label">OPEN DAYS</span>
                                    <p className="is-modal-val">{activeProduct.operating_days.join(', ')}</p>
                                </div>
                            </div>

                            <div className="is-farmer-box">
                                <img src={activeProduct.profileImage} alt={activeProduct.farmer} className="is-farmer-image" />
                                <div>
                                    <button 
                                        type="button"
                                        className="is-farmer-name-btn"
                                        onClick={() => {
                                            const farmerId = activeProduct?.farmerId || activeProduct?.ownerId || activeProduct?.id;
                                            navigate(`/farmer/${farmerId}`);
                                            closeModal();
                                        }}
                                    >
                                        {activeProduct.farmer}
                                    </button>
                                    <p className="is-farmer-detail">📍 {activeProduct.farmerAddress}</p>
                                    <p className="is-farmer-detail">📞 {activeProduct.farmerPhone}</p>
                                </div>
                            </div>

                            <div className="is-modal-actions">
                                <button
                                    className="is-modal-btn"
                                    onClick={() => {
                                        setCartCount((count) => count + 1);
                                        closeModal();
                                    }}
                                >
                                    Add to Cart
                                </button>
                                <button className="is-modal-btn is-modal-outline" onClick={closeModal}>Continue Shopping</button>
                            </div>

                            <div className="is-review-section">
                                <h4>Customer Reviews</h4>
                                <div className="is-review-list">
                                    {(activeProduct.reviews || []).map((review) => (
                                        <div key={review.id || review.customer} className="is-review-item">
                                            <div className="is-review-header">
                                                <strong>{review.customer_id?.username || review.customer || 'Customer'}</strong>
                                                <span>{'★'.repeat(review.rating)}{review.rating < 5 ? '☆'.repeat(5 - review.rating) : ''}</span>
                                            </div>
                                            <p>{review.comment}</p>
                                            <small>{review.review_date ? new Date(review.review_date).toLocaleDateString() : review.date || ''}</small>
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

export default InspectServices;