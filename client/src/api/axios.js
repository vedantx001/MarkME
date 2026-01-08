import axios from 'axios';

// Uses Vite env var; expected to include `/api` (e.g. https://your-backend.onrender.com/api)
const baseURL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

if (!baseURL) {
  throw new Error('Missing required environment variable: VITE_API_BASE_URL');
}

// Global axios instance that always sends cookies (cross-site)
export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Optional: normalize error messages
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Keep existing behavior for callers; just rethrow
    return Promise.reject(err);
  }
);
