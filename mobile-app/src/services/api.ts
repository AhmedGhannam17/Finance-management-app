import axios, { AxiosInstance, AxiosError } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * API Configuration
 * 
 * For physical device development, update LOCAL_IP below.
 */
const getBaseUrl = () => {
  if (!__DEV__) return 'https://your-production-api.com/api';
  
  // UPDATE THIS IP for physical device testing
  // On Windows, run 'ipconfig'. Use the IPv4 Address here.
  const LOCAL_IP = '192.168.0.157';

  // IMPORTANT: For physical devices, we MUST use the computer's IP.
  // 10.0.2.2 (Android) and localhost (iOS) only work in simulators.
  return `http://${LOCAL_IP}:3000/api`;
};

const API_BASE_URL = getBaseUrl();
console.log(`[API] Initializing with Base URL: ${API_BASE_URL}`);

/**
 * Create axios instance
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - add auth token
 */
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handle errors
 */
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] Success: ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    console.error(`[API Error] Details:`, {
      url: error.config?.url,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Only clear auth on actual 401 from server
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_profile');
    }
    return Promise.reject(error);
  }
);

/**
 * API Service Methods
 */
export const apiService = {
  // Auth (Simple username/password)
  auth: {
    signUp: (username: string, password: string, name?: string) =>
      api.post('/auth/signup', { username, password, name }),
    signIn: (username: string, password: string) =>
      api.post('/auth/signin', { username, password }),
    signOut: () => api.post('/auth/signout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data: { name?: string; username?: string }) => api.put('/profiles/me', data),
  },

  // Accounts
  accounts: {
    getAll: () => api.get('/accounts'),
    getOne: (id: string) => api.get(`/accounts/${id}`),
    create: (data: { 
      name: string; 
      type: 'cash' | 'bank'; 
      initialBalance: number;
      currency?: string;
    }) => api.post('/accounts', data),
    update: (id: string, data: { 
      name?: string; 
      type?: 'cash' | 'bank';
      initialBalance?: number;
      currency?: string;
    }) => api.put(`/accounts/${id}`, data),
    delete: (id: string) => api.delete(`/accounts/${id}`),
  },

  // Categories
  categories: {
    getAll: (type?: 'expense' | 'income') =>
      api.get('/categories', { params: { type } }),
    getOne: (id: string) => api.get(`/categories/${id}`),
    create: (data: { name: string; type: 'expense' | 'income' }) =>
      api.post('/categories', data),
    update: (id: string, data: { name: string; type: 'expense' | 'income' }) =>
      api.put(`/categories/${id}`, data),
    delete: (id: string) => api.delete(`/categories/${id}`),
  },

  // Transactions
  transactions: {
    getAll: (filters?: {
      startDate?: string;
      endDate?: string;
      categoryId?: string;
    }) => api.get('/transactions', { params: filters }),
    getOne: (id: string) => api.get(`/transactions/${id}`),
    create: (data: {
      type: 'income' | 'expense' | 'transfer';
      fromAccountId?: string;
      toAccountId?: string;
      categoryId: string;
      amount: number;
      note?: string;
      date?: string;
    }) => api.post('/transactions', data),
    update: (
      id: string,
      data: {
        type?: 'income' | 'expense' | 'transfer';
        fromAccountId?: string;
        toAccountId?: string;
        categoryId?: string;
        amount?: number;
        note?: string;
        date?: string;
      }
    ) => api.put(`/transactions/${id}`, data),
    delete: (id: string) => api.delete(`/transactions/${id}`),
  },

  // Zakat
  zakat: {
    calculate: (data: any) => api.post('/zakat/calculate', data),
    getHistory: () => api.get('/zakat/history'),
    getNetWorth: () => api.get('/zakat/net-worth'),
  },
};

export default api;
