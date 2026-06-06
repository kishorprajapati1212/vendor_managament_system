import api from './api';

const mapToFrontend = (v) => ({
  id: v.id,
  name: v.company_name,
  email: v.email,
  category: v.category ? v.category.charAt(0).toUpperCase() + v.category.slice(1) : 'Construction',
  gstNumber: v.gst_number || '',
  contactNumber: v.phone || '',
  status: v.status ? v.status.charAt(0).toUpperCase() + v.status.slice(1) : 'Active'
});

const mapToBackend = (v) => ({
  company_name: v.name,
  email: v.email,
  category: v.category ? v.category.toLowerCase() : 'goods',
  gst_number: v.gstNumber,
  phone: v.contactNumber,
  contact_person: v.contactPerson || 'Contact Person',
  status: v.status ? v.status.toLowerCase() : 'active'
});

export const getVendors = async () => {
  const res = await api.get('/v1/vendors');
  const vendors = res.data && res.data.data && res.data.data.vendors ? res.data.data.vendors : [];
  return { data: vendors.map(mapToFrontend) };
};

export const addVendor = async (vendor) => {
  const res = await api.post('/v1/vendors', mapToBackend(vendor));
  const newVendor = res.data && res.data.data ? res.data.data : res.data;
  return { data: mapToFrontend(newVendor) };
};

export const updateVendor = async (id, vendor) => {
  const res = await api.put(`/v1/vendors/${id}`, mapToBackend(vendor));
  const updated = res.data && res.data.data ? res.data.data : res.data;
  return { data: mapToFrontend(updated) };
};

export const deleteVendor = async (id) => {
  return await api.delete(`/v1/vendors/${id}`);
};