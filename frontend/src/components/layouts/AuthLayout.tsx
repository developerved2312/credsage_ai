import { Outlet, Navigate } from 'react-router-dom';
import { useSession } from '@lib/auth.client';
import LoadingSpinner from '@components/ui/LoadingSpinner';

export default function AuthLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size={24} />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
