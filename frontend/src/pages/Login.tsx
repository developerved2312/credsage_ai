import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../lib/auth.client';
import { AlertCircle, Loader2, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      const response = await signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (response?.error) {
        setError(response.error.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to log in. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (response?.error) {
        setError(response.error.message || 'Google OAuth is not configured or failed. Please sign in with Email.');
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error('Google login error:', err);
      setError(
        'Google OAuth failed. Make sure valid GOOGLE_CLIENT_ID & SECRET are set in backend/.env and http://localhost:3000/api/auth/callback/google is added to your Google OAuth client redirect URIs.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
        <p className="text-sm text-slate-500">Sign in to access your financial dashboard</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs sm:text-sm">
          <AlertCircle size={18} className="shrink-0 text-rose-500 mt-0.5" />
          <p className="leading-snug">{error}</p>
        </div>
      )}

      {/* Google Sign-In */}
      <button
        id="google-login-btn"
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative px-3 bg-white text-xs text-slate-400 uppercase tracking-wider font-medium">
          or email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 placeholder:text-slate-400"
            />
          </div>
        </div>

        <button
          id="email-login-btn"
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Switch to SignUp */}
      <p className="text-center text-xs sm:text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
          Create free account
        </Link>
      </p>
    </div>
  );
};

export default Login;
