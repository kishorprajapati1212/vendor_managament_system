import { createContext, useContext, useState, useEffect } from 'react';
import { getRFQs } from '../services/rfqService';
const RFQContext = createContext();
export const RFQProvider = ({ children }) => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const res = await getRFQs();
      setRfqs(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <RFQContext.Provider value={{ rfqs, setRfqs, fetchRFQs, loading, error }}>{children}</RFQContext.Provider>;
};
export const useRFQ = () => useContext(RFQContext);