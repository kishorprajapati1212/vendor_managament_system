import { createContext, useState, useContext, useEffect } from 'react';
import { loginApi, getMeApi, logoutApi } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getMeApi();
          setUser(res.data.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    const { token, user: userData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Silently ignore logout backend error
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);