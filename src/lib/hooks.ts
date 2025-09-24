'use client';

import { create } from 'zustand';
import type { Clipador } from '@/lib/types';

interface UserState {
  user: Clipador | null;
  setUser: (u: Clipador | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
