import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, signOut } from '../lib/auth.client';
import { AlertCircle, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

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
      setError('Email is required');
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

      if (response.error) {
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
      await signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (err: unknown) {
      console.error('Google login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to log in with Google');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">
            CredSage AI
          </Link>
          <button 
            onClick={handleLogout}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Logout
          </button>
        </div>
        <h1 className="text-3xl font-bold text-text-primary">Sign in to your account</h1>
        <p className="text-sm text-text-secondary mt-2">Welcome back! Please enter your details.</p>
      </div>

      <div className="card p-8 shadow-card">
        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded border border-red-200 bg-red-50">
            <AlertCircle size={15} className="text-risk-high shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-sm text-risk-high">{error}</p>
          </div>
        )}

        {/* Google */}
        <button
          id="google-login-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-secondary w-full mb-5 py-2.5"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-color" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-surface text-xs text-text-secondary">or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="input-label">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="input-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            id="email-login-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-2.5 mt-1"
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

        <p className="mt-5 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </>
  );
};

export default Login;
