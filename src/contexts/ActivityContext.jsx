import { createContext, useContext, useState, useEffect } from 'react';
import { getLogs } from '../services/activityService';
import { useAuth } from './AuthContext';

const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const [logs, setLogs] = useState([]);
  const { user } = useAuth();

  const fetchLogs = async () => {
    try {
      const res = await getLogs();
      setLogs(res.data);
    } catch (e) {
      // Silently ignore or handle error
    }
  };

  const addLog = (action) => {
    const newLog = {
      id: Date.now(),
      user: user?.name || user?.email || 'System',
      action,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return <ActivityContext.Provider value={{ logs, addLog, fetchLogs }}>{children}</ActivityContext.Provider>;
};
export const useActivity = () => useContext(ActivityContext);