import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const safeParse = <T,>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => safeParse<User>(localStorage.getItem('studytrack_user')));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('studytrack_token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.setItem('studytrack_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('studytrack_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('studytrack_token', token);
    } else {
      localStorage.removeItem('studytrack_token');
    }
  }, [token]);

  // Listen for global "unauthorized" events from the axios interceptor so we
  // can clear auth + navigate without a full page reload.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setToken(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth-unauthorized', onUnauthorized as EventListener);
    return () => window.removeEventListener('auth-unauthorized', onUnauthorized as EventListener);
  }, [navigate]);

  const login = useCallback(
    (userData: User, jwtToken: string) => {
      setUser(userData);
      setToken(jwtToken);
      navigate('/');
    },
    [navigate]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  return <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
