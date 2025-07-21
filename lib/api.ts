import axios, { AxiosError, AxiosInstance } from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage or cookies
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Clear token and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_id');
          // Redirect to home page
          window.location.href = '/';
        }
      }
      
      // Extract error message
      const data = error.response.data as any;
      const message = data?.detail || data?.message || 'Произошла ошибка';
      
      // Create new error with message
      const customError = new Error(message);
      (customError as any).status = error.response.status;
      (customError as any).data = data;
      
      return Promise.reject(customError);
    }
    
    // Network error
    if (!error.response) {
      const networkError = new Error('Ошибка сети. Проверьте подключение к интернету.');
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  requestCode: async (phone: string) => {
    const response = await api.post('/api/v1/auth/request', { phone });
    return response.data;
  },
  
  verifyCode: async (phone: string, code: string) => {
    const response = await api.post('/api/v1/auth/verify', { phone, code });
    return response.data;
  },
  
  logout: async (token: string) => {
    const response = await api.post('/api/v1/auth/logout', { token });
    return response.data;
  },
  
  checkPhone: async (phone: string) => {
    const response = await api.get('/api/v1/auth/check-phone', { params: { phone } });
    return response.data;
  },
};

// Applications API
export const applicationsApi = {
  create: async (data: any) => {
    const response = await api.post('/api/v1/applications', data);
    return response.data;
  },
  
  getCurrent: async () => {
    const response = await api.get('/api/v1/applications/current');
    return response.data;
  },
  
  send: async (id: string) => {
    const response = await api.put(`/api/v1/applications/${id}/send`);
    return response.data;
  },
  
  getHistory: async () => {
    const response = await api.get('/api/v1/applications/history');
    return response.data;
  },
};

// Offers API
export const offersApi = {
  getPreliminary: async (applicationId: string) => {
    const response = await api.get('/api/v1/offers/preliminary', { 
      params: { application_id: applicationId } 
    });
    return response.data;
  },
  
  getFinal: async (applicationId: string) => {
    const response = await api.get('/api/v1/offers/final', { 
      params: { application_id: applicationId } 
    });
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/offers/${id}`);
    return response.data;
  },
};

// Personal Data API
export const personalDataApi = {
  create: async (data: any) => {
    const response = await api.post('/api/v1/personal-data', data);
    return response.data;
  },
  
  get: async () => {
    const response = await api.get('/api/v1/personal-data');
    return response.data;
  },
  
  update: async (data: any) => {
    const response = await api.put('/api/v1/personal-data', data);
    return response.data;
  },
  
  getScoring: async () => {
    const response = await api.get('/api/v1/personal-data/scoring');
    return response.data;
  },
};

// Referrals API
export const referralsApi = {
  getMyCode: async () => {
    const response = await api.get('/api/v1/referrals/my-code');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/api/v1/referrals/stats');
    return response.data;
  },
  
  getLink: async () => {
    const response = await api.get('/api/v1/referrals/link');
    return response.data;
  },
};

export default api;