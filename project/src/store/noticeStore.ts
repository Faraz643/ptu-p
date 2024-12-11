import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Notice } from '../types';

interface NoticeState {
  notices: Notice[];
  pinnedNotices: string[];
  addNotice: (notice: Notice) => void;
  removeNotice: (id: string) => void;
  togglePin: (id: string) => void;
  updateNotice: (id: string, updates: Partial<Notice>) => void;
  setNotices: (notices: Notice[]) => void;
}

export const useNoticeStore = create<NoticeState>()(
  devtools(
    persist(
      (set) => ({
        notices: [],
        pinnedNotices: [],
        addNotice: (notice) =>
          set((state) => ({
            notices: [notice, ...state.notices],
          })),
        removeNotice: (id) =>
          set((state) => ({
            notices: state.notices.filter((notice) => notice.id !== id),
            pinnedNotices: state.pinnedNotices.filter((pinId) => pinId !== id),
          })),
        togglePin: (id) =>
          set((state) => ({
            pinnedNotices: state.pinnedNotices.includes(id)
              ? state.pinnedNotices.filter((pinId) => pinId !== id)
              : [...state.pinnedNotices, id],
          })),
        updateNotice: (id, updates) =>
          set((state) => ({
            notices: state.notices.map((notice) =>
              notice.id === id ? { ...notice, ...updates } : notice
            ),
          })),
        setNotices: (notices) => set({ notices }),
      }),
      {
        name: 'notice-storage',
      }
    )
  )
);