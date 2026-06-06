import api from './api';
export const getRFQs = async () => {
  try { return await api.get('/api/rfqs'); }
  catch (e) { return { data: [{ id: "RFQ-001 (Mock)", item: "Laptops", status: "Open", deadline: "2026-10-10" }] }; }
};
export const createRFQ = async (rfq) => {
  try { return await api.post('/api/rfqs', rfq); }
  catch (e) { return { data: { id: "RFQ-" + Date.now(), ...rfq } }; }
};
export const getRFQById = async (id) => {
  try { return await api.get(`/api/rfqs/${id}`); }
  catch (e) { return { data: { id, item: "Mock Item", status: "Open" } }; }
};
export const updateRFQ = async (id, rfq) => {
  try { return await api.put(`/api/rfqs/${id}`, rfq); }
  catch (e) { return { data: { id, ...rfq } }; }
};