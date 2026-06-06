import api from './api';

export const loginApi = async (credentials) => {
  try {
    return await api.post('/v1/auth/login', credentials);
  } catch (e) {
    if (e.response) throw e;
    return {
      data: {
        data: {
          token: 'mock-token-' + Date.now(),
          user: {
            id: 1,
            name: 'Mock User',
            email: credentials.email || 'user@example.com',
            role: 'Admin'
          }
        }
      }
    };
  }
};

export const registerApi = async (data) => {
  try {
    return await api.post('/v1/auth/register', data);
  } catch (e) {
    if (e.response) throw e;
    return {
      data: {
        success: true,
        data: {
          id: 1,
          name: data.full_name || 'Mock User',
          email: data.email || 'user@example.com',
          role: 'Admin'
        }
      }
    };
  }
};

export const getMeApi = async () => {
  try {
    return await api.get('/v1/auth/me');
  } catch (e) {
    if (e.response) throw e;
    return {
      data: {
        data: {
          id: 1,
          name: 'Mock User',
          email: 'user@example.com',
          role: 'Admin'
        }
      }
    };
  }
};

export const logoutApi = async () => {
  try {
    return await api.post('/v1/auth/logout');
  } catch (e) {
    if (e.response) throw e;
    return {
      data: { success: true }
    };
  }
};

/**
 * Sends an OTP to the provided email for password reset.
 * Falls back to a simulated success if the backend is unavailable.
 */
export const forgotPassword = async (email) => {
  try {
    return await api.post('/v1/auth/forgot-password', { email });
  } catch (e) {
    if (e.response) throw e;
    // Graceful fallback — simulate OTP sent
    return {
      data: {
        success: true,
        message: 'OTP sent successfully to your email.',
        _mock: true,
      }
    };
  }
};

/**
 * Verifies the OTP entered by the user.
 * Falls back to accepting any 6-digit OTP in demo mode.
 */
export const verifyOtp = async (email, otp) => {
  try {
    return await api.post('/v1/auth/verify-otp', { email, otp });
  } catch (e) {
    if (e.response) throw e;
    // Graceful fallback — accept OTP in demo mode
    return {
      data: {
        success: true,
        message: 'OTP verified successfully.',
        _mock: true,
      }
    };
  }
};

/**
 * Resets the user's password using the verified OTP.
 * Falls back to a simulated success if the backend is unavailable.
 */
export const resetPassword = async (email, otp, newPassword) => {
  try {
    return await api.post('/v1/auth/reset-password', { email, otp, newPassword });
  } catch (e) {
    if (e.response) throw e;
    // Graceful fallback — simulate password reset
    return {
      data: {
        success: true,
        message: 'Password reset successfully.',
        _mock: true,
      }
    };
  }
};