import api from './api';

export const queryService = {
  // Get queries with filters
  async getQueries(params = {}) {
    const response = await api.get('/api/mobile/queries', { params });
    return response.data;
  },

  // Get query counts
  async getQueryCounts() {
    const response = await api.get('/api/mobile/queries/counts');
    return response.data;
  },

  // Get single query with details
  async getQuery(queryId) {
    const response = await api.get(`/api/mobile/queries/${queryId}`);
    return response.data;
  },

  // Get messages for a query
  async getMessages(queryId) {
    const response = await api.get(`/api/mobile/queries/${queryId}/messages`);
    return response.data;
  },

  // Send a message
  async sendMessage(queryId, data) {
    const response = await api.post(`/api/mobile/queries/${queryId}/messages`, data);
    return response.data;
  },

  // Upload document
  async uploadDocument(queryId, formData) {
    const response = await api.post(`/api/mobile/queries/${queryId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Close query
  async closeQuery(queryId, data) {
    const response = await api.post(`/api/mobile/queries/${queryId}/close`, data);
    return response.data;
  },

  // Update query status
  async updateQueryStatus(queryId, status) {
    const response = await api.patch(`/api/mobile/queries/${queryId}/status`, { status });
    return response.data;
  },

  // Add participant
  async addParticipant(queryId, userId, role) {
    const response = await api.post(`/api/mobile/queries/${queryId}/participants`, {
      user_id: userId,
      role,
    });
    return response.data;
  },

  // Search users
  async searchUsers(query) {
    const response = await api.get('/api/mobile/users/search', { params: { q: query } });
    return response.data;
  },
};
