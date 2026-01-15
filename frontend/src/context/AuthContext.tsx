import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authApi } from '../api';
import usersApi from '../api/users.api';
import { AuthResponseWrapper } from '../api/auth.api';

interface AuthContextType {
  user: any | null; // Will be updated when we have the full user object from verify OTP
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => void;
  isAuthenticated: boolean;
}

// src/context/AuthContext.tsx

// Double-wrapped response structure from backend
interface LoginResponse {
  data: {
    data: {
      access_token: string;
      role: string;
    };
    statusCode: number;
    message: string;
  };
  statusCode: number;
  message: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Fallback to minimal user object
        setUser({ role: null, email: null });
      }
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
  try {
    // Get the actual response from the API (double wrapper as shown in user's example)
    const response: any = await authApi.login({ email, password });

    // Extract token and role from the double-wrapped response
    const accessToken = response.data.data.access_token;
    const role = response.data.data.role;

    // Clear any old data before setting new data
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('role', role);

    // Create user object with available data
    const user = { email, role };
    
    localStorage.setItem('user', JSON.stringify(user));
    
    setAccessToken(accessToken);
    setUser(user);

    return { accessToken, role };
  } catch (error) {
    // Clear any partial data if login fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    throw error;
  }
};

  const register = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    try {
      await authApi.register({ email, password, firstName, lastName, phone });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authApi.logout();
    // Clear all authentication data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    setAccessToken(null);
  };
  
  const updateUser = (userData: any) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
    
    // Update localStorage as well
    const currentUserData = localStorage.getItem('user');
    if (currentUserData) {
      try {
        const parsedUser = JSON.parse(currentUserData);
        localStorage.setItem('user', JSON.stringify({
          ...parsedUser,
          ...userData
        }));
      } catch (error) {
        console.error('Error updating user in localStorage:', error);
      }
    }
  };

  const isAuthenticated = !!user && !!accessToken;

  const value = {
    user,
    accessToken,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};