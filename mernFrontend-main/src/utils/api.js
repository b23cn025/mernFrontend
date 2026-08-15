import axios from 'axios';

const api = axios.create({
  baseURL: 'https://mernbackend-g2q9.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

// Add token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fp_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
