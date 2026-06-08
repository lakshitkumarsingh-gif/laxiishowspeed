'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { settingsAPI } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import ThemeSwitcher from '@/components/ThemeSwitcher';

interface Settings {
  theme: string;
  preferredModel: string;
  learningLevel: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { token, setTheme, setPreferredModel } = useStore();
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    preferredModel: 'claude',
    learningLevel: 'Beginner',
    notificationsEnabled: true,
    soundEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    loadSettings();
  }, [token, router]);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.get();
      setSettings(res.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      setTheme(settings.theme as 'light' | 'dark' | 'rainbow');
      setPreferredModel(settings.preferredModel as 'claude' | 'gpt');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Tune your tutor experience.</p>
        </div>

        {/* Content */}
        <div className="p-8 max-w-2xl">
          {/* Default Model */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Default Model</h2>
            <select
              value={settings.preferredModel}
              onChange={(e) => setSettings({ ...settings, preferredModel: e.target.value })}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-4 py-2 text-gray-900 dark:text-white"
            >
              <option value="claude">Claude Sonnet 4.5</option>
              <option value="gpt">GPT-5.2</option>
            </select>
          </div>

          {/* Learning Level */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Learning Level</h2>
            <div className="flex gap-4">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSettings({ ...settings, learningLevel: level })}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    settings.learningLevel === level
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Learning Goals</h2>
            <textarea
              defaultValue="e.g., Master calculus by June; learn Spanish for travel"
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-orange-600"
              rows={4}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
