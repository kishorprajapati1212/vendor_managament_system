import { Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VendorManagement from '../pages/VendorManagement';
import RFQManagement from '../pages/RFQManagement';
import VendorQuotations from '../pages/VendorQuotations';
import QuotationComparison from '../pages/QuotationComparison';
import ApprovalWorkflow from '../pages/ApprovalWorkflow';
import PurchaseOrders from '../pages/PurchaseOrders';
import InvoiceManagement from '../pages/InvoiceManagement';
import ActivityLogs from '../pages/ActivityLogs';
import Reports from '../pages/Reports';
import NotFound from '../pages/NotFound';

import Register from '../pages/Register';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="vendors" element={<VendorManagement />} />
          <Route path="rfqs" element={<RFQManagement />} />
          <Route path="quotations" element={<VendorQuotations />} />
          <Route path="comparison" element={<QuotationComparison />} />
          <Route path="workflow" element={<ApprovalWorkflow />} />
          <Route path="pos" element={<PurchaseOrders />} />
          <Route path="invoices" element={<InvoiceManagement />} />
          <Route path="logs" element={<ActivityLogs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}