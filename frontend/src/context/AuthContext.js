import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [codeVerified, setCodeVerified] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('larrypixels_user');
    const savedCode = localStorage.getItem('larrypixels_code_verified');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedCode) setCodeVerified(true);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('larrypixels_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setCodeVerified(false);
    localStorage.removeItem('larrypixels_user');
    localStorage.removeItem('larrypixels_code_verified');
  };

  const verifyCode = () => {
    setCodeVerified(true);
    localStorage.setItem('larrypixels_code_verified', 'true');
  };

  return (
    <AuthContext.Provider value={{ user, codeVerified, login, logout, verifyCode }}>
      {children}
    </AuthContext.Provider>
  );
};