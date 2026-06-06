import api from './api';

export const getInvoices = async () => {
  const res = await api.get('/v1/invoices');
  return { data: res.data && res.data.data && res.data.data.invoices ? res.data.data.invoices : [] };
};

export const generateInvoice = async (inv) => {
  const res = await api.post('/v1/invoices', inv);
  return { data: res.data && res.data.data ? res.data.data : res.data };
};

export const getInvoiceById = async (id) => {
  const res = await api.get(`/v1/invoices/${id}`);
  return { data: res.data && res.data.data ? res.data.data : res.data };
};

export const downloadInvoicePdf = async (id) => {
  return await api.get(`/v1/invoices/${id}/download`, { responseType: 'blob' });
};

export const sendInvoiceEmail = async (id, payload) => {
  const res = await api.post(`/v1/invoices/${id}/send-email`, payload);
  return { data: res.data && res.data.data ? res.data.data : res.data };
};

export const markInvoiceAsPaid = async (id, payload) => {
  const res = await api.patch(`/v1/invoices/${id}/mark-paid`, payload);
  return { data: res.data && res.data.data ? res.data.data : res.data };
};