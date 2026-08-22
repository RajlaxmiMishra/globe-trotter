import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } });

apiClient.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

apiClient.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE}/api/v1/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem('access_token', data.access_token);
          orig.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(orig);
        } catch (_) {}
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);
