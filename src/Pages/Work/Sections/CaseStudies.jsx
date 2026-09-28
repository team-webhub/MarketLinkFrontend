import React, { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMarketsAPI } from '../Services/marketService';
import {
  addFavoriteMarket,
  addFavoriteFarmer,
  getUserFavorites,
  removeFavoriteMarket,
  removeFavoriteFarmer,
} from '../../../Core/favoritesService';
import '../Styles/CaseStudies.css';

gsap.registerPlugin(ScrollTrigger);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const marketIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3500/3500833.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -32],
});

const farmerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1892/1892520.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

const clusterIcon = (count) =>
  new L.DivIcon({
    html: `<div class="market-cluster"><span>${count}</span></div>`,
    className: 'leaflet-custom-cluster',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const defaultCenter = [31.5204, 74.3587];

const titleCase = (value) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (distance) => {
  if (distance === null || Number.isNaN(distance)) return 'Distance: --';
  if (distance < 1) return `${Math.round(distance * 1000)} m away`;
  return `${distance.toFixed(1)} km away`;
};

const getMarketStatus = (market) => {
  const operatingDays = Array.isArray(market.operating_days)
    ? market.operating_days.map((day) => day.toLowerCase())
    : [];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const now = new Date();
  const openAt = market.opening_time || '09:00';
  const closeAt = market.closing_time || '18:00';
  const [openHour, openMinute] = openAt.split(':').map(Number);
  const [closeHour, closeMinute] = closeAt.split(':').map(Number);

  const start = new Date(now);
  start.setHours(openHour, openMinute, 0, 0);

  const end = new Date(now);
  end.setHours(closeHour, closeMinute, 0, 0);

  if (!operatingDays.length || operatingDays.includes(today)) {
    if (now >= start && now <= end) {
      return { label: `Open Now • Closes at ${closeAt}`, type: 'open' };
    }

    if (now < start) {
      return { label: `Opens at ${openAt} today`, type: 'upcoming' };
    }

    return { label: `Closed today • Opens ${openAt} tomorrow`, type: 'closed' };
  }

  const nextDay = operatingDays.find((day) => day.localeCompare(today) >= 0) || operatingDays[0];
  return { label: `Closed today • Opens ${titleCase(nextDay)} ${openAt}`, type: 'closed' };
};

const isOperatingToday = (operatingDays) => {
  if (!Array.isArray(operatingDays) || operatingDays.length === 0) return true;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return operatingDays.some((day) => String(day).trim().toLowerCase() === today);
};

function MapViewSync({ userLocation, mapCenter }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 12, { animate: true });
      return;
    }

    map.setView(mapCenter, 10, { animate: true });
  }, [userLocation, mapCenter, map]);

  return null;
}

function CaseStudies() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [activeMarket, setActiveMarket] = useState(null);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [farmerData, setFarmerData] = useState(null);
  const [loadingFarmer, setLoadingFarmer] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [viewMode, setViewMode] = useState('list');
  const [favoriteMarkets, setFavoriteMarkets] = useState([]);
  const [favoriteFarmers, setFavoriteFarmers] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [cartItems, setCartItems] = useState([]);
  const [routeStops, setRouteStops] = useState([]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const result = await fetchMarketsAPI(selectedLocation, selectedDay);
      if (result.success) {
        setMarkets(Array.isArray(result.data) ? result.data : []);
      } else {
        setMarkets([]);
      }
    } catch (error) {
      console.error('Frontend error:', error);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMarkets();
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedLocation, selectedDay]);

  const productCatalog = useMemo(() => {
    const unique = new Set();
    markets.forEach((market) => {
      (market.farmers || []).forEach((farmer) => {
        if (farmer && farmer.produce) {
          const items = farmer.produce.split(',').map((item) => item.trim()).filter(Boolean);
          items.forEach((item) => unique.add(item));
        }
      });
    });

    return ['All Products', ...Array.from(unique).sort()];
  }, [markets]);

  const allMarketsWithMeta = useMemo(() => {
    return markets.map((market) => {
      const lat = Number(market.latitude);
      const lng = Number(market.longitude);
      const farmers = Array.isArray(market.farmers) ? market.farmers : [];
      const weather = ['26°C Sunny', '22°C Breezy', '28°C Clear'][Math.abs((market.market_id || 0) + new Date().getDay()) % 3];
      const status = getMarketStatus({
        ...market,
        operating_days: farmers.flatMap((farmer) => farmer.operating_days || []),
      });

      let distance = null;
      if (userLocation && Number.isFinite(lat) && Number.isFinite(lng)) {
        distance = getDistanceKm(userLocation[0], userLocation[1], lat, lng);
      }

      const facilityTags = [
        market.parking ? '🅿️ Free Parking' : null,
        market.accessible ? '♿ Wheelchair Access' : null,
        market.payment ? '💳 Cash & Online' : null,
      ].filter(Boolean);

      return {
        ...market,
        latitude: lat,
        longitude: lng,
        weather,
        status,
        distance,
        facilityTags,
        farmerCount: farmers.length,
        score: farmers.length + (distance !== null ? 1 / Math.max(distance, 0.1) : 0),
      };
    });
  }, [markets, userLocation]);

  const filteredMarkets = useMemo(() => {
    let next = [...allMarketsWithMeta];

    if (selectedLocation) {
      const term = selectedLocation.toLowerCase();
      next = next.filter((market) => {
        return (market.title || '').toLowerCase().includes(term) || (market.address || '').toLowerCase().includes(term);
      });
    }

    if (selectedProduct !== 'All Products') {
      next = next.filter((market) => {
        return (market.farmers || []).some((farmer) => {
          return farmer && farmer.produce && farmer.produce.toLowerCase().includes(selectedProduct.toLowerCase());
        });
      });
    }

    if (selectedDay) {
      next = next.filter((market) => {
        const days = (market.farmers || []).flatMap((farmer) => farmer.operating_days || []);
        if (!days.length) return true;
        return days.some((day) => day.toLowerCase() === selectedDay.toLowerCase());
      });
    }

    if (userLocation) {
      next = next
        .map((market) => ({
          ...market,
          distance:
            market.distance ??
            getDistanceKm(userLocation[0], userLocation[1], Number(market.latitude), Number(market.longitude)),
        }))
        .filter((market) => market.distance <= radiusKm)
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else {
      next = next.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return next;
  }, [allMarketsWithMeta, selectedLocation, selectedDay, selectedProduct, userLocation, radiusKm]);

  const clusterGroups = useMemo(() => {
    const groups = new Map();

    filteredMarkets.forEach((market) => {
      const key = `${Number(market.latitude).toFixed(4)}|${Number(market.longitude).toFixed(4)}`;
      if (!groups.has(key)) {
        groups.set(key, {
          lat: Number(market.latitude),
          lng: Number(market.longitude),
          items: [],
        });
      }
      groups.get(key).items.push(market);
    });

    return Array.from(groups.values()).map((group) => ({
      lat: group.lat,
      lng: group.lng,
      count: group.items.length,
      items: group.items,
      title: group.items[0]?.title || 'Local Market',
    }));
  }, [filteredMarkets]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('This browser does not support location detection.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = [position.coords.latitude, position.coords.longitude];
        setUserLocation(nextLocation);
        setMapCenter(nextLocation);
      },
      () => {
        alert('Location access was denied. You can still browse markets manually.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handleOpenFarmerProfile = async (farmerId) => {
    try {
      setLoadingFarmer(true);
      setSelectedFarmerId(farmerId);
      // Navigate to farmer profile page
      navigate(`/farmer/${farmerId}`);
    } catch (err) {
      console.error('Farmer profile navigation error:', err);
    } finally {
      setLoadingFarmer(false);
    }
  };

  useEffect(() => {
    const fetchSavedFavorites = async () => {
      try {
        const response = await getUserFavorites();
        const savedMarkets = (response.favoriteMarkets || []).map((market) => market._id || market);
        const savedFarmers = (response.favoriteFarmers || []).map((farmer) => farmer._id || farmer);
        setFavoriteMarkets(savedMarkets);
        setFavoriteFarmers(savedFarmers);
      } catch (error) {
        console.warn('No saved favorites yet or user not logged in:', error);
      }
    };

    fetchSavedFavorites();
  }, []);

  const handleToggleFavorite = async (marketId) => {
    if (!marketId) return;

    const isSaved = favoriteMarkets.includes(marketId);

    try {
      if (isSaved) {
        await removeFavoriteMarket(marketId);
        setFavoriteMarkets((prev) => prev.filter((id) => id !== marketId));
      } else {
        await addFavoriteMarket(marketId);
        setFavoriteMarkets((prev) => [...prev, marketId]);
      }
    } catch (error) {
      console.error('Failed to update favorite market:', error);
      alert('Please login to save market favorites.');
    }
  };

  const handleToggleFarmerFavorite = async (farmerId) => {
    if (!farmerId) return;

    const isSaved = favoriteFarmers.includes(farmerId);

    try {
      if (isSaved) {
        await removeFavoriteFarmer(farmerId);
        setFavoriteFarmers((prev) => prev.filter((id) => id !== farmerId));
      } else {
        await addFavoriteFarmer(farmerId);
        setFavoriteFarmers((prev) => [...prev, farmerId]);
      }
    } catch (error) {
      console.error('Failed to update favorite farmer:', error);
      alert('Please login to save farmer favorites.');
    }
  };

  const handleAddToCart = (product) => {
    setCartItems((prev) => [
      ...prev,
      {
        id: `${product._id || product.name}-${Date.now()}`,
        name: product.name,
        price: product.price,
        unit: product.unit || 'kg',
        market: product.market || 'Local pickup',
      },
    ]);
  };

  const handleRemoveFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleRoutePlan = (market, farmer) => {
    const nextStops = [
      { label: 'Your location', position: userLocation || defaultCenter },
      { label: market.title || market.market_name, position: [Number(market.latitude), Number(market.longitude)] },
      {
        label: farmer?.name || farmer?.business_name || 'Farmer stall',
        position: [Number(farmer.latitude || market.latitude), Number(farmer.longitude || market.longitude)],
      },
    ];

    setRouteStops(nextStops);
    setActiveMarket(market);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="cs-section" id="markets-grid">
      <div className="cs-container">
        <div ref={headerRef} className="cs-header-grid">
          <div className="cs-title-col">
            <span className="cs-badge">— NEARBY FARMERS MARKETS</span>
            <h2 className="cs-main-heading">
              BROWSE LOCAL <br />
              MARKETS & FARMERS
            </h2>
          </div>
          <div className="cs-desc-col">
            <p className="cs-desc-text">
              Search nearby markets by city location and operating day to view active stalls, live map locations, and weekly stock.
            </p>
          </div>
        </div>

        <div className="cs-filter-bar">
          <input
            type="text"
            placeholder="🔍 Search Market Name or City..."
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="cs-filter-input"
          />

          <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="cs-filter-select">
            <option value="">All Days</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>

          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="cs-filter-select">
            {productCatalog.map((product) => (
              <option key={product} value={product}>{product}</option>
            ))}
          </select>

          {/* <div className="cs-range-wrap">
            <label htmlFor="distance-range">Radius: {radiusKm} km</label>
            <input
              id="distance-range"
              type="range"
              min="5"
              max="50"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
          </div> */}

          <button className="cs-location-btn" onClick={handleUseMyLocation}>
            {userLocation ? '📍 My Location Active' : 'Use My Location'}
          </button>
        </div>

        <div className="cs-map-tools">
          <div className="cs-view-toggle">
            {/* <button className={viewMode === 'split' ? 'cs-toggle-btn active' : 'cs-toggle-btn'} onClick={() => setViewMode('split')}>
              🗺️ Split View
            </button> */}
            <button className={viewMode === 'map' ? 'cs-toggle-btn active' : 'cs-toggle-btn'} onClick={() => setViewMode('map')}>
              🗺️ Map
            </button>
            <button className={viewMode === 'list' ? 'cs-toggle-btn active' : 'cs-toggle-btn'} onClick={() => setViewMode('list')}>
              📋 List
            </button>
          </div>

          <div className="cs-route-summary">
            {routeStops.length > 0 ? <span>{routeStops.map((stop) => stop.label).join(' → ')}</span> : <span>Pickup route planner ready</span>}
          </div>
        </div>

        <div className={`cs-layout ${viewMode}`}>
          <div className="cs-map-panel">
            <div className="cs-map-shell">
              <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapViewSync userLocation={userLocation} mapCenter={mapCenter} />
                {userLocation && <Circle center={userLocation} radius={radiusKm * 1000} pathOptions={{ color: '#4ade80', fillOpacity: 0.12 }} />}

                {clusterGroups.map((cluster) => (
                  <Marker
                    key={`${cluster.lat}-${cluster.lng}`}
                    position={[cluster.lat, cluster.lng]}
                    icon={cluster.count > 1 ? clusterIcon(cluster.count) : marketIcon}
                  >
                    <Popup>
                      <div className="cs-map-popup">
                        <strong>{cluster.title}</strong>
                        <p>{cluster.count} market hubs nearby</p>
                        {cluster.items.slice(0, 2).map((market) => (
                          <div key={market._id} className="cs-popup-item">
                            <span>{market.title}</span>
                            <button onClick={() => setActiveMarket(market)}>View</button>
                          </div>
                        ))}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {filteredMarkets.flatMap((market) =>
                  (market.farmers || []).map((farmer) => {
                    if (!farmer || !farmer.latitude || !farmer.longitude) return null;
                    return (
                      <Marker key={`${market._id}-${farmer._id}`} position={[Number(farmer.latitude), Number(farmer.longitude)]} icon={farmerIcon}>
                        <Popup>
                          <div style={{ color: '#111827' }}>
                            <strong>🌾 {farmer.name}</strong>
                            <p style={{ margin: '4px 0 8px' }}>{farmer.produce || 'Fresh produce'}</p>
                            <div className="cs-popup-actions">
                              <button onClick={() => handleOpenFarmerProfile(farmer._id)}>View Stock</button>
                              <button onClick={() => handleRoutePlan(market, farmer)}>Route</button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })
                )}
              </MapContainer>
            </div>
          </div>

          <div className="cs-list-panel">
            <div className="cs-grid">
              {loading ? (
                <p className="cs-no-results">Loading markets...</p>
              ) : filteredMarkets.length > 0 ? (
                filteredMarkets.map((market) => {
                  const favorite = favoriteMarkets.includes(market._id);

                  return (
                    <div key={market._id} className="cs-card" onClick={() => setActiveMarket(market)}>
                      <div className="cs-image-wrapper">
                        <span className={`cs-status-pill ${market.status.type}`}>{market.status.label}</span>
                        <button
                          className={`cs-favorite-btn ${favorite ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(market._id);
                          }}
                          aria-label="Save market"
                        >
                          {favorite ? '♥' : '♡'}
                        </button>
                        <img src={market.image} alt={market.title} className="cs-image" loading="lazy" />
                        <div className="cs-image-overlay"></div>
                      </div>

                      <div className="cs-card-info">
                        <div className="cs-meta-row">
                          <span className="cs-project-tag">STALLS & PRODUCE</span>
                          <span className="cs-location-tag">
                            {userLocation ? formatDistance(market.distance) : `📍 ${market.address}`}
                          </span>
                        </div>

                        <h3 className="cs-project-title">{market.title}</h3>

                        <div className="cs-market-badges">
                          <span className="cs-badge-tag">☀️ {market.weather}</span>
                          {(market.facilityTags || []).map((tag) => (
                            <span key={tag} className="cs-badge-tag">{tag}</span>
                          ))}
                        </div>

                        <p className="cs-stall-desc">
                          {market.farmerCount > 0
                            ? `${market.farmerCount} local farmers • ${market.farmers.slice(0, 2).map((farmer) => farmer.name).join(', ')}`
                            : 'Fresh produce and community stalls'}
                        </p>

                        <div className="cs-action-row">
                          <button className="cs-view-farmers-btn" onClick={(e) => { e.stopPropagation(); setActiveMarket(market); }}>
                            View Registered Farmers ({market.farmerCount}) →
                          </button>
                          <button
                            className="cs-mini-cta"
                            onClick={(e) => {
                              e.stopPropagation();
                              const firstFarmer = market.farmers?.[0];
                              if (firstFarmer) handleRoutePlan(market, firstFarmer);
                            }}
                          >
                            Route Plan
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="cs-no-results">No markets match your filters.</p>
              )}
            </div>
          </div>
        </div>

        {activeMarket && (
          <div className="cs-modal-overlay" onClick={() => setActiveMarket(null)}>
            <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="cs-modal-close" onClick={() => setActiveMarket(null)}>✕</button>
              <h3>{activeMarket.title}</h3>
              <p className="cs-modal-sub">📍 {activeMarket.address}</p>

              <div className="cs-market-summary-box">
                <span>{activeMarket.status.label}</span>
                <span>☀️ {activeMarket.weather || '26°C Sunny'}</span>
                <span>{activeMarket.distance ? formatDistance(activeMarket.distance) : 'Local pickup hub'}</span>
              </div>

              <div className="cs-facilities-wrap">
                {(activeMarket.facilityTags || []).map((tag) => (
                  <span key={tag} className="cs-badge-tag">{tag}</span>
                ))}
              </div>

              <hr className="cs-modal-divider" />

              <h4 className="cs-modal-section-title">👨‍🌾 Farmers Selling At This Market:</h4>
              <div className="cs-farmers-list">
                {(activeMarket.farmers || []).length > 0 ? (
                  activeMarket.farmers.map((farmer) => (
                    <div key={farmer._id} className="cs-farmer-card">
                      <img src={farmer.profile_picture || 'https://via.placeholder.com/50'} alt={farmer.name} className="cs-farmer-img" />
                      <div className="cs-farmer-info">
                        <button
                          type="button"
                          className="cs-farmer-name-btn"
                          onClick={() => handleOpenFarmerProfile(farmer._id)}
                        >
                          {farmer.name}
                        </button>
                        <p className="cs-farmer-produce">🌾 {farmer.produce}</p>
                        <span className="cs-farmer-days">🗓 Days: {farmer.operating_days ? farmer.operating_days.join(', ') : 'All Week'}</span>
                      </div>
                      <div className="cs-farmer-actions">
                        <button onClick={() => handleOpenFarmerProfile(farmer._id)}>View Stock</button>
                        <button onClick={() => handleRoutePlan(activeMarket, farmer)}>Route</button>
                        <button
                          type="button"
                          className={favoriteFarmers.includes(farmer._id) ? 'cs-favorite-btn active' : 'cs-favorite-btn'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFarmerFavorite(farmer._id);
                          }}
                        >
                          {favoriteFarmers.includes(farmer._id) ? '♥ Saved' : '♡ Save'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="cs-no-farmers">No registered farmers found for this market.</p>
                )}
              </div>

              {routeStops.length > 0 && (
                <div className="cs-route-box">
                  <h4 className="cs-modal-section-title">🧭 Multi-Stop Pickup Route</h4>
                  <ol>
                    {routeStops.map((stop, index) => (
                      <li key={`${stop.label}-${index}`}>
                        <span>{index + 1}</span>
                        {stop.label}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedFarmerId && (
          <div className="cs-modal-overlay" onClick={() => setSelectedFarmerId(null)}>
            <div className="cs-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
              <button className="cs-modal-close" onClick={() => setSelectedFarmerId(null)}>✕</button>

              {loadingFarmer ? (
                <p style={{ padding: '20px', color: '#aaa' }}>Loading farmer profile & stock...</p>
              ) : farmerData ? (
                <div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                    <img
                      src={farmerData.profile.profile_picture || 'https://via.placeholder.com/80'}
                      alt={farmerData.profile.stall_name}
                      style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #4ade80' }}
                    />
                    <div>
                      <h2 style={{ margin: 0, color: '#fff' }}>{farmerData.profile.stall_name}</h2>
                      <p style={{ margin: '2px 0', color: '#aaa' }}>Owner: {farmerData.profile.contact_person}</p>
                      <p style={{ margin: 0, color: '#4ade80' }}>⭐ Rating: {farmerData.profile.avg_rating} ({farmerData.profile.total_reviews} reviews)</p>
                    </div>
                  </div>

                  <div style={{ background: '#1c1f26', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', color: '#ccc', marginBottom: '20px' }}>
                    <p style={{ margin: '4px 0' }}>📍 <strong>Pickup Address:</strong> {farmerData.profile.address}</p>
                    <p style={{ margin: '4px 0' }}>🗓 <strong>Days:</strong> {farmerData.profile.operating_days?.join(', ') || 'All Week'}</p>
                    <p style={{ margin: '4px 0' }}>⏰ <strong>Pickup Hours:</strong> {farmerData.profile.pickup_time_windows?.join(' | ') || '09:00 AM - 05:00 PM'}</p>
                    <p style={{ margin: '4px 0' }}>📞 <strong>Contact:</strong> {farmerData.profile.phone}</p>
                  </div>

                  <h4 style={{ color: '#4ade80', marginBottom: '12px' }}>🌾 Current Weekly Stock & Pre-Orders:</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {isOperatingToday(farmerData.profile.operating_days) && farmerData.weekly_stock && farmerData.weekly_stock.length > 0 ? (
                      farmerData.weekly_stock.map((stock) => (
                        <div key={stock._id} style={{ background: '#1c1f26', border: '1px solid #333', borderRadius: '8px', padding: '10px' }}>
                          <img src={stock.image_url || 'https://via.placeholder.com/150'} alt={stock.name} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px' }} />
                          <h5 style={{ margin: '8px 0 4px', color: '#fff' }}>{stock.name}</h5>
                          <p style={{ color: '#4ade80', fontWeight: 'bold', margin: '2px 0' }}>Rs. {stock.price} / {stock.unit}</p>
                          <p style={{ fontSize: '0.75rem', color: '#aaa', margin: '2px 0 8px' }}>Stock: {stock.stock_quantity} {stock.unit}</p>
                          <button
                            onClick={() => handleAddToCart({
                              _id: stock._id,
                              name: stock.name,
                              price: stock.price,
                              unit: stock.unit,
                              market: farmerData.profile.stall_name,
                            })}
                            style={{ width: '100%', background: '#4ade80', border: 'none', padding: '6px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            Quick Add
                          </button>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#aaa', gridColumn: '1/-1' }}>
                        {isOperatingToday(farmerData.profile.operating_days)
                          ? 'No active weekly stock available.'
                          : 'This farmer is not operating today, so products are unavailable.'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#ef4444' }}>Failed to load profile details.</p>
              )}
            </div>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="cs-cart-drawer">
            <div className="cs-cart-head">
              <strong>Quick Basket</strong>
              <span>{cartItems.length} items</span>
            </div>
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="cs-cart-item">
                <div>
                  <span>{item.name}</span>
                  <small>{item.market}</small>
                </div>
                <div className="cs-cart-item-actions">
                  <strong>Rs. {item.price}</strong>
                  <button
                    type="button"
                    className="cs-cart-remove"
                    onClick={() => handleRemoveFromCart(item.id)}
                    aria-label={`Remove ${item.name} from basket`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button className="cs-cart-submit">Pre-Order</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default CaseStudies;