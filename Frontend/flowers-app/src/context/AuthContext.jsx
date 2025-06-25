import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verifică dacă există un utilizator autentificat la încărcarea paginii
    const initAuth = () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Eroare la inițializarea autentificării:', err);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      
      setUser({
        id: response.userId,
        username: response.username,
        role: response.role
      });
      
      return true;
    } catch (err) {
      setError(err.toString());
      return false;
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    try {
      setError(null);
      const response = await authService.register(username, email, password, confirmPassword);
      
      setUser({
        id: response.userId,
        username: response.username,
        role: response.role
      });
      
      return true;
    } catch (err) {
      setError(err.toString());
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => {
    return user && user.role === 'Admin';
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        register, 
        logout,
        isAdmin
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;