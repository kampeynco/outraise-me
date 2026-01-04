import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface SidebarProps {
  user: User | null;
  workspaces: any[] | null;
  activeWorkspaceId: string | null;
  onSwitchWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
  onShowHome: () => void;
  onShowNotifications: () => void;
  onShowDonations: () => void;
  onShowTransactions: () => void;
  onShowForms: () => void;
  onShowSettings: () => void;
  unreadNotificationsCount?: number;
}

type ThemeMode = 'light' | 'dark';

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  onShowHome,
  onShowNotifications,
  unreadNotificationsCount,
  onShowDonations,
  onShowTransactions,
  onShowForms,
  onShowSettings
}) => {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    // Check local storage on mount, default to 'system' if not found
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && mediaQuery.matches);

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const userName = user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || '';

  const systemModeLabel = theme === 'system' ? 'System Mode' : (theme === 'dark' ? 'Dark Mode' : 'Light Mode');

  return (
    <aside className="flex w-[260px] flex-col h-full border-r border-sidebar-border bg-sidebar-light dark:bg-background-dark dark:border-gray-800 transition-colors duration-300 shrink-0 z-20">
      {/* Top Section: Branding */}
      <div className="h-16 px-6 flex items-center shrink-0">
        <h1 className="text-text-main dark:text-white text-2xl font-bold tracking-wide font-serif">
          Outraise
        </h1>
      </div>

      {/* Center Section: Menu Items */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
        <button
          onClick={onShowHome}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="text-sm font-medium">Dashboard</span>
        </button>

        <button
          onClick={onShowNotifications}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="text-sm font-medium">Notifications</span>
          </div>
          {unreadNotificationsCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent text-[10px] font-bold text-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={onShowDonations}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">favorite</span>
          <span className="text-sm font-medium">Donations</span>
        </button>

        <button
          onClick={onShowTransactions}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          <span className="text-sm font-medium">Transactions</span>
        </button>

        <button
          onClick={onShowForms}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span className="text-sm font-medium">Forms</span>
        </button>

        <button
          onClick={onShowSettings}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>

      {/* Bottom Section: System Mode & Profile */}
      <div className="px-6 pb-6 mt-auto flex flex-col gap-4">
        {/* System Mode Toggle */}
        <div className="flex items-center justify-between text-text-sub dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">dark_mode</span>
            <span className="text-sm font-medium">{systemModeLabel}</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-10 h-5 rounded-full relative transition-colors duration-200 ease-in-out cursor-pointer ${theme === 'dark' ? 'bg-accent' : 'bg-gray-300'}`}
          >
            <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'left-5' : 'left-1'}`} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border-light dark:bg-gray-800"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-white uppercase shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-text-main dark:text-white truncate">{userName}</span>
            <span className="text-xs text-text-sub dark:text-gray-500 truncate">{userEmail}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};