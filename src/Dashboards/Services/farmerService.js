import API from '../../Core/api';

// Profile Management
export const getFarmerProfileService = () => API.get('/farmer/profile');
export const updateFarmerProfileService = (data) => API.put('/farmer/profile', data);

// Market listing
export const getAvailableMarketsService = () => API.get('/markets');

// Stock & Products
export const getFarmerProductsService = () => API.get('/farmer/products');
export const addProductService = (data) => API.post('/farmer/add-product', data);
export const updateProductService = (id, data) => API.put(`/farmer/product/${id}`, data);
export const deleteProductService = (id) => API.delete(`/farmer/product/${id}`);
export const importProductsService = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/farmer/products/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Pre-Orders
export const getFarmerOrdersService = () => API.get('/farmer/orders');
export const updateOrderStatusService = (orderId, status) => API.put(`/farmer/order-status/${orderId}`, { status });

// Analytics & Insights
export const getFarmerAnalyticsService = () => API.get('/farmer/analytics');
export const getFarmerOrderHistoryService = () => API.get('/farmer/orders/history');

// Reviews & Responses
export const getFarmerReviewsService = () => API.get('/farmer/reviews');
export const respondToReviewService = (reviewId, response) => API.post(`/farmer/review-response/${reviewId}`, { farmer_response: response });

// Settings
export const updateFarmerPickupSettingsService = (data) => API.put('/farmer/pickup-settings', data);