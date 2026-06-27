'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light';
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'dark', toggle: () => {} });

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('rk-theme') as Theme | null;
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    setMounted(true);
  }, []);

  // Listen for system theme changes (only when no manual override)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('rk-theme');
      if (!stored) {
        const t = e.matches ? 'dark' : 'light';
        setTheme(t);
        document.documentElement.setAttribute('data-theme', t);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('rk-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Inline script to prevent flash before React hydrates
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `(function(){var t=localStorage.getItem('rk-theme');if(!t){t=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'}document.documentElement.setAttribute('data-theme',t)})()`;
    document.head.appendChild(script);
  }, []);

  if (!mounted) return React.createElement(React.Fragment, null, children);
  return React.createElement(ThemeContext.Provider, { value: { theme, toggle } }, children);
}

export function useTheme() { return useContext(ThemeContext); }
