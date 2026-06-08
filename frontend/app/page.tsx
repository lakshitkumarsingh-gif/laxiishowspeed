'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LandingPage() {
  const router = useRouter();
  const { user, token, setUser, setToken } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      router.push('/dashboard');
    }
  }, [token, user, router]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });

        const buttonDiv = document.getElementById('google-signin-button');
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: 'filled_blue',
            size: 'large',
            width: '100%',
          });
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleSignIn = async (response: any) => {
    setIsLoading(true);
    try {
      const res = await authAPI.google(response.credential);
      setToken(res.data.token);
      setUser(res.data.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: '🧠',
      title: 'Persistent Memory',
      description: 'AI remembers your style, gaps, and goals across every chat — and you can edit what it knows.'
    },
    {
      icon: '📚',
      title: 'Subjects & Progress',
      description: 'Track multiple courses, mastery levels, and your daily learning streak.'
    },
    {
      icon: '✨',
      title: 'Auto Quizzes & Flashcards',
      description: 'Generate quizzes and flashcards from any topic or document instantly.'
    },
    {
      icon: '📄',
      title: 'Learn from PDFs',
      description: 'Drop in lecture notes, papers, or books — Lumen reads and teaches from them.'
    },
    {
      icon: '🎤',
      title: 'Voice In & Out',
      description: 'Talk to your tutor and hear it back — hands-free learning in your language.'
    },
    {
      icon: '🎨',
      title: 'Three Premium Themes',
      description: 'Choose dark, light, or rainbow mode for your perfect learning environment.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                ✨
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Lumen</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
      >
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
            <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
              🎓 Personal AI tutor with persistent memory
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Learn anything,<br />
            <span className="text-orange-600">taught your way.</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Lumen remembers everything about how you learn — your goals, gaps, strengths, and curiosities — and adapts every explanation to you. Like a brilliant private tutor, available 24/7.
          </p>

          <div className="mb-8">
            {isLoading ? (
              <button disabled className="w-full md:w-auto px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold">
                Signing in...
              </button>
            ) : (
              <div id="google-signin-button" className="inline-block w-full md:w-auto"></div>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">Free to start • No credit card</p>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">Everything a great tutor does — and more.</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-16">Powered by AI that actually knows you.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 Lumen - Personal AI Tutor. Built with ❤️ for lifelong learners.</p>
        </div>
      </footer>
    </div>
  );
}
