'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useStore();

  useEffect(() => {
    setMounted(true);
    // Apply theme
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.classList.toggle('light', theme === 'light');
    html.classList.toggle('rainbow-theme', theme === 'rainbow');
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
