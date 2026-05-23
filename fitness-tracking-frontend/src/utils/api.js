import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors.
//
// Auto-kick on 401 is ONLY for protected requests. The auth endpoints
// themselves use 401 as a normal business signal (wrong password,
// expired token on reset, etc.) — auto-redirecting would hide those
// errors AND hard-reload the page, eating the form state.
//
// We also skip the redirect when we're ALREADY on a public auth page
// (defence in depth: if a developer adds a new auth call later, it
// still won't pull the rug out from under the form).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.startsWith('/auth/');
      const onPublicAuthPage = /\/(login|register|forgot-password|reset-password)(\b|$)/.test(
        window.location.pathname
      );
      if (!isAuthEndpoint && !onPublicAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;