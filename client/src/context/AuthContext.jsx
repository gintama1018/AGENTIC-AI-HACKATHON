import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('returnshield_token');
      if (token) {
        try {
          const res = await api.getCurrentUser();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid, clearing token');
          localStorage.removeItem('returnshield_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('returnshield_token', res.token);
    setUser(res.user);
    return res;
  };

  const signup = async (userData) => {
    const res = await api.signup(userData);
    localStorage.setItem('returnshield_token', res.token);
    setUser(res.user);
    return res;
  };

  const loginAsDemo = async () => {
    const res = await api.login('', '');
    localStorage.setItem('returnshield_token', res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('returnshield_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
