import { create } from 'zustand';
import { v4 as uuid } from 'uuid';

export const useUserStore = create((set) => ({
    nickname: null,
    userId: null,

    setUser: (nickname) => {
      const newUserId = uuid();
      set({
        nickname,
        userId: newUserId,
      });
    },

    clearUser: () => set({
      nickname: null,
      userId: null,
    }),
}));
