import axios, { AxiosError, AxiosInstance } from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
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

// API namespace with all endpoints
export const api = {
  // Auth endpoints
  auth: {
    request: async (data: { phone_number: string }) => {
      const response = await apiClient.post('/api/v1/auth/request', data);
      return response.data;
    },
    
    verify: async (data: { phone_number: string; code: string }) => {
      const response = await apiClient.post('/api/v1/auth/verify', data);
      return response.data;
    },
    
    logout: async () => {
      const response = await apiClient.post('/api/v1/auth/logout');
      return response.data;
    },
    
    checkPhone: async (phone: string) => {
      const response = await apiClient.get('/api/v1/auth/check-phone', { params: { phone } });
      return response.data;
    },
    
    getMe: async () => {
      const response = await apiClient.get('/api/v1/auth/me');
      return response.data;
    },
  },

  // Applications endpoints
  applications: {
    create: async (data: { amount: number; term: number; purpose?: string }) => {
      const response = await apiClient.post('/api/v1/applications', data);
      return response.data;
    },
    
    get: async (id: string) => {
      const response = await apiClient.get(`/api/v1/applications/${id}`);
      return response.data;
    },
    
    list: async () => {
      const response = await apiClient.get('/api/v1/applications');
      return response.data;
    },
    
    preCheck: async (data: {
      amount: number;
      term: number;
      monthly_income: number;
      monthly_expenses: number;
      existing_payments: number;
    }) => {
      const response = await apiClient.post('/api/v1/applications/pre-check', data);
      return response.data;
    },
    
    getScoring: async (id: string) => {
      const response = await apiClient.get(`/api/v1/applications/${id}/scoring`);
      return response.data;
    },
    
    getOffers: async (id: string) => {
      const response = await apiClient.get(`/api/v1/applications/${id}/offers`);
      return response.data;
    },
    
    downloadReport: async (id: string) => {
      const response = await apiClient.get(`/api/v1/applications/${id}/report`, {
        responseType: 'blob',
      });
      return response.data;
    },
  },

  // Bank offers endpoints
  offers: {
    list: async (params?: {
      min_amount?: number;
      max_amount?: number;
      term?: number;
      is_active?: boolean;
    }) => {
      const response = await apiClient.get('/api/v1/offers', { params });
      return response.data;
    },
    
    get: async (id: string) => {
      const response = await apiClient.get(`/api/v1/offers/${id}`);
      return response.data;
    },
    
    featured: async () => {
      const response = await apiClient.get('/api/v1/offers/featured');
      return response.data;
    },
    
    compare: async (ids: string[]) => {
      const response = await apiClient.post('/api/v1/offers/compare', { offer_ids: ids });
      return response.data;
    },
    
    calculate: async (id: string, data: { amount: number; term: number }) => {
      const response = await apiClient.post(`/api/v1/offers/${id}/calculate`, data);
      return response.data;
    },
  },

  // Personal data endpoints
  personalData: {
    get: async () => {
      const response = await apiClient.get('/api/v1/personal-data');
      return response.data;
    },
    
    createOrUpdate: async (data: any) => {
      const response = await apiClient.post('/api/v1/personal-data', data);
      return response.data;
    },
    
    validate: async (data: any) => {
      const response = await apiClient.post('/api/v1/personal-data/validate', data);
      return response.data;
    },
    
    checkCompleteness: async () => {
      const response = await apiClient.get('/api/v1/personal-data/completeness');
      return response.data;
    },
    
    export: async () => {
      const response = await apiClient.get('/api/v1/personal-data/export');
      return response.data;
    },
  },

  // Referrals endpoints
  referrals: {
    getCode: async () => {
      const response = await apiClient.get('/api/v1/referrals/code');
      return response.data;
    },
    
    getStats: async () => {
      const response = await apiClient.get('/api/v1/referrals/stats');
      return response.data;
    },
    
    getTree: async (depth: number = 3) => {
      const response = await apiClient.get('/api/v1/referrals/tree', {
        params: { depth },
      });
      return response.data;
    },
    
    getTop: async (limit: number = 10) => {
      const response = await apiClient.get('/api/v1/referrals/top', {
        params: { limit },
      });
      return response.data;
    },
    
    getPromo: async () => {
      const response = await apiClient.get('/api/v1/referrals/promo');
      return response.data;
    },
  },

  // Calculator endpoints (public)
  calculator: {
    loan: async (data: { amount: number; term: number; rate: number }) => {
      const response = await apiClient.post('/api/v1/applications/calculate', data);
      return response.data;
    },
    
    pdn: async (data: {
      monthly_income: number;
      monthly_expenses: number;
      loan_amount: number;
      loan_term: number;
      annual_rate: number;
      existing_payments?: number;
    }) => {
      const response = await apiClient.post('/api/v1/applications/calculate-pdn', data);
      return response.data;
    },
  },
};

export default apiClient;