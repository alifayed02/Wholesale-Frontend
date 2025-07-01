import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login, user, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/acquisition" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div className="p-8 bg-neutral-900 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Sign In</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full p-3 bg-[#1E1E24] rounded-lg text-white border border-[#3A3A45] focus:border-blue-800 focus:outline-none"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full p-3 bg-[#1E1E24] rounded-lg text-white border border-[#3A3A45] focus:border-blue-800 focus:outline-none"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-blue-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full py-3 mt-6 bg-blue-800 rounded-lg text-white font-bold hover:bg-blue-800/90 transition-colors disabled:opacity-50"
          >
            {submitting || loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 