import { createContext } from 'react';
import { APP_STORAGE_KEYS } from '../../infrastructure/storage/browserStorage';

export type ThemeMode = 'light' | 'dark';

export const STORAGE_KEY = APP_STORAGE_KEYS.theme;

export type ThemeContextValue = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function readStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'dark' || v === 'light') return v;
  } catch {
    /* ignore */
  }
  return 'light';
}
