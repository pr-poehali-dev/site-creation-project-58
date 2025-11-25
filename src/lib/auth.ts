const AUTH_API = 'https://functions.poehali.dev/9f6daa76-c0b1-4588-8086-00d328aa475a';

export interface User {
  id: number;
  username: string;
  is_admin: boolean;
}

export interface AuthResponse {
  success: boolean;
  session_token?: string;
  user?: User;
  error?: string;
}

export const login = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(AUTH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, password })
  });
  
  return response.json();
};

export const register = async (username: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(AUTH_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'register', username, password })
  });
  
  return response.json();
};

export const getStoredAuth = (): { user: User; token: string } | null => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('session_token');
  
  if (userStr && token) {
    return { user: JSON.parse(userStr), token };
  }
  
  return null;
};

export const saveAuth = (user: User, token: string) => {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('session_token', token);
};

export const clearAuth = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('session_token');
};
