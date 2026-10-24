import { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuthToken,
  setAuthToken,
  getStoredUser,
  setStoredUser,
  clearAuth,
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetMe
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await apiGetMe();
          setUser(userData);
          setStoredUser(userData);
        } catch {
          clearAuth();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth-expired', handleExpired);
    return () => window.removeEventListener('auth-expired', handleExpired);
  }, []);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    setAuthToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData) => {
    const res = await apiRegister(userData);
    setAuthToken(res.token);
    setStoredUser(res.user);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await apiLogout();
    clearAuth();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
