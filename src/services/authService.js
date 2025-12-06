import api from './api';

export const authService = {
  // Login
  async login(email, password) {
    // Direct login with Sanctum token-based auth (no CSRF cookie needed)
    const response = await api.post('/api/mobile/auth/login', { email, password });
    return response.data;
  },

  // Logout
  async logout() {
    const response = await api.post('/api/mobile/auth/logout');
    return response.data;
  },

  // Get current user
  async getUser() {
    const response = await api.get('/api/mobile/auth/user');
    return response.data;
  },
};
