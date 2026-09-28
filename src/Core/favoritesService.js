import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/favorites';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===================================
// ADD FAVORITE FARMER
// ===================================
export const addFavoriteFarmer = async (farmerId) => {
  try {
    const response = await api.post('/add-farmer', { farmerId });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite farmer:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// ADD FAVORITE PRODUCT
// ===================================
export const addFavoriteProduct = async (productId) => {
  try {
    const response = await api.post('/add-product', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite product:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// ADD FAVORITE MARKET
// ===================================
export const addFavoriteMarket = async (marketId) => {
  try {
    const response = await api.post('/add-market', { marketId });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite market:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// REMOVE FAVORITE FARMER
// ===================================
export const removeFavoriteFarmer = async (farmerId) => {
  try {
    const response = await api.delete('/remove-farmer', {
      data: { farmerId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing favorite farmer:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// REMOVE FAVORITE PRODUCT
// ===================================
export const removeFavoriteProduct = async (productId) => {
  try {
    const response = await api.delete('/remove-product', {
      data: { productId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing favorite product:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// REMOVE FAVORITE MARKET
// ===================================
export const removeFavoriteMarket = async (marketId) => {
  try {
    const response = await api.delete('/remove-market', {
      data: { marketId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing favorite market:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// GET USER FAVORITES
// ===================================
export const getUserFavorites = async () => {
  try {
    const response = await api.get('/my-favorites');
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// CHECK IF FARMER IS FAVORITE
// ===================================
export const isFavoriteFarmer = async (farmerId) => {
  try {
    const response = await api.get(`/is-favorite-farmer/${farmerId}`);
    return response.data.isFavorite;
  } catch (error) {
    console.error('Error checking favorite farmer:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// CHECK IF PRODUCT IS FAVORITE
// ===================================
export const isFavoriteProduct = async (productId) => {
  try {
    const response = await api.get(`/is-favorite-product/${productId}`);
    return response.data.isFavorite;
  } catch (error) {
    console.error('Error checking favorite product:', error.response?.data || error.message);
    throw error;
  }
};

// ===================================
// CHECK IF MARKET IS FAVORITE
// ===================================
export const isFavoriteMarket = async (marketId) => {
  try {
    const response = await api.get(`/is-favorite-market/${marketId}`);
    return response.data.isFavorite;
  } catch (error) {
    console.error('Error checking favorite market:', error.response?.data || error.message);
    throw error;
  }
};
