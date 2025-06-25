import axios from 'axios';

// 🎯 CONFIGURAȚIA DEMO FINALĂ - Folosește localhost pentru backend
const API_URL = 'http://localhost:5002/api';

console.log('🌐 API Service URL Config:', {
    API_URL,
    note: 'Demo mode - Backend pe localhost:5002'
});

// Creează instanța axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Adaugă interceptor pentru token-uri
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Adaugă interceptor pentru reînnoirea token-ului
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Dacă eroarea este 401 (Unauthorized) și nu este deja o încercare de refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Încearcă să reînnoiești token-ul
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // Nu avem refresh token, trebuie să ne autentificăm din nou
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: refreshToken
        });

        // Salvează noile token-uri
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        // Refă cererea originală cu noul token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Dacă reînnoirea token-ului eșuează, șterge token-urile și redirecționează la login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;