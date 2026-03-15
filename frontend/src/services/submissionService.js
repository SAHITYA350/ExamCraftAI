import api from './api';

const submissionService = {
  // Submit answer (text)
  submitAnswer: async (data) => {
    const response = await api.post('/submissions', data);
    return response.data;
  },

  // Upload answer (file — image/PDF)
  uploadAnswer: async (formData) => {
    const response = await api.post('/submissions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get submission result
  getResult: async (submissionId) => {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data;
  },

  // Get all submissions for user
  getMySubmissions: async (params) => {
    const response = await api.get('/submissions/my', { params });
    return response.data;
  },

  // Get analytics / performance data
  getAnalytics: async () => {
    const response = await api.get('/submissions/analytics');
    return response.data;
  },

  // Get risk prediction
  getRiskPrediction: async () => {
    const response = await api.get('/submissions/risk-prediction');
    return response.data;
  },

  // Get weak topics
  getWeakTopics: async () => {
    const response = await api.get('/submissions/weak-topics');
    return response.data;
  },

  // Get recommendations
  getRecommendations: async () => {
    const response = await api.get('/submissions/recommendations');
    return response.data;
  },
};

export default submissionService;
