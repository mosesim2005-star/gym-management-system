import axios from 'axios';

const api = axios.create({
  baseURL: 'https://gym-management-system-yxmr.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gym_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gym_token');
      localStorage.removeItem('gym_token_expiry');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;