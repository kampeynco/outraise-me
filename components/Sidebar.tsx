import React, { useState, useEffect } from 'react';

interface SidebarProps {
  onShowHome: () => void;
  onShowFiles: () => void;
  onShowCandidateProfile: () => void;
  onShowDrafts: () => void;
  onShowGuardrails: () => void;
  onShowProjects: () => void;
  onShowChats: () => void;
}

type ThemeMode = 'system' | 'light' | 'dark';

export const Sidebar: React.FC<SidebarProps> = ({
  onShowHome,
  onShowFiles,
  onShowCandidateProfile,
  onShowDrafts,
  onShowGuardrails,
  onShowProjects,
  onShowChats
}) => {
  const [theme, setTheme] = useState<ThemeMode>('system');

  useEffect(() => {
    // Check local storage on mount, default to 'system' if not found
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
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

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const nextIndex = (modes.indexOf(theme) + 1) % modes.length;
    setTheme(modes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return 'light_mode';
      case 'dark': return 'dark_mode';
      case 'system': return 'brightness_auto';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light Mode';
      case 'dark': return 'Dark Mode';
      case 'system': return 'System Mode';
    }
  };

  return (
    <aside className="flex w-[260px] flex-col h-full border-r border-sidebar-border bg-sidebar-light dark:bg-background-dark dark:border-gray-800 transition-colors duration-300 shrink-0 z-20">
      <div className="h-16 px-5 border-b border-sidebar-border dark:border-gray-800 flex items-center shrink-0">
        <div className="flex items-center gap-3 w-full">
          <div className="group relative w-8 h-8 flex items-center justify-center rounded-lg bg-black dark:bg-transparent hover:bg-transparent dark:hover:bg-white transition-all duration-300 cursor-pointer overflow-hidden shadow-sm shrink-0">
            <img
              src="/assets/kaios_logo_icon.png"
              alt="Logo"
              className="w-5 h-5 object-contain absolute inset-0 m-auto transition-all duration-300 opacity-100 group-hover:opacity-0 scale-100 group-hover:scale-75"
            />
            <img
              src="/assets/kaios_inverse_icon.png"
              alt="Logo"
              className="w-5 h-5 object-contain absolute inset-0 m-auto transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
            />
          </div>
          <h1 className="text-text-main dark:text-white text-xl font-bold tracking-wide font-serif">
            KAI<span className="text-rose-600">OS</span>
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400 text-[20px] cursor-pointer hover:text-gray-600 dark:hover:text-gray-200 transition-colors">dock_to_right</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 pt-3 custom-scrollbar flex flex-col gap-1">
        <button
          onClick={onShowHome}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          <span className="text-sm font-medium">Dashboard</span>
        </button>

        <button
          onClick={onShowCandidateProfile}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">perm_identity</span>
          <span className="text-sm font-medium">Candidate Profile</span>
        </button>

        <button
          onClick={onShowDrafts}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          <span className="text-sm font-medium">Drafts & Outputs</span>
        </button>

        <button
          onClick={onShowGuardrails}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">shield</span>
          <span className="text-sm font-medium">Guardrails & Rules</span>
        </button>

        <button
          onClick={onShowProjects}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">folder_open</span>
          <span className="text-sm font-medium">Projects</span>
        </button>

        <button
          onClick={onShowChats}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
          <span className="text-sm font-medium">Chats</span>
        </button>

        <button
          onClick={onShowFiles}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">layers</span>
          <span className="text-sm font-medium">Files</span>
        </button>

      </div>

      <div className="px-2 pb-2 mt-auto">
        <button
          onClick={cycleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group w-full text-left"
        >
          <span className="material-symbols-outlined text-[18px]">
            {getThemeIcon()}
          </span>
          <span className="text-sm font-medium">
            {getThemeLabel()}
          </span>
        </button>
      </div>

      <div className="p-4 border-t border-sidebar-border dark:border-gray-800 flex flex-col gap-2">
        <button className="flex items-center w-full gap-3 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-left">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-200">A</div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-text-main dark:text-white truncate">Admin User</span>
            <span className="text-xs text-text-sub dark:text-gray-500 truncate">Campaign Manager</span>
          </div>
          <span className="material-symbols-outlined text-gray-400 text-[18px] group-hover:text-text-main dark:group-hover:text-white">settings</span>
        </button>
      </div>
    </aside>
  );
};