import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const savedUser = authService.getCurrentUser();
      
      if (savedUser) {
        // Optimistically set from storage and stop loading immediately
        // to prevent ProtectedRoute from redirecting on reload.
        setUser(savedUser);
        setLoading(false);
        
        try {
          // Verify with backend in the background
          const responseBody = await authService.getMe();
          if (responseBody && responseBody.data) {
            setUser(responseBody.data);
          }
        } catch (error) {
          console.error("Session verification failed", error);
          setUser(null);
          // If we already set loading(false), we don't need to do it again,
          // but if verification fails, the user will be redirected then.
        }
      } else {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const responseBody = await authService.login(credentials);
      // Backend returns data inside a 'data' property
      if (responseBody && responseBody.data && responseBody.data.user) {
        setUser(responseBody.data.user);
      }
      return responseBody;
    } catch (error) {
      console.error("Auth Exception:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const responseBody = await authService.register(userData);
      // Backend returns data inside a 'data' property
      if (responseBody && responseBody.data && responseBody.data.user) {
        setUser(responseBody.data.user);
      }
      return responseBody;
    } catch (error) {
      console.error("Auth Exception:", error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (profileData, isOptimistic = false) => {
    if (!isOptimistic) setLoading(true);
    try {
      const responseBody = await authService.updateProfile(profileData);
      if (responseBody && responseBody.data) {
        setUser(responseBody.data);
      }
      return responseBody;
    } catch (error) {
      console.error("Update Profile Exception:", error.message);
      throw error;
    } finally {
      if (!isOptimistic) setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
