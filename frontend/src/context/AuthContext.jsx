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
        setUser(savedUser);
        
        try {
          // 1. Wake up the backend (Render free tier) if needed
          try {
            await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/health`, { timeout: 10000 });
          } catch (pingError) {
            console.warn("Backend wake-up ping failed/timed out, proceeding to verify session.");
          }

          // 2. Verify with backend
          const responseBody = await authService.getMe();
          if (responseBody && responseBody.data) {
            setUser(responseBody.data);
          }
        } catch (error) {
          console.error("Session verification failed", error);
          if (error.response?.status === 401) {
            setUser(null);
            authService.logout(); // Clear localStorage
          }
        } finally {
          setLoading(false);
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
