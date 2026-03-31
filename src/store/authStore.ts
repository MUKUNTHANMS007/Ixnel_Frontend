import { create } from 'zustand';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  fetchMe: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('temporalai_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    
    // Mock Bypass for Demo
    if (email.includes('google') || email.includes('github') || email === 'demo@ixnel.com') {
      const mockUser = { id: 'mock-1', name, email, role: 'user' };
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('temporalai_token', mockToken);
      set({ user: mockUser, token: mockToken, isAuthenticated: true, isLoading: false });
      return true;
    }

    const res = await api<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });

    if (res.success && res.data) {
      localStorage.setItem('temporalai_token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } else {
      set({ isLoading: false, error: res.error || 'Registration failed' });
      return false;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    // Mock Bypass for Demo
    if (email.includes('google') || email.includes('github') || email === 'demo@ixnel.com') {
      const mockUser = { id: 'mock-1', name: email.split('@')[0], email, role: 'user' };
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('temporalai_token', mockToken);
      set({ user: mockUser, token: mockToken, isAuthenticated: true, isLoading: false });
      return true;
    }

    const res = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });

    if (res.success && res.data) {
      localStorage.setItem('temporalai_token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } else {
      set({ isLoading: false, error: res.error || 'Invalid credentials' });
      return false;
    }
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true });
    const res = await api<User>('/auth/me', { token });

    if (res.success && res.data) {
      set({
        user: res.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      // Token is invalid/expired — clear it
      localStorage.removeItem('temporalai_token');
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('temporalai_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
