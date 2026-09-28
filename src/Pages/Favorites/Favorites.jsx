import React, { useState, useEffect } from 'react';
import {
  getUserFavorites,
  removeFavoriteFarmer,
  removeFavoriteProduct,
  removeFavoriteMarket
} from '../../Core/favoritesService';
import './Favorites.css';

function Favorites() {
  const [favoriteFarmers, setFavoriteFarmers] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [savedMarkets, setSavedMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await getUserFavorites();
      setFavoriteFarmers(data.favoriteFarmers || []);
      setFavoriteProducts(data.favoriteProducts || []);
      setSavedMarkets(data.favoriteMarkets || []);
      setError(null);
    } catch (err) {
      setError('Failed to load favorites. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFarmer = async (farmerId) => {
    try {
      await removeFavoriteFarmer(farmerId);
      setFavoriteFarmers(prevFarmers =>
        prevFarmers.filter(farmer => farmer._id !== farmerId)
      );
    } catch (err) {
      setError('Failed to remove farmer from favorites.');
      console.error(err);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await removeFavoriteProduct(productId);
      setFavoriteProducts(prevProducts =>
        prevProducts.filter(product => product._id !== productId)
      );
    } catch (err) {
      setError('Failed to remove product from favorites.');
      console.error(err);
    }
  };

  const handleRemoveMarket = async (marketId) => {
    try {
      await removeFavoriteMarket(marketId);
      setSavedMarkets(prevMarkets =>
        prevMarkets.filter(market => market._id !== marketId)
      );
    } catch (err) {
      setError('Failed to remove market from saved locations.');
      console.error(err);
    }
  };

  const openMapRoute = (market) => {
    const marketName = market.market_name || market.name || market.title || 'Market';
    const marketAddress = market.address || `${market.city || ''} ${marketName}`.trim();
    const destination = encodeURIComponent(`${marketAddress}`.trim());
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const restockAlerts = favoriteProducts.filter((product) => {
    const stock = Number(product.stock_quantity ?? 0);
    return stock <= 5 || product.is_available === false;
  });

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading">Loading your favorites...</div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>Saved Preferences</h1>
        <p>Your favorite farmers, products, market stops, and restock alerts.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="favorites-section">
        <h2 className="section-title">Favorite Farmers ({favoriteFarmers.length})</h2>
        {favoriteFarmers.length === 0 ? (
          <div className="empty-state">
            <p>No favorite farmers yet. Start adding your favorite farmers!</p>
          </div>
        ) : (
          <div className="farmers-grid">
            {favoriteFarmers.map(farmer => (
              <div key={farmer._id} className="farmer-card">
                <div className="farmer-image">
                  <img
                    src={farmer.profile_picture || 'https://i.pinimg.com/736x/8f/13/55/8f135576401.jpg'}
                    alt={farmer.username}
                  />
                  <div className="heart-badge">❤️</div>
                </div>
                <div className="farmer-info">
                  <h3>{farmer.business_name || farmer.username}</h3>
                  <p className="farmer-name">@{farmer.username}</p>
                  {farmer.contact_number && (
                    <p className="farmer-phone">
                      <i className="fas fa-phone"></i> {farmer.contact_number}
                    </p>
                  )}
                  {farmer.location_url && (
                    <a
                      href={farmer.location_url}
                      className="farmer-location-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i className="fas fa-map-marker-alt"></i> View Location
                    </a>
                  )}
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveFarmer(farmer._id)}
                  title="Remove from favorites"
                >
                  <i className="fas fa-trash"></i> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="favorites-section">
        <h2 className="section-title">Favorite Products ({favoriteProducts.length})</h2>
        {favoriteProducts.length === 0 ? (
          <div className="empty-state">
            <p>No favorite products yet. Start adding your favorite products!</p>
          </div>
        ) : (
          <div className="products-grid">
            {favoriteProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/200'}
                    alt={product.name}
                  />
                  <div className="heart-badge">❤️</div>
                  {!product.is_available && (
                    <div className="sold-out-badge">Sold Out</div>
                  )}
                  {Number(product.stock_quantity ?? 0) <= 5 && product.is_available && (
                    <div className="stock-alert-badge">Low Stock</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <div className="product-details">
                    <span className="price">
                      <strong>₹{product.price}</strong>
                      <span className="unit">/{product.unit}</span>
                    </span>
                    <span className={`stock ${product.stock_quantity > 0 ? 'available' : 'unavailable'}`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveProduct(product._id)}
                  title="Remove from favorites"
                >
                  <i className="fas fa-trash"></i> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="favorites-section">
        <h2 className="section-title">Saved Market Locations ({savedMarkets.length})</h2>
        {savedMarkets.length === 0 ? (
          <div className="empty-state">
            <p>No saved market locations yet.</p>
          </div>
        ) : (
          <div className="markets-grid">
            {savedMarkets.map(market => (
              <div key={market._id} className="market-card">
                <div className="market-top-row">
                  <div>
                    <h3>{market.market_name || market.name || market.title}</h3>
                    <p className="market-city">{market.city || 'Market'}</p>
                  </div>
                  <span className="market-distance">Saved</span>
                </div>
                <p className="market-address">{market.address}</p>
                <div className="market-actions">
                  <button className="route-btn" onClick={() => openMapRoute(market)}>
                    <i className="fas fa-route"></i> Quick Route
                  </button>
                  <button className="remove-btn market-remove-btn" onClick={() => handleRemoveMarket(market._id)}>
                    <i className="fas fa-trash"></i> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="favorites-section">
        <h2 className="section-title">Restock Alert Notifications ({restockAlerts.length})</h2>
        {restockAlerts.length === 0 ? (
          <div className="empty-state">
            <p>No restock alerts right now. Your saved products are well stocked.</p>
          </div>
        ) : (
          <div className="alerts-list">
            {restockAlerts.map(product => (
              <div key={product._id} className="alert-card">
                <div className="alert-icon">🔔</div>
                <div className="alert-content">
                  <h3>{product.name}</h3>
                  <p>
                    {Number(product.stock_quantity ?? 0) <= 0
                      ? 'Out of stock — notify me when it returns.'
                      : `Only ${product.stock_quantity} left in stock. Consider restocking soon.`}
                  </p>
                </div>
                <span className="alert-tag">Restock</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="favorites-summary">
        <div className="summary-card">
          <div className="summary-icon">👨‍🌾</div>
          <div className="summary-text">
            <p className="summary-number">{favoriteFarmers.length}</p>
            <p className="summary-label">Favorite Farmers</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🛒</div>
          <div className="summary-text">
            <p className="summary-number">{favoriteProducts.length}</p>
            <p className="summary-label">Favorite Products</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">📍</div>
          <div className="summary-text">
            <p className="summary-number">{savedMarkets.length}</p>
            <p className="summary-label">Saved Markets</p>
          </div>
        </div>
        <div className="summary-card alert-summary-card">
          <div className="summary-icon">🔔</div>
          <div className="summary-text">
            <p className="summary-number">{restockAlerts.length}</p>
            <p className="summary-label">Restock Alerts</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Favorites;
