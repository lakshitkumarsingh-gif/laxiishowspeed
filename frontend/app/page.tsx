'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LandingPage() {
  const router = useRouter();
  const { user, token, setUser, setToken } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && user) {
      router.push('/dashboard');
    }
  }, [token, user, router]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google Client ID not configured');
      return;
    }

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

    script.onerror = () => {
      setError('Failed to load Google Sign-In');
    };

    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Script already removed
      }
    };
  }, []);

  const handleGoogleSignIn = async (response: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authAPI.google(response.credential);
      setToken(res.data.token);
      setUser(res.data.user);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.response?.data?.error || 'Authentication failed. Please try again.');
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
      title: 'Dual AI Models',
      description: 'Choose between Claude Sonnet and GPT-4. Both powered by your custom learning profile.'
    },
    {
      icon: '⚡',
      title: 'Smart Responses',
      description: 'Get explanations tailored to YOUR learning style - structured, step-by-step, with analogies.'
    },
    {
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor subjects, learning streaks, quizzes, and mastery levels over time.'
    },
    {
      icon: '🎯',
      title: 'Personalized Goals',
      description: 'Set learning objectives and let the AI adapt every explanation to your needs.'
    },
    {
      icon: '🎨',
      title: 'Three Premium Themes',
      description: 'Dark mode, light mode, or rainbow mode for your perfect learning environment.'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                ✨
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Lumen</span>
            </div>
            <ThemeSwitcher />
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

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-8">
            {isLoading ? (
              <button disabled className="w-full md:w-auto px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold">
                Signing in...
              </button>
            ) : (
              <div id="google-signin-button" className="inline-block w-full md:w-auto"></div>
            )}
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">✅ Free to start • No credit card required</p>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">Everything a great tutor does — and more.</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-16">Powered by advanced AI that actually knows you.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 hover:border-orange-600 dark:hover:border-orange-500 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* API Keys Notice */}
      <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl max-w-4xl mx-auto mb-20 px-8 py-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-2">⚠️ First time? Configure your API keys</h3>
        <p className="text-blue-800 dark:text-blue-300 text-sm mb-4">
          To use Lumen with AI, you'll need to set up API keys for Anthropic Claude and/or OpenAI GPT:
        </p>
        <ul className="text-blue-800 dark:text-blue-300 text-sm space-y-2">
          <li>✅ <strong>Anthropic Claude:</strong> Get your API key from <a href="https://console.anthropic.com" target="_blank" className="underline">console.anthropic.com</a></li>
          <li>✅ <strong>OpenAI GPT:</strong> Get your API key from <a href="https://platform.openai.com" target="_blank" className="underline">platform.openai.com</a></li>
          <li>✅ <strong>Google OAuth:</strong> Set up OAuth at <a href="https://console.cloud.google.com" target="_blank" className="underline">console.cloud.google.com</a></li>
        </ul>
        <p className="text-blue-800 dark:text-blue-300 text-sm mt-4">
          Add them to your <code className="bg-blue-200 dark:bg-blue-900 px-2 py-1 rounded">.env</code> file in the backend folder.
        </p>
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
