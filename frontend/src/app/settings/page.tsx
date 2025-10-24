'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useTheme } from '@/components/theme-provider';
import { apiClient } from '@/lib/api';
import { Moon, Sun, Globe, Trash2, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [settings, setSettings] = useState({
    language: 'bn',
    theme: 'dark',
  });

  useEffect(() => {
    if (theme) {
      setSettings((prev) => ({ ...prev, theme }));
    }
  }, [theme]);

  if (status === 'unauthenticated') {
    redirect('/');
  }

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await apiClient.updateUserSettings(settings);
      setTheme(settings.theme as 'dark' | 'light' | 'system');
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setLoading(true);
    try {
      await apiClient.deleteAccount();
      toast.success('Account deleted successfully');
      signOut({ callbackUrl: '/' });
    } catch (error) {
      toast.error('Failed to delete account');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences</p>
        </div>

        {/* Profile Section */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          
          <div className="flex items-center gap-4">
            <img
              src={session?.user?.image || '/default-avatar.png'}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
            <div>
              <div className="font-semibold text-lg">{session?.user?.name}</div>
              <div className="text-sm text-muted-foreground">{session?.user?.email}</div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>

          <div>
            <label className="block text-sm font-medium mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setSettings({ ...settings, theme: 'light' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'light'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Light</div>
              </button>

              <button
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Dark</div>
              </button>

              <button
                onClick={() => setSettings({ ...settings, theme: 'system' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'system'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Globe className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm font-medium">System</div>
              </button>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold mb-4">Language</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Interface Language
            </label>
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="bn">বাংলা (Bangla)</option>
              <option value="en">English</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose your preferred language for the interface
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>

        {/* Danger Zone */}
        <div className="glass p-6 rounded-xl space-y-4 border-2 border-destructive/50">
          <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Delete Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action
                cannot be undone.
              </p>

              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm font-medium text-destructive">
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Yes, Delete My Account
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      className="px-6 py-2 bg-muted rounded-lg font-medium hover:bg-muted/80"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="glass p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold mb-4">Feedback & Support</h2>

          <div className="space-y-3">
            <a
              href="mailto:support@youtubegrowth.ai"
              className="block p-4 bg-background border border-border rounded-lg hover:border-primary transition-colors"
            >
              <div className="font-medium mb-1">Send Feedback</div>
              <div className="text-sm text-muted-foreground">
                Share your thoughts and suggestions
              </div>
            </a>

            <a
              href="https://github.com/yourusername/youtube-growth-ai/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-background border border-border rounded-lg hover:border-primary transition-colors"
            >
              <div className="font-medium mb-1">Request Feature</div>
              <div className="text-sm text-muted-foreground">
                Suggest new features or improvements
              </div>
            </a>

            <a
              href="https://github.com/yourusername/youtube-growth-ai/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-background border border-border rounded-lg hover:border-primary transition-colors"
            >
              <div className="font-medium mb-1">Report Bug</div>
              <div className="text-sm text-muted-foreground">
                Let us know if something isn't working
              </div>
            </a>
          </div>
        </div>

        {/* About */}
        <div className="glass p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-medium text-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span className="font-medium text-foreground">Oct 2025</span>
            </div>
            <div className="flex justify-between">
              <span>License</span>
              <span className="font-medium text-foreground">MIT</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
