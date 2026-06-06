import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { VendorProvider } from './contexts/VendorContext';
import { RFQProvider } from './contexts/RFQContext';
import { POProvider } from './contexts/POContext';
import { QuotationProvider } from './contexts/QuotationContext';
import { WorkflowProvider } from './contexts/WorkflowContext';
import { ActivityProvider } from './contexts/ActivityContext';

function App() {
  return (
    <AuthProvider>
      <ActivityProvider>
        <VendorProvider>
          <RFQProvider>
            <POProvider>
              <QuotationProvider>
                <WorkflowProvider>
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </WorkflowProvider>
              </QuotationProvider>
            </POProvider>
          </RFQProvider>
        </VendorProvider>
      </ActivityProvider>
    </AuthProvider>
  );
}

export default App;