import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://5000-firebase-odoo2026-1780400774592.cluster-zkm2jrwbnbd4awuedc2alqxrpk.cloudworkstations.dev',
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

let isBackendOffline = false;

const checkOffline = (error) => {
  const is404 = error.response && error.response.status === 404;
  const isCorsOrNetwork = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
  if (is404 || isCorsOrNetwork) {
    isBackendOffline = true;
  }
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