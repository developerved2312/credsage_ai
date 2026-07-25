import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../lib/auth.client';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <LoadingSpinner fullPage size={32} />;
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
