import api from './api';

const questionService = {
  // Get all subjects
  getSubjects: async () => {
    const response = await api.get('/questions/subjects');
    return response.data;
  },

  // Get topics by subject
  getTopics: async (subject) => {
    const response = await api.get(`/questions/topics/${subject}`);
    return response.data;
  },

  // Get questions by filters
  getQuestions: async (filters) => {
    const response = await api.get('/questions', { params: filters });
    return response.data;
  },

  // Get single question
  getQuestion: async (id) => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  // Generate AI questions
  generateQuestions: async (params) => {
    const response = await api.post('/questions/generate', params);
    return response.data;
  },

  // Get prerequisites for a topic
  getPrerequisites: async (topic) => {
    const response = await api.get(`/questions/prerequisites/${topic}`);
    return response.data;
  },

  // Upload study material
  uploadMaterial: async (formData) => {
    const response = await api.post('/questions/upload-material', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default questionService;
