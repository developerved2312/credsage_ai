import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@components/layouts/MainLayout';
import AuthLayout from '@components/layouts/AuthLayout';
import LoadingSpinner from '@components/ui/LoadingSpinner';

// Eagerly loaded (small, fast)
import LandingPage from '@pages/LandingPage';
import Login from '@pages/Login';
import SignUp from '@pages/SignUp';

// Lazy loaded (code-split protected pages)
const Dashboard = lazy(() => import('@pages/Dashboard'));
const CreditPage = lazy(() => import('@pages/CreditPage'));
const RiskProfilePage = lazy(() => import('@pages/RiskProfilePage'));
const RecommendationsPage = lazy(() => import('@pages/RecommendationsPage'));
const PortfolioPage = lazy(() => import('@pages/PortfolioPage'));
const ChatbotPage = lazy(() => import('@pages/ChatbotPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <LoadingSpinner size={24} />
  </div>
);

const App: React.FC = () => {
  return (
    <Routes>
      {/* Landing — public, always visible */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes — redirect to dashboard if logged in */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      {/* Protected routes — redirect to login if not authenticated */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/credit"
          element={
            <Suspense fallback={<PageLoader />}>
              <CreditPage />
            </Suspense>
          }
        />
        <Route
          path="/investment/risk-profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <RiskProfilePage />
            </Suspense>
          }
        />
        <Route
          path="/investment/recommendations"
          element={
            <Suspense fallback={<PageLoader />}>
              <RecommendationsPage />
            </Suspense>
          }
        />
        <Route
          path="/investment/portfolio"
          element={
            <Suspense fallback={<PageLoader />}>
              <PortfolioPage />
            </Suspense>
          }
        />
        <Route
          path="/chatbot"
          element={
            <Suspense fallback={<PageLoader />}>
              <ChatbotPage />
            </Suspense>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
