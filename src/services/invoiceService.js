import api from './api';
export const getInvoices = async () => {
  try { return await api.get('/api/invoices'); }
  catch (e) { return { data: [{ id: "INV-55", poId: "PO-201", subtotal: 5000, gst: 500, total: 5500, status: "Paid" }] }; }
};
export const generateInvoice = async (inv) => {
  try { return await api.post('/api/invoices', inv); }
  catch (e) { return { data: { id: "INV-" + Date.now(), ...inv } }; }
};