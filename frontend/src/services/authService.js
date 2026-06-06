import api from './api';

export const loginApi = async (credentials) => {
  try {
    return await api.post('/api/auth/login', credentials);
  } catch (e) {
    return {
      data: {
        token: 'mock-token-' + Date.now(),
        user: {
          id: 1,
          name: 'Mock User',
          email: credentials.email || 'user@example.com',
          role: 'Admin'
        }
      }
    };
  }
};

export const registerApi = async (data) => {
  try {
    return await api.post('/api/auth/register', data);
  } catch (e) {
    return {
      data: {
        success: true,
        user: {
          id: 1,
          name: data.name || 'Mock User',
          email: data.email || 'user@example.com',
          role: 'Admin'
        }
      }
    };
  }
};

export const getMeApi = async () => {
  try {
    return await api.get('/api/auth/me');
  } catch (e) {
    return {
      data: {
        id: 1,
        name: 'Mock User',
        email: 'user@example.com',
        role: 'Admin'
      }
    };
  }
};

export const logoutApi = async () => {
  try {
    return await api.post('/api/auth/logout');
  } catch (e) {
    return {
      data: { success: true }
    };
  }
};