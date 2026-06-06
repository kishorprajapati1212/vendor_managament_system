import axios from 'axios';

const BASE_URL = 'https://vendor-managament-system.onrender.com';

const instance = axios.create({
  baseURL: BASE_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Only mark backend offline on true network/CORS failures, NOT on HTTP error codes.
// HTTP 4xx/5xx means the server IS reachable; offline means we can't reach it at all.
let isBackendOffline = false;

const checkOffline = (error) => {
  const isCorsOrNetwork =
    !error.response ||
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    error.code === 'ECONNABORTED';
  if (isCorsOrNetwork) {
    isBackendOffline = true;
  }
};

export const resetOfflineFlag = () => {
  isBackendOffline = false;
};

const api = {
  get: async (url, config) => {
    if (isBackendOffline) {
      throw new Error('Backend is offline (silent)');
    }
    try {
      return await instance.get(url, config);
    } catch (error) {
      checkOffline(error);
      throw error;
    }
  },
  post: async (url, data, config) => {
    if (isBackendOffline) {
      throw new Error('Backend is offline (silent)');
    }
    try {
      return await instance.post(url, data, config);
    } catch (error) {
      checkOffline(error);
      throw error;
    }
  },
  put: async (url, data, config) => {
    if (isBackendOffline) {
      throw new Error('Backend is offline (silent)');
    }
    try {
      return await instance.put(url, data, config);
    } catch (error) {
      checkOffline(error);
      throw error;
    }
  },
  delete: async (url, config) => {
    if (isBackendOffline) {
      throw new Error('Backend is offline (silent)');
    }
    try {
      return await instance.delete(url, config);
    } catch (error) {
      checkOffline(error);
      throw error;
    }
  },
};

export default api;