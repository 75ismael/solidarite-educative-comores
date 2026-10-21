import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }
      }
    }

    // Détection automatique du mode maintenance (HTTP 503)
    if (error.response?.status === 503) {
      if (window.location.pathname !== '/maintenance') {
        window.location.href = '/maintenance';
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export const extractResults = <T>(data: any): T[] => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
};

export const formatApiError = (err: any, fallbackMessage: string): string => {
  const data = err?.response?.data;
  if (!data) return fallbackMessage;

  if (typeof data === 'string') return data;
  if (data.detail && typeof data.detail === 'string') return data.detail;

  if (typeof data === 'object') {
    const messages: string[] = [];
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        const fieldName =
          key === 'email' ? 'Adresse e-mail' :
          key === 'password' ? 'Mot de passe' :
          key === 'first_name' ? 'Prénom' :
          key === 'last_name' ? 'Nom' :
          key === 'non_field_errors' ? 'Erreur' : key;
        messages.push(`${fieldName} : ${val.join(' ')}`);
      } else if (typeof val === 'string') {
        messages.push(val);
      }
    }
    if (messages.length > 0) {
      return messages.join(' — ');
    }
  }

  return fallbackMessage;
};

