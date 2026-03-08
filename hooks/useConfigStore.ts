import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

export interface ConfigState {
  theme: 'light' | 'dark' | 'system';
  language: Language;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: Language) => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'ko',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'kids-schedule-config',
    }
  )
);
