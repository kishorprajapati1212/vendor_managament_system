import { createContext, useContext, useState, useEffect } from 'react';
import { getPOs } from '../services/poService';
const POContext = createContext();
export const POProvider = ({ children }) => {
  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const res = await getPOs();
      setPOs(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <POContext.Provider value={{ pos, setPOs, fetchPOs, loading, error }}>{children}</POContext.Provider>;
};
export const usePO = () => useContext(POContext);