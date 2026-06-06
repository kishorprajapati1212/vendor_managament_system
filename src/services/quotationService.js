import api from './api';
export const getQuotations = async () => {
  try { return await api.get('/api/quotations'); }
  catch (e) { return { data: [{ id: "Q-100", rfqId: "RFQ-001", vendorId: 1, amount: 5000, status: "Submitted" }] }; }
};
export const submitQuotation = async (q) => {
  try { return await api.post('/api/quotations', q); }
  catch (e) { return { data: { id: "Q-" + Date.now(), ...q } }; }
};