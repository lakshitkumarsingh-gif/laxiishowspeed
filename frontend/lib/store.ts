import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  theme: string;
  preferredModel: string;
}

interface StoreState {
  user: User | null;
  token: string | null;
  theme: 'light' | 'dark' | 'rainbow';
  preferredModel: 'claude' | 'gpt';
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'rainbow') => void;
  setPreferredModel: (model: 'claude' | 'gpt') => void;
  logout: () => void;
}

export const useStore = create<StoreState>(
  persist(
    (set) => ({
      user: null,
      token: null,
      theme: 'light',
      preferredModel: 'claude',
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setTheme: (theme) => set({ theme }),
      setPreferredModel: (preferredModel) => set({ preferredModel }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'lumen-store',
    }
  )
);
