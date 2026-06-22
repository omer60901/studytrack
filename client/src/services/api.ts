import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studytrack_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message || 'Network error';

    if (status === 401) {
      localStorage.removeItem('studytrack_token');
      localStorage.removeItem('studytrack_user');
      window.dispatchEvent(new CustomEvent('auth-unauthorized'));
    } else {
      window.dispatchEvent(new CustomEvent('api-error', { detail: { message, status } }));
    }

    return Promise.reject(error);
  }
);

export default api;
