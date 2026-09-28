import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Apne backend port ke mutabiq change karein
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Attach Token if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;