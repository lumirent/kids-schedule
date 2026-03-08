"use client";

import { useEffect, useState } from 'react';
import { useConfigStore } from '@/hooks/useConfigStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, language } = useConfigStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    // Update language attribute
    root.lang = language;

    const applyTheme = (currentTheme: string) => {
      root.classList.remove('light', 'dark');
      
      let effectiveTheme = currentTheme;
      if (currentTheme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      root.classList.add(effectiveTheme);
      // This also helps with browser UI elements (scrollbar, etc.)
      root.style.colorScheme = effectiveTheme;
    };

    applyTheme(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, language, mounted]);

  // Render children immediately but with a data attribute or class handled by script in layout if possible.
  // For now, standard client-side sync is fine given Next.js 16 behavior.
  return <>{children}</>;
}
