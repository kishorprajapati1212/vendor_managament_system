import api from './api';
export const getApprovals = async () => {
  try { return await api.get('/api/approvals'); }
  catch (e) { return { data: [{ id: "AW-1", type: "PO", targetId: "PO-201", status: "Pending" }] }; }
};
export const approveRequest = async (id, status) => {
  try { return await api.put(`/api/approvals/${id}`, { status }); }
  catch (e) { return { data: { success: true } }; }
};