// src/Services/marketService.jsx
import API from '../../../Core/api'; // Yahan path check kar lena ki api.jsx kahan hai

export const fetchMarketsAPI = async (location, day) => {
  try {
    const params = new URLSearchParams();
    
    // Agar location ya day filter frontend se aa raha hai toh usko query mein add karo
    if (location) params.append('location', location);
    if (day) params.append('day', day);

    // API instance ke through GET request bhej rahe hain
    const response = await API.get(`/markets?${params.toString()}`);
    
    return response.data; 
  } catch (error) {
    console.error("API Service Error (fetchMarketsAPI):", error);
    // Error aane par frontend ko crash hone se bachane ke liye empty data return kar rahe hain
    return { success: false, data: [] }; 
  }
};