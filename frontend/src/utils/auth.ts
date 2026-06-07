export const saveToken = (token: string, expiresAt: string) => {
  localStorage.setItem('gym_token', token);
  localStorage.setItem('gym_token_expiry', expiresAt);
};

export const getToken = (): string | null => {
  return localStorage.getItem('gym_token');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('gym_token');
  const expiry = localStorage.getItem('gym_token_expiry');

  if (!token || !expiry) return false;

  const expiryDate = new Date(expiry);
  const now = new Date();

  if (now > expiryDate) {
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_token_expiry');
    return false;
  }

  return true;
};

export const logout = () => {
  localStorage.removeItem('gym_token');
  localStorage.removeItem('gym_token_expiry');
};