import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import API from '../../../Core/api';
import '../Styles/MarketDetail.css';

gsap.registerPlugin(ScrollTrigger);

const MarketDetail = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  
  const [market, setMarket] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  
  // Demo Market Data
  const demoMarketData = {
    _id: marketId || '1',
    title: 'Central Farmers Market',
    address: '123 Market Street, Mumbai, Maharashtra 400001',
    latitude: 19.0760,
    longitude: 72.8777,
    description: 'Premier wholesale and retail farmers market serving Mumbai with fresh produce daily. Operating since 1990.',
    operating_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    operating_hours: { start: '06:00', end: '18:00' },
    total_stalls: 45,
    established_year: 1990,
    phone: '+91 22 1234 5678',
    email: 'contact@centralmarket.com',
  };

  // Demo Farmer Data
  const demoFarmersData = [
    {
      _id: '1',
      business_name: 'Fresh Valley Farm',
      username: 'fresh_valley',
      address: 'Stall 12, Central Market',
      profile_picture: 'https://via.placeholder.com/150/2d7a1a/4ade80?text=FVF',
      contact_number: '+91 98765 43210',
      rating: 4.8,
      totalReviews: 156,
      about: 'Certified organic vegetables supplier with 20 years experience',
      weekly_stock: [
        { name: 'Tomato', quantity: '500kg', unit: 'kg' },
        { name: 'Lettuce', quantity: '200kg', unit: 'kg' },
        { name: 'Carrot', quantity: '300kg', unit: 'kg' },
      ],
    },
    {
      _id: '2',
      business_name: 'Organic Harvest',
      username: 'organic_harvest',
      address: 'Stall 34, Central Market',
      profile_picture: 'https://via.placeholder.com/150/4ade80/000000?text=OH',
      contact_number: '+91 98765 43211',
      rating: 4.9,
      totalReviews: 203,
      about: 'Premium organic produce sourced from multiple farms',
      weekly_stock: [
        { name: 'Spinach', quantity: '150kg', unit: 'kg' },
        { name: 'Broccoli', quantity: '180kg', unit: 'kg' },
        { name: 'Cucumber', quantity: '250kg', unit: 'kg' },
      ],
    },
    {
      _id: '3',
      business_name: 'Seasonal Delights',
      username: 'seasonal_delights',
      address: 'Stall 56, Central Market',
      profile_picture: 'https://via.placeholder.com/150/16a34a/ffffff?text=SD',
      contact_number: '+91 98765 43212',
      rating: 4.7,
      totalReviews: 98,
      about: 'Specializing in seasonal produce at the best prices',
      weekly_stock: [
        { name: 'Mango', quantity: '400kg', unit: 'kg' },
        { name: 'Banana', quantity: '350kg', unit: 'kg' },
        { name: 'Orange', quantity: '300kg', unit: 'kg' },
      ],
    },
    {
      _id: '4',
      business_name: 'Green Fields Co',
      username: 'green_fields',
      address: 'Stall 78, Central Market',
      profile_picture: 'https://via.placeholder.com/150/dcfce7/15803d?text=GFC',
      contact_number: '+91 98765 43213',
      rating: 4.6,
      totalReviews: 145,
      about: 'Supplying fresh vegetables to local restaurants and households',
      weekly_stock: [
        { name: 'Bell Pepper', quantity: '200kg', unit: 'kg' },
        { name: 'Onion', quantity: '500kg', unit: 'kg' },
        { name: 'Potato', quantity: '600kg', unit: 'kg' },
      ],
    },
  ];

  useEffect(() => {
    fetchMarketData();
  }, [marketId]);

  useEffect(() => {
    if (market) {
      // Scroll Trigger Animations
      const elementsToAnimate = document.querySelectorAll('.md-fade-in');
      elementsToAnimate.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'top 50%',
              scrub: false,
            },
          }
        );
      });
    }
  }, [market]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      // Try to fetch from API, fallback to demo data
      try {
        const response = await API.get(`/markets/${marketId}`);
        setMarket(response.data);
      } catch {
        setMarket(demoMarketData);
      }
      setFarmers(demoFarmersData);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setMarket(demoMarketData);
      setFarmers(demoFarmersData);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaps = () => {
    if (market) {
      const mapsUrl = `https://www.google.com/maps?q=${market.latitude},${market.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleFarmerClick = (farmerId) => {
    navigate(`/farmer/${farmerId}`);
  };

  if (loading) {
    return (
      <div className="md-section">
        <div className="md-loader">Loading market details...</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="md-section">
        <div className="md-loader">Market not found</div>
      </div>
    );
  }

  return (
    <div className="md-section">
      <div className="md-container">
        {/* Back Button */}
        <button className="md-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Market Header */}
        <div className="md-fade-in">
          <div className="md-header-card">
            <div className="md-header-content">
              <h1 className="md-market-title">{market.title}</h1>
              <p className="md-market-address">📍 {market.address}</p>
              <p className="md-market-description">{market.description}</p>
              <div className="md-header-actions">
                <button className="md-directions-btn" onClick={handleOpenMaps}>
                  📍 Get Directions
                </button>
                <a href={`tel:${market.phone}`} className="md-contact-btn">
                  📞 {market.phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Market Info Grid */}
        <div className="md-fade-in">
          <div className="md-info-grid">
            <div className="md-info-box">
              <span className="md-info-label">Operating Hours</span>
              <span className="md-info-value">
                {market.operating_hours.start} - {market.operating_hours.end}
              </span>
            </div>
            <div className="md-info-box">
              <span className="md-info-label">Total Stalls</span>
              <span className="md-info-value">{market.total_stalls}</span>
            </div>
            <div className="md-info-box">
              <span className="md-info-label">Established</span>
              <span className="md-info-value">{market.established_year}</span>
            </div>
            <div className="md-info-box">
              <span className="md-info-label">Email</span>
              <a href={`mailto:${market.email}`} className="md-info-value">
                {market.email}
              </a>
            </div>
          </div>
        </div>

        {/* Operating Days */}
        <div className="md-fade-in">
          <div className="md-operating-section">
            <h2>Operating Days</h2>
            <div className="md-days-grid">
              {market.operating_days.map((day, idx) => (
                <div key={idx} className="md-day-badge">
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Farmers Section */}
        <div className="md-fade-in">
          <div className="md-farmers-section">
            <h2>Our Farmers ({farmers.length})</h2>
            <div className="md-farmers-grid">
              {farmers.map((farmer) => (
                <div
                  key={farmer._id}
                  className="md-farmer-card"
                  onClick={() => handleFarmerClick(farmer._id)}
                >
                  {/* Farmer Image */}
                  <img
                    src={farmer.profile_picture}
                    alt={farmer.business_name}
                    className="md-farmer-image"
                  />

                  {/* Farmer Info */}
                  <div className="md-farmer-info">
                    <h3>{farmer.business_name}</h3>
                    <p className="md-farmer-handle">@{farmer.username}</p>
                    <p className="md-farmer-stall">{farmer.address}</p>

                    {/* Rating */}
                    <div className="md-farmer-rating">
                      <span className="md-stars">⭐ {farmer.rating}</span>
                      <span className="md-reviews">
                        ({farmer.totalReviews} reviews)
                      </span>
                    </div>

                    {/* About */}
                    <p className="md-farmer-about">{farmer.about}</p>

                    {/* Weekly Stock */}
                    <div className="md-stock-section">
                      <span className="md-stock-label">This Week's Stock:</span>
                      <div className="md-stock-list">
                        {farmer.weekly_stock.map((item, idx) => (
                          <span key={idx} className="md-stock-item">
                            {item.name}: {item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* View Farmer Button */}
                    <button className="md-view-btn">View Full Profile →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="md-divider"></div>

        {/* CTA Section */}
        <div className="md-fade-in">
          <div className="md-cta-section">
            <h2>Ready to Shop?</h2>
            <p>Browse our full product catalog and find fresh produce from all our farmers.</p>
            <button
              className="md-shop-btn"
              onClick={() => navigate('/services')}
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
