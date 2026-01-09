import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};

// User services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateConsent: async (consentSettings) => {
    const response = await api.put('/users/consent', consentSettings);
    return response.data;
  }
};

// Job services
export const jobService = {
  getMyJobs: async () => {
    const response = await api.get('/jobs/my-jobs');
    return response.data;
  },

  getAllJobs: async () => {
    const response = await api.get('/jobs');
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  completeJob: async (jobId) => {
    const response = await api.put(`/jobs/${jobId}/complete`);
    return response.data;
  }
};

// IoT services
export const iotService = {
  registerDevice: async (deviceData) => {
    const response = await api.post('/iot/register', deviceData);
    return response.data;
  },

  getMyDevices: async () => {
    const response = await api.get('/iot/my-devices');
    return response.data;
  },

  recordData: async (dataRecord) => {
    const response = await api.post('/iot/data', dataRecord);
    return response.data;
  },

  getDeviceData: async (deviceId) => {
    const response = await api.get(`/iot/data/${deviceId}`);
    return response.data;
  },

  getHeatmapData: async () => {
    const response = await api.get('/iot/heatmap/data');
    return response.data;
  }
};

export default api;
