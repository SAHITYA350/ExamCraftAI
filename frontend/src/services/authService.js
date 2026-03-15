import api from './api';

const AUTH_TOKEN_KEY = 'examcraft_token';
const AUTH_USER_KEY = 'examcraft_user';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/register', userData);
    const { data } = response.data;
    if (data && data.accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    const { data } = response.data;
    if (data && data.accessToken) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Check if logged in
  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.patch('/update-account', profileData);
    const { data } = response.data;
    if (data) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data));
    }
    return response.data;
  },

};

export default authService;
