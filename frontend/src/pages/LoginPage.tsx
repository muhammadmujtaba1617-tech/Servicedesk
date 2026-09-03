import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          ServiceDesk
        </h1>
        <p className="text-gray-600 text-center mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                className="input pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="password"
                className="input pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">Quick Demo Login (1-Click)</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={async () => {
                setEmail('customer@example.com');
                setPassword('ServiceDesk2026!');
                try {
                  await login('customer@example.com', 'ServiceDesk2026!');
                  navigate('/dashboard');
                } catch {
                  setError('Login failed');
                }
              }}
              className="px-2 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={async () => {
                setEmail('agent@example.com');
                setPassword('ServiceDesk2026!');
                try {
                  await login('agent@example.com', 'ServiceDesk2026!');
                  navigate('/dashboard');
                } catch {
                  setError('Login failed');
                }
              }}
              className="px-2 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              Agent
            </button>
            <button
              type="button"
              onClick={async () => {
                setEmail('admin@example.com');
                setPassword('ServiceDesk2026!');
                try {
                  await login('admin@example.com', 'ServiceDesk2026!');
                  navigate('/dashboard');
                } catch {
                  setError('Login failed');
                }
              }}
              className="px-2 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors shadow-sm"
            >
              Admin
            </button>
          </div>
          <div className="mt-3 text-center text-xs text-gray-400">
            Demo password: <code className="font-mono text-gray-600 bg-gray-100 px-1 py-0.5 rounded">ServiceDesk2026!</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
