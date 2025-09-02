import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'Admin',
  password: 'zero'
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('jy_dashboard_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Check credentials against hardcoded admin
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const userData = {
        username: ADMIN_CREDENTIALS.username,
        role: 'admin',
        loginTime: new Date().toISOString()
      };
      
      setUser(userData);
      localStorage.setItem('jy_dashboard_user', JSON.stringify(userData));
      
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Invalid credentials. Please check your username and password.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jy_dashboard_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;