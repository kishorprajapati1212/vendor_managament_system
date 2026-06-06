import api from './api';

export const getRFQs = async () => {
  const res = await api.get('/v1/rfqs');
  return { data: res.data && res.data.data && res.data.data.rfqs ? res.data.data.rfqs : [] };
};

export const createRFQ = async (rfq) => {
  const res = await api.post('/v1/rfqs', rfq);
  return { data: res.data && res.data.data ? res.data.data : res.data };
};

export const getRFQById = async (id) => {
  const res = await api.get(`/v1/rfqs/${id}`);
  return { data: res.data && res.data.data ? res.data.data : res.data };
};

export const updateRFQ = async (id, rfq) => {
  const res = await api.put(`/v1/rfqs/${id}`, rfq);
  return { data: res.data && res.data.data ? res.data.data : res.data };
};

export const publishRFQ = async (id) => {
  const res = await api.patch(`/v1/rfqs/${id}/publish`);
  return { data: res.data && res.data.data ? res.data.data : res.data };
};