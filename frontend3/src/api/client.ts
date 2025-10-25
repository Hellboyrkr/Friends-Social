import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://friends-social-058q.onrender.com';

export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (!err.message && err?.response?.statusText) err.message = err.response.statusText;
    return Promise.reject(err);
  }
);
