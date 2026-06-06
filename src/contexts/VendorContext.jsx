import { createContext, useContext, useState, useEffect } from 'react';
import { getVendors } from '../services/vendorService';
const VendorContext = createContext();
export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendors();
      setVendors(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <VendorContext.Provider value={{ vendors, setVendors, fetchVendors, loading, error }}>{children}</VendorContext.Provider>;
};
export const useVendor = () => useContext(VendorContext);