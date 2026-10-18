import axios from 'axios';

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api';
const trimmedBaseURL = configuredBaseURL.replace(/\/+$/, '');
const API_BASE_URL = /\/api$/i.test(trimmedBaseURL)
  ? trimmedBaseURL
  : `${trimmedBaseURL}/api`;

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
