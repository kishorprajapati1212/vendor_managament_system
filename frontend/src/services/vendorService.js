import api from './api';
export const getVendors = async () => {
  try { return await api.get('/api/vendors'); }
  catch (e) { return { data: [{ id: 1, name: "Acme Corp (Mock)", email: "contact@acme.com", status: "Active" }] }; }
};
export const addVendor = async (vendor) => {
  try { return await api.post('/api/vendors', vendor); }
  catch (e) { return { data: { id: Date.now(), ...vendor } }; }
};
export const updateVendor = async (id, vendor) => {
  try { return await api.put(`/api/vendors/${id}`, vendor); }
  catch (e) { return { data: { id, ...vendor } }; }
};
export const deleteVendor = async (id) => {
  try { return await api.delete(`/api/vendors/${id}`); }
  catch (e) { return { data: { success: true } }; }
};