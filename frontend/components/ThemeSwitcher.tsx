'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useStore();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('light', 'dark', 'rainbow-theme');
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'rainbow') {
      html.classList.add('rainbow-theme');
    } else {
      html.classList.add('light');
    }
  }, [theme]);

  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme('light')}
        className={`p-2 rounded transition-colors ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-600 text-orange-600'
            : 'text-gray-600 dark:text-gray-400'
        }`}
        title="Light mode"
      >
        ☀️
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme('dark')}
        className={`p-2 rounded transition-colors ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-600 text-orange-600'
            : 'text-gray-600 dark:text-gray-400'
        }`}
        title="Dark mode"
      >
        🌙
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setTheme('rainbow')}
        className={`p-2 rounded transition-colors ${
          theme === 'rainbow'
            ? 'bg-white dark:bg-gray-600 text-orange-600'
            : 'text-gray-600 dark:text-gray-400'
        }`}
        title="Rainbow mode"
      >
        🌈
      </motion.button>
    </div>
  );
}
