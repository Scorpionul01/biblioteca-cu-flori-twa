import api from './api';

const authService = {
  // Înregistrare utilizator
  register: async (username, email, password, confirmPassword) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        confirmPassword
      });
      
      if (response.data) {
        // Ne asigurăm că toate cheile sunt scrise corect, conform răspunsului din API
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la înregistrare';
    }
  },
  
  // Autentificare utilizator
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.userId,
          username: response.data.username,
          role: response.data.role
        }));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la autentificare';
    }
  },
  
  // Delogare utilizator
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  // Verificare dacă utilizatorul este autentificat
  isAuthenticated: () => {
    return localStorage.getItem('accessToken') !== null;
  },
  
  // Verificare dacă utilizatorul este admin
  isAdmin: () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'Admin';
  },
  
  // Obținere utilizator curent
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  
  // Reînnoire token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token', {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken')
      });
      
      if (response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message || 'Eroare la reînnoirea token-ului';
    }
  }
};

export default authService;