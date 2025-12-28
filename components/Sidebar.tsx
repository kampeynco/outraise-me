import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface SidebarProps {
  user: User | null;
  workspaces: any[] | null;
  activeWorkspaceId: string | null;
  onSwitchWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
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
  user,
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  onCreateWorkspace,
  onShowHome,
  onShowFiles,
  onShowCandidateProfile,
  onShowDrafts,
  onShowGuardrails,
  onShowProjects,
  onShowChats
}) => {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [showMenu, setShowMenu] = useState(false);
  const [showWorkspaces, setShowWorkspaces] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check local storage on mount, default to 'system' if not found
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
    if (savedTheme && ['system', 'light', 'dark'].includes(savedTheme)) {
      setTheme(savedTheme);
    }

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const userName = user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || '';

  return (
    <aside className="flex w-[260px] flex-col h-full border-r border-sidebar-border bg-sidebar-light dark:bg-background-dark dark:border-gray-800 transition-colors duration-300 shrink-0 z-20">
      <div className="h-16 px-5 border-b border-sidebar-border dark:border-gray-800 flex items-center shrink-0">
        <div className="flex items-center gap-3 w-full">
          <div className="group relative w-7 h-7 flex items-center justify-center rounded-lg bg-black dark:bg-transparent hover:bg-black dark:hover:bg-black transition-all duration-300 cursor-pointer overflow-visible shadow-sm shrink-0">
            <img
              src="/assets/kaios_logo_icon.png"
              alt="Logo"
              className="w-14 h-14 max-w-none object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-100 group-hover:opacity-0 scale-100 group-hover:scale-75"
            />
            <img
              src="/assets/kaios_inverse_icon.png"
              alt="Logo"
              className="w-14 h-14 max-w-none object-contain absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
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

      <div className="p-4 border-t border-sidebar-border dark:border-gray-800 relative z-50" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center w-full gap-3 px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group text-left"
        >
          <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-semibold text-text-main dark:text-white truncate">{userName}</span>
            <span className="text-xs text-text-sub dark:text-gray-500 truncate">{userEmail}</span>
          </div>
          <span className="material-symbols-outlined text-gray-400 text-[18px] group-hover:text-text-main dark:group-hover:text-white">settings</span>
        </button>

        {showMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              onClick={onCreateWorkspace}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Create Workspace
            </button>

            <div
              className="relative"
              onMouseEnter={() => setShowWorkspaces(true)}
              onMouseLeave={() => setShowWorkspaces(false)}
            >
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">switch_account</span>
                  Switch Workspace
                </div>
                <span className="material-symbols-outlined text-[16px] text-gray-400">chevron_right</span>
              </button>

              {showWorkspaces && workspaces && (
                <div className="absolute left-full bottom-0 ml-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-left-2 duration-200 z-[60]">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        onSwitchWorkspace(workspace.id);
                        setShowMenu(false);
                        setShowWorkspaces(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${workspace.id === activeWorkspaceId ? 'text-rose-600 font-medium' : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                      <span className="truncate">{workspace.name}</span>
                      {workspace.id === activeWorkspaceId && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">person</span>
              Profile
            </button>
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Log Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};