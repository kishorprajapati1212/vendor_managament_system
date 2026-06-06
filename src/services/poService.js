import api from './api';
export const getPOs = async () => {
  try { return await api.get('/api/pos'); }
  catch (e) { return { data: [{ id: "PO-201", vendorId: 1, total: 5000, status: "Approved" }] }; }
};
export const generatePO = async (po) => {
  try { return await api.post('/api/pos', po); }
  catch (e) { return { data: { id: "PO-" + Date.now(), ...po } }; }
};