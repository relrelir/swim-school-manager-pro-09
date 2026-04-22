import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import SeasonPage from './pages/SeasonPage';
import ProductsPage from './pages/ProductsPage';
import ParticipantsPage from './pages/ParticipantsPage';
import ReportPage from './pages/ReportPage';
import DailyActivityPage from './pages/DailyActivityPage';
import LeadsPage from './pages/LeadsPage';
import HealthFormPage from './pages/HealthFormPage';
import FormSuccessPage from './pages/FormSuccessPage';
import LeadRegistrationPage from './pages/LeadRegistrationPage';
import AccessibilityStatementPage from './pages/AccessibilityStatementPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import PrintableHealthDeclarationPage from './pages/PrintableHealthDeclarationPage';
import PrintableRegistrationPage from './pages/PrintableRegistrationPage';
import TermsPdfTestPage from './pages/TermsPdfTestPage';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import PoolsPage from './pages/PoolsPage';

const ProtectedRoute = ({
  element,
  requiredRole,
}: {
  element: JSX.Element;
  requiredRole?: 'admin' | 'viewer';
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requiredRole === 'admin' && user?.role !== 'admin') return <Navigate to="/" replace />;
  return element;
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const AppRoutes = () => (
  <Routes>
    {/* Public routes – no auth required */}
    <Route path="/health-form/:token" element={<HealthFormPage />} />
    <Route path="/health-form" element={<HealthFormPage />} />
    <Route path="/form-success" element={<FormSuccessPage />} />
    <Route path="/print/health-declaration" element={<PrintableHealthDeclarationPage />} />
    <Route path="/print/registration" element={<ProtectedRoute element={<PrintableRegistrationPage />} />} />
    <Route path="/dev/terms-pdf-test" element={<TermsPdfTestPage />} />
    <Route path="/join" element={<LeadRegistrationPage />} />
    <Route path="/accessibility" element={<AccessibilityStatementPage />} />
    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

    {/* Protected routes inside layout */}
    <Route path="/" element={<Layout><Outlet /></Layout>}>
      <Route index element={<DashboardPage />} />
      <Route path="seasons" element={<SeasonPage />} />
      <Route path="season/:seasonId/pools" element={<PoolsPage />} />
      <Route path="season/:seasonId/pool/:poolId/products" element={<ProductsPage />} />
      <Route path="season/:seasonId/products" element={<ProductsPage />} />
      <Route path="product/:productId/participants" element={<ParticipantsPage />} />
      <Route path="daily-activity" element={<DailyActivityPage />} />
      <Route path="leads" element={<ProtectedRoute element={<LeadsPage />} />} />
      <Route path="report" element={<ProtectedRoute element={<ReportPage />} requiredRole="admin" />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="bottom-left" className="rtl" />
            <div className="min-h-screen flex flex-col bg-background font-inter antialiased">
              <AppRoutes />
            </div>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
