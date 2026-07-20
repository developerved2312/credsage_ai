import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

// Layouts
import MainLayout from '@components/layouts/MainLayout';
import AuthLayout from '@components/layouts/AuthLayout';

// Pages
import LoginPage from '@pages/auth/LoginPage';
import RegisterPage from '@pages/auth/RegisterPage';
import DashboardPage from '@pages/DashboardPage';
import CreditScorePage from '@pages/credit/CreditScorePage';
import CreditHistoryPage from '@pages/credit/CreditHistoryPage';
import PortfoliosPage from '@pages/investment/PortfoliosPage';
import PortfolioDetailPage from '@pages/investment/PortfolioDetailPage';
import RecommendationsPage from '@pages/investment/RecommendationsPage';
import ChatbotPage from '@pages/chatbot/ChatbotPage';
import ProfilePage from '@pages/profile/ProfilePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Credit Routes */}
        <Route path="/credit/score" element={<CreditScorePage />} />
        <Route path="/credit/history" element={<CreditHistoryPage />} />
        
        {/* Investment Routes */}
        <Route path="/investments/portfolios" element={<PortfoliosPage />} />
        <Route path="/investments/portfolios/:id" element={<PortfolioDetailPage />} />
        <Route path="/investments/recommendations" element={<RecommendationsPage />} />
        
        {/* Chatbot Route */}
        <Route path="/chat" element={<ChatbotPage />} />
        
        {/* Profile Route */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
