'use client';
import { useEffect } from 'react';

export function ThemeSync() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    let active = true;
    fetch('/api/me').then(response => response.ok ? response.json() as Promise<{ darkMode?: boolean }> : null).then(data => {
      if (active && data) document.documentElement.classList.toggle('dark', data.darkMode !== false);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  return null;
}
