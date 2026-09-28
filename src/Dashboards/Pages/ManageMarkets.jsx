import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../Core/api';
import '../Styles/ManageMarkets.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const initialForm = {
  market_name: '',
  address: '',
  latitude: '31.5204',
  longitude: '74.3587',
  map_provider: 'OpenStreetMap',
  map_link: '',
  operating_days: ['Saturday', 'Sunday'],
  opening_time: '09:00',
  closing_time: '18:00',
  image_url: '',
};

const ManageMarkets = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ lat: 31.5204, lng: 74.3587 });
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlaceName, setSelectedPlaceName] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const fetchMarkets = async () => {
    try {
      const response = await API.get('/admin/markets');
      setMarkets(response.data?.markets || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.operating_days.includes(day);
      return {
        ...prev,
        operating_days: exists
          ? prev.operating_days.filter((item) => item !== day)
          : [...prev.operating_days, day],
      };
    });
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.market_name.trim() || !formData.address.trim()) {
      toast.error('Market name and address are required');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        operating_days: formData.operating_days || [],
      };

      if (editingId) {
        await API.put(`/admin/markets/${editingId}`, payload);
        toast.success('Market updated successfully');
      } else {
        await API.post('/admin/markets', payload);
        toast.success('Market added successfully');
      }

      resetForm();
      fetchMarkets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Market save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (market) => {
    setEditingId(market._id);
    setFormData({
      market_name: market.market_name || '',
      address: market.address || '',
      latitude: String(market.latitude ?? 31.5204),
      longitude: String(market.longitude ?? 74.3587),
      map_provider: market.map_provider || 'OpenStreetMap',
      map_link: market.map_link || '',
      operating_days: market.operating_days || [],
      opening_time: market.opening_time || '09:00',
      closing_time: market.closing_time || '18:00',
      image_url: market.image_url || '',
    });
    // set picker to current market coords
    setPickerPosition({ lat: Number(market.latitude || 31.5204), lng: Number(market.longitude || 74.3587) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const MapClick = ({ setPos }) => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPos({ lat, lng });
      }
    });
    return null;
  };

  useEffect(() => {
    if (mapRef.current && pickerPosition) {
      try {
        mapRef.current.setView([pickerPosition.lat, pickerPosition.lng], mapRef.current.getZoom());
      } catch (e) {
        // ignore
      }
    }
  }, [pickerPosition]);

  const searchPlaces = async (q) => {
    if (!q || !q.trim()) return setSearchResults([]);
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=6&accept-language=en`
      );
      const json = await res.json();
      setSearchResults(json || []);
    } catch (err) {
      console.error('Search failed', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (marketId) => {
    if (!window.confirm('Delete this market permanently?')) {
      return;
    }

    try {
      await API.delete(`/admin/markets/${marketId}`);
      toast.success('Market deleted successfully');
      if (editingId === marketId) {
        resetForm();
      }
      fetchMarkets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete market');
    }
  };

  const openMap = (market) => {
    const link = market.map_link || `https://www.google.com/maps?q=${market.latitude},${market.longitude}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mm-page">
      <header className="mm-header">
        <div className="mm-header-inner">
          <div>
            <p className="mm-kicker">MarketLink Admin</p>
            <h1>Manage Markets</h1>
          </div>

          <div className="mm-header-actions">
            <button className="mm-secondary-btn" onClick={() => navigate('/admindashboard')}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              Back to Admin Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mm-main">
        <section className="mm-panel mm-form-panel">
          <div className="mm-panel-header">
            <h2>{editingId ? 'Edit Market' : 'Add New Market'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="mm-form">
            <div className="mm-form-section">
              <div className="mm-form-section-heading">
                <span className="mm-step">01</span>
                <div>
                  <h3>Market identity</h3>
                  <p>Name this market and choose its map source.</p>
                </div>
              </div>

            <div className="mm-grid two-col">
              <label>
                <span>Market Name</span>
                <input
                  type="text"
                  name="market_name"
                  value={formData.market_name}
                  onChange={handleChange}
                  placeholder="Sunday Farmers Market"
                />
              </label>

              <label>
                <span>Map Provider</span>
                <select name="map_provider" value={formData.map_provider} onChange={handleChange}>
                  <option value="OpenStreetMap">OpenStreetMap</option>
                  <option value="Google Maps">Google Maps</option>
                </select>
              </label>
            </div>
            </div>

            <div className="mm-form-section">
              <div className="mm-form-section-heading">
                <span className="mm-step">02</span>
                <div>
                  <h3>Location details</h3>
                  <p>Set the pickup address and exact map coordinates.</p>
                </div>
              </div>

              <label>
                <span>Address</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Market Road, Clifton"
                />
              </label>

            <div className="mm-grid three-col">
              <label>
                <span>Latitude</span>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <input type="number" step="0.0001" name="latitude" value={formData.latitude} onChange={handleChange} />
                  <button type="button" className="mm-map-link-btn" onClick={() => { setPickerPosition({ lat: Number(formData.latitude || 31.5204), lng: Number(formData.longitude || 74.3587) }); setShowMapPicker(true); }}>
                    Pick on Map
                  </button>
                </div>
              </label>

              <label>
                <span>Longitude</span>
                <input type="number" step="0.0001" name="longitude" value={formData.longitude} onChange={handleChange} />
              </label>

              <label>
                <span>Map Link</span>
                <input
                  type="url"
                  name="map_link"
                  value={formData.map_link}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                />
              </label>
            </div>
            </div>

            <div className="mm-form-section">
              <div className="mm-form-section-heading">
                <span className="mm-step">03</span>
                <div>
                  <h3>Opening schedule</h3>
                  <p>Select the days and hours customers can visit.</p>
                </div>
              </div>

              <div className="mm-grid two-col">
                <label>
                  <span>Opening Time</span>
                  <input type="time" name="opening_time" value={formData.opening_time} onChange={handleChange} />
                </label>

                <label>
                  <span>Closing Time</span>
                  <input type="time" name="closing_time" value={formData.closing_time} onChange={handleChange} />
                </label>
              </div>

              <div className="mm-days-wrapper">
                <span className="mm-label">Operating Days</span>
                <div className="mm-days-grid">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`mm-day-btn ${formData.operating_days.includes(day) ? 'active' : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mm-form-section">
              <div className="mm-form-section-heading">
                <span className="mm-step">04</span>
                <div>
                  <h3>Market presentation</h3>
                  <p>Add an optional image for the market listing.</p>
                </div>
              </div>

              <label>
                <span>Image URL <em>Optional</em></span>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/market.jpg"
                />
              </label>
            </div>

            <div className="mm-actions-row mm-form-actions">
              <button type="submit" className="mm-primary-btn" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update Market' : 'Add Market'}
              </button>

              {editingId && (
                <button type="button" className="mm-cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mm-panel mm-list-panel">
          <div className="mm-panel-header">
            <h2>Market List</h2>
            <span className="mm-count-badge">{markets.length} markets</span>
          </div>

          {loading ? (
            <div className="mm-empty-state">Loading markets...</div>
          ) : markets.length === 0 ? (
            <div className="mm-empty-state">No markets available. Add one to get started.</div>
          ) : (
            <div className="mm-market-list">
              {markets.map((market) => (
                <article key={market._id} className="mm-market-card">
                  <div className="mm-card-image" style={{ backgroundImage: `url(${market.image_url || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=1200&auto=format&fit=crop'})` }} />

                  <div className="mm-card-body">
                    <div className="mm-card-head">
                      <h3>{market.market_name}</h3>
                      <button className="mm-map-link-btn" onClick={() => openMap(market)}>
                        View Map
                      </button>
                    </div>

                    <p><strong>Address:</strong> {market.address}</p>
                    <p><strong>Timing:</strong> {market.opening_time || '09:00'} - {market.closing_time || '18:00'}</p>
                    <p><strong>Days:</strong> {(market.operating_days || []).join(', ') || 'Not specified'}</p>
                    <p><strong>Coordinates:</strong> {market.latitude}, {market.longitude}</p>
                    <p><strong>Provider:</strong> {market.map_provider || 'OpenStreetMap'}</p>

                    <div className="mm-card-actions">
                      <button className="mm-primary-btn small" onClick={() => handleEdit(market)}>
                        Edit
                      </button>
                      <button className="mm-delete-btn small" onClick={() => handleDelete(market._id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      {showMapPicker && (
        <div className="mm-map-modal">
          <div className="mm-map-modal-backdrop" onClick={() => setShowMapPicker(false)} />
          <div className="mm-map-modal-content">
            <MapContainer whenCreated={(m) => (mapRef.current = m)} center={[pickerPosition.lat, pickerPosition.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClick setPos={(pos) => setPickerPosition(pos)} />
              <Marker position={[pickerPosition.lat, pickerPosition.lng]} />
            </MapContainer>

            <div className="mm-map-search">
              <input
                type="search"
                placeholder="Search place or address (english)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchPlaces(searchQuery);
                  }
                }}
              />
              <button className="mm-map-link-btn" onClick={() => searchPlaces(searchQuery)} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mm-map-search-results">
                {searchResults.map((r) => (
                  <button
                    key={r.place_id}
                    type="button"
                    className="mm-map-search-item"
                    onClick={() => {
                      const lat = parseFloat(r.lat);
                      const lon = parseFloat(r.lon);
                      setPickerPosition({ lat, lng: lon });
                      setSelectedPlaceName(r.display_name);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}

            <div style={{ marginTop: 8, color: '#ddd' }}>{selectedPlaceName ? `Selected: ${selectedPlaceName}` : ''}</div>

            <div className="mm-map-modal-actions">
              <button
                className="mm-primary-btn"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, latitude: String(pickerPosition.lat), longitude: String(pickerPosition.lng), map_link: `https://www.google.com/maps?q=${pickerPosition.lat},${pickerPosition.lng}`, address: selectedPlaceName || prev.address }));
                  setShowMapPicker(false);
                }}
              >
                Use this location
              </button>
              <button className="mm-cancel-btn" onClick={() => setShowMapPicker(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMarkets;
