'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
  { icon: '💬', label: 'Subjects', href: '/dashboard/subjects' },
  { icon: '✨', label: 'Quizzes & Cards', href: '/dashboard/quizzes' },
  { icon: '📄', label: 'Documents', href: '/dashboard/documents' },
  { icon: '🧠', label: 'Memory', href: '/dashboard/memory' },
  { icon: '⚙️', label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useStore();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
            ✨
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lumen</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">AI Tutor</p>
          </div>
        </div>
      </div>

      {/* New Conversation */}
      <div className="p-4">
        <Link
          href="/dashboard"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-2 font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          + New conversation
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          {user?.image && (
            <img
              src={user.image}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
        >
          Logout
        </motion.button>
      </div>
    </div>
  );
}
