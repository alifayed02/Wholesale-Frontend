const API_BASE =
  import.meta.env.VITE_ENVIRONMENT === 'production'
    ? import.meta.env.VITE_BACKEND_URL
    : 'http://127.0.0.1:5000';

export const inviteUser = async (email: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Failed to send invite');
  }
}; 