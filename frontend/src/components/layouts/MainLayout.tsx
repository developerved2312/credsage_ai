import { Outlet, Navigate } from 'react-router-dom';
import { useSession } from '@lib/auth.client';
import Sidebar from '@components/ui/Sidebar';
import LoadingSpinner from '@components/ui/LoadingSpinner';

export default function MainLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size={28} />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
