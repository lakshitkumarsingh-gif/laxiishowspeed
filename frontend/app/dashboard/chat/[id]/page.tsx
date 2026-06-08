'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { conversationAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    loadConversation();
  }, [token, params.id, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const res = await conversationAPI.get(params.id);
      setMessages(res.data.messages);
      setConversationTitle(res.data.title);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await conversationAPI.sendMessage(params.id, input);
      setMessages((prev) => [...prev, res.data.assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    'Explain a tough concept I\'m struggling with',
    'Quiz me on what I\'ve been learning',
    'Help me draft a study plan for this week',
    'Summarize a paper or PDF I\'ll upload',
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Conversation</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{conversationTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white">
              <option>Claude Sonnet 4.5</option>
              <option>GPT-4</option>
              <option>GPT-3.5</option>
            </select>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hey {useStore.getState().user?.name?.split(' ')[0]} 👋</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">What would you like to learn today?</p>

              <div className="grid md:grid-cols-2 gap-4 w-full max-w-2xl">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setInput(action)}
                    className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-left hover:border-orange-600 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    {action}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lumen anything..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-orange-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            Lumen learns about you over time. Edit anything in your Memory page.
          </p>
        </div>
      </main>
    </div>
  );
}
