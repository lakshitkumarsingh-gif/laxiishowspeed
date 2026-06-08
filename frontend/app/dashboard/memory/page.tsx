'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { memoryAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { motion } from 'framer-motion';

interface Memory {
  id: string;
  type: string;
  content: string;
  importance: number;
}

export default function MemoryPage() {
  const router = useRouter();
  const { token } = useStore();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [newMemory, setNewMemory] = useState({ type: 'PREFERENCE', content: '', importance: 5 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    loadMemories();
  }, [token, router]);

  const loadMemories = async () => {
    try {
      const res = await memoryAPI.list();
      setMemories(res.data.memories);
    } catch (error) {
      console.error('Error loading memories:', error);
    }
  };

  const addMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.content.trim()) return;

    setLoading(true);
    try {
      const res = await memoryAPI.create(newMemory.type, newMemory.content, newMemory.importance);
      setMemories([res.data, ...memories]);
      setNewMemory({ type: 'PREFERENCE', content: '', importance: 5 });
    } catch (error) {
      console.error('Error adding memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await memoryAPI.delete(id);
      setMemories(memories.filter((m) => m.id !== id));
    } catch (error) {
      console.error('Error deleting memory:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      PREFERENCE: '❤️',
      GOAL: '🎯',
      STRENGTH: '💪',
      WEAKNESS: '📍',
    };
    return icons[type] || '💾';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">What Lumen remembers</h1>
            <p className="text-gray-600 dark:text-gray-400">Edit, add, or delete what your tutor knows about you. Higher importance = stronger influence.</p>
          </div>
          <ThemeSwitcher />
        </div>

        {/* Content */}
        <div className="p-8 max-w-4xl">
          {/* Add New Memory */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">+ Add</h2>
            <form onSubmit={addMemory} className="space-y-4">
              <div className="flex gap-4">
                <select
                  value={newMemory.type}
                  onChange={(e) => setNewMemory({ ...newMemory, type: e.target.value })}
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white"
                >
                  <option value="PREFERENCE">Preference</option>
                  <option value="GOAL">Goal</option>
                  <option value="STRENGTH">Strength</option>
                  <option value="WEAKNESS">Weakness</option>
                </select>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newMemory.importance}
                  onChange={(e) => setNewMemory({ ...newMemory, importance: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-gray-600 dark:text-gray-400 min-w-fit">Importance: {newMemory.importance}/10</span>
              </div>
              <textarea
                value={newMemory.content}
                onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                placeholder="e.g., Master calculus by June; learn Spanish for travel"
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-orange-600"
                rows={3}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Save
              </button>
            </form>
          </div>

          {/* Memories List */}
          <div className="space-y-4">
            {memories.map((memory, i) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTypeIcon(memory.type)}</span>
                      <span className="font-semibold text-gray-600 dark:text-gray-400 text-sm">{memory.type}</span>
                      <div className="flex-1"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Importance: {memory.importance}/10</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{memory.content}</p>
                  </div>
                  <button
                    onClick={() => deleteMemory(memory.id)}
                    className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
