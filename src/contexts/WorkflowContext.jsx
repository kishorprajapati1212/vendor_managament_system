import { createContext, useContext, useState, useEffect } from 'react';
import { getApprovals } from '../services/workflowService';
const WorkflowContext = createContext();
export const WorkflowProvider = ({ children }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await getApprovals();
      setApprovals(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <WorkflowContext.Provider value={{ approvals, setApprovals, fetchApprovals, loading, error }}>{children}</WorkflowContext.Provider>;
};
export const useWorkflow = () => useContext(WorkflowContext);