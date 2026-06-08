'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { conversationAPI, memoryAPI, settingsAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import StatCard from '@/components/StatCard';

interface Conversation {
  id: string;
  title: string;
  subject?: string;
  createdAt: string;
}

interface Memory {
  id: string;
  type: string;
  content: string;
  importance: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    conversations: 0,
    subjects: 0,
    quizzes: 0,
    documents: 0,
    memories: 0,
    streak: 0,
  });

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    loadData();
  }, [token, router]);

  const loadData = async () => {
    try {
      const [convRes, memRes] = await Promise.all([
        conversationAPI.list(),
        memoryAPI.list(),
      ]);

      setConversations(convRes.data);
      setMemories(memRes.data.memories);
      setStats((prev) => ({
        ...prev,
        conversations: convRes.data.length,
        memories: memRes.data.memories.length,
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewLesson = async () => {
    try {
      const res = await conversationAPI.create('New Conversation');
      router.push(`/dashboard/chat/${res.data.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Good evening,</h1>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Pick up where you left off, or start something new. Lumen remembers your goals and adapts as you grow.
          </p>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startNewLesson}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold mb-12 transition-colors"
          >
            + Start a new lesson
          </motion.button>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <StatCard icon="💬" label="Conversations" value={stats.conversations} />
            <StatCard icon="📚" label="Subjects" value={stats.subjects} />
            <StatCard icon="✨" label="Quizzes taken" value={stats.quizzes} />
            <StatCard icon="📄" label="Documents" value={stats.documents} />
            <StatCard icon="🧠" label="Memories" value={stats.memories} />
            <StatCard icon="🔥" label="Day streak" value={stats.streak} />
          </div>

          {/* Recent Conversations */}
          {conversations.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent chats</h3>
              <div className="space-y-2">
                {conversations.slice(0, 5).map((conv) => (
                  <motion.button
                    key={conv.id}
                    whileHover={{ x: 4 }}
                    onClick={() => router.push(`/dashboard/chat/${conv.id}`)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    📌 {conv.title}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
