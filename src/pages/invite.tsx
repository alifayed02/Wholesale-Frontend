import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { inviteUser } from '../data/adminService';

export const Invite: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { getAuthToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      await inviteUser(email, token);
      setSuccess(`Invite sent successfully to ${email}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="p-8 bg-neutral-900 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Invite User</h1>
        <p className="text-center text-gray-400 mb-6">Enter the email of a pre-approved user to send them a password-reset link.</p>
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
          {error && <p className="text-blue-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-blue-800 rounded-lg text-white font-bold hover:bg-blue-800/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending Invite...' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Invite; 