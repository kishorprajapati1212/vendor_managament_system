import { createContext, useContext, useState, useEffect } from 'react';
import { getQuotations } from '../services/quotationService';
const QuotationContext = createContext();
export const QuotationProvider = ({ children }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await getQuotations();
      setQuotations(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <QuotationContext.Provider value={{ quotations, setQuotations, fetchQuotations, loading, error }}>{children}</QuotationContext.Provider>;
};
export const useQuotation = () => useContext(QuotationContext);