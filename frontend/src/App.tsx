import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './lib/auth.client';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layouts/MainLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';

import AuthLayout from './components/layouts/AuthLayout';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import CreditPage from './pages/CreditPage';
import PortfolioPage from './pages/PortfolioPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ChatbotPage from './pages/ChatbotPage';
import RiskProfilePage from './pages/RiskProfilePage';
import LandingPage from './pages/LandingPage';

const RootRoute: React.FC = () => {
  const { data: session, isPending } = useSession();
  if (isPending) return <LoadingSpinner fullPage size={32} />;
  if (session?.user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
};

const FallbackRoute: React.FC = () => {
  const { data: session, isPending } = useSession();
  if (isPending) return <LoadingSpinner fullPage size={32} />;
  if (session?.user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public Landing Route */}
        <Route path="/" element={<RootRoute />} />

        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* Protected Application Routes wrapped in MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/credit" element={<CreditPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/investment/portfolio" element={<Navigate to="/portfolio" replace />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/investment/recommendations" element={<Navigate to="/recommendations" replace />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/risk-profile" element={<RiskProfilePage />} />
          <Route path="/investment/risk-profile" element={<Navigate to="/risk-profile" replace />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<FallbackRoute />} />
      </Routes>
    </div>
  );
};

export default App;
