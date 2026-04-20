import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically log out if backend rejects the token or user is not found (wiped DB)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || (error.response.status === 404 && error.config.url.includes('/api/user/profile'))) {
        localStorage.removeItem('token');
        window.location.href = '/signup';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to build full backend URLs (for download links, images, etc.)
export const getBackendUrl = (path) => {
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}${path}`;
};
