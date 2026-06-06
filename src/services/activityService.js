import api from './api';
export const getLogs = async () => {
  try { return await api.get('/api/logs'); }
  catch (e) { return { data: [{ id: 1, user: "Admin", action: "Created RFQ", timestamp: new Date().toISOString() }] }; }
};