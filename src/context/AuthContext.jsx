import { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers, mockSpecialists } from '../services/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sahtech_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      if (parsed.role === 'specialist') {
        const sp = mockSpecialists.find(s => s.id === parsed.specialistId);
        setSpecialist(sp || null);
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const found = mockUsers.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Identifiants incorrects' };
    const userData = { ...found, token: 'mock-jwt-token-' + Date.now() };
    delete userData.password;
    localStorage.setItem('sahtech_user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'specialist') {
      const sp = mockSpecialists.find(s => s.id === userData.specialistId);
      setSpecialist(sp || null);
    }
    return { success: true, role: userData.role };
  };

  const logout = () => {
    localStorage.removeItem('sahtech_user');
    setUser(null);
    setSpecialist(null);
  };

  const updateSpecialist = (data) => {
    setSpecialist(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, specialist, loading, login, logout, updateSpecialist }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
