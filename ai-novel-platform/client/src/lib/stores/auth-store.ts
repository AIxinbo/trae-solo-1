import { create } from 'zustand';

interface AuthState {
  token: string | null;
  user: { id: string; username: string; email: string } | null;
  isLoggedIn: boolean;
  login: (token: string, user: { id: string; username: string; email: string }) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoggedIn: false,

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isLoggedIn: false });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isLoggedIn: true });
    }
  },
}));