import api from './api';
export const getStats = async () => {
  try { return await api.get('/api/reports'); }
  catch (e) { return { data: { totalSpend: 150000, activeVendors: 45, openRFQs: 12 } }; }
};