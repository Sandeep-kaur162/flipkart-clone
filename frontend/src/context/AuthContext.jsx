import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fk_user')); } catch { return null; }
  });

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('fk_token', data.token);
    localStorage.setItem('fk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const signup = async (name, email, password, phone) => {
    const { data } = await api.post('/auth/signup', { name, email, password, phone });
    localStorage.setItem('fk_token', data.token);
    localStorage.setItem('fk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const loginWithOTP = async (email, otp, name, phone) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp, name, phone });
    localStorage.setItem('fk_token', data.token);
    localStorage.setItem('fk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fk_token');
    localStorage.removeItem('fk_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
