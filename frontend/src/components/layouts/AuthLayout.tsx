import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-emerald-800 tracking-tight hover:opacity-90 transition-opacity">
          <ShieldCheck size={28} className="text-emerald-600" strokeWidth={2.2} />
          <span>CredSage AI</span>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
        <Outlet />
      </div>

      {/* Sub-footer */}
      <p className="mt-8 text-center text-xs text-slate-400">
        © 2026 CredSage AI. Alternative Credit Scoring & AI Financial Advice.
      </p>
    </div>
  );
}
