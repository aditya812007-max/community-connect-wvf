import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, role?: string) => Promise<boolean>;
  logout: () => void;
  switchRoleDemo: (role: 'admin' | 'volunteer' | 'student') => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage
    const savedUser = localStorage.getItem('wvf_user');
    const savedToken = localStorage.getItem('wvf_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    } else {
      switchRoleDemo('admin');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string = 'admin123') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data.user);
      setToken(data.access_token);
      localStorage.setItem('wvf_user', JSON.stringify(data.user));
      localStorage.setItem('wvf_token', data.access_token);
      return true;
    } catch (err) {
      console.error('Login error', err);
      return false;
    }
  };

  const switchRoleDemo = async (role: 'admin' | 'volunteer' | 'student') => {
    let email = 'admin@whitevolunteers.org';
    let pass = 'admin123';
    if (role === 'volunteer') {
      email = 'priya.sharma@whitevolunteers.org';
      pass = 'vol123';
    } else if (role === 'student') {
      email = 'aarav.kumar@student.local';
      pass = 'student123';
    }
    await login(email, pass);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wvf_user');
    localStorage.removeItem('wvf_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, switchRoleDemo, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
