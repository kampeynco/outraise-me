import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { FilesScreen } from './components/FilesScreen';
import { CandidateProfileScreen } from './components/CandidateProfileScreen';
import { DraftsScreen } from './components/DraftsScreen';
import { GuardrailsScreen } from './components/GuardrailsScreen';
import { ProjectsScreen } from './components/ProjectsScreen';
import { NewProjectModal } from './components/NewProjectModal';
import { RenameProjectModal } from './components/RenameProjectModal';
import { generateResponse } from './services/geminiService';
import { ChatMessage } from './types';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import Auth from './components/Auth';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [view, setView] = useState<'home' | 'chats' | 'files' | 'candidate-profile' | 'drafts' | 'guardrails' | 'projects'>('home');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projects, setProjects] = useState<string[]>(['Voter Outreach', 'Fall Campaign']);
  const [renamingProject, setRenamingProject] = useState<{ index: number; name: string } | null>(null);

  const [workspaces, setWorkspaces] = useState<any[] | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkWorkspaces(session.user.id);
      } else {
        setWorkspaces(null); // No session, no workspaces
        setAuthLoading(false); // Auth check complete even if no session
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkWorkspaces(session.user.id);
      } else {
        setWorkspaces(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkWorkspaces = async (userId: string) => {
    try {
      const { workspaceService } = await import('./services/workspaceService');
      const data = await workspaceService.getUserWorkspaces(userId);
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspaceId) {
        setActiveWorkspaceId(data[0].id);
      }
    } catch (error) {
      console.error('Error checking workspaces:', error);
      // Fallback or handle error - for now assume no workspace if error to force retry or show error
      setWorkspaces([]); // Treat error as no workspaces found
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    if (session) {
      checkWorkspaces(session.user.id);
    }
    setView('home');
  };

  const handleStartChat = useCallback(async (initialPrompt: string) => {
    setView('chats');
    setIsLoading(true);

    // Add user message immediately
    const userMsg: ChatMessage = { role: 'user', text: initialPrompt };
    setMessages([userMsg]);

    try {
      const responseText = await generateResponse(initialPrompt);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: ChatMessage = { role: 'model', text: "I'm sorry, I encountered an error processing your request." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    setIsLoading(true);
    const userMsg: ChatMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);

    try {
      const responseText = await generateResponse(text);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: ChatMessage = { role: 'model', text: "I'm sorry, I encountered an error processing your request." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    // Ensure we are on the chats view, although we likely already are
    setView('chats');
  };

  const handleCreateProject = (name: string, memory: 'default' | 'project-only') => {
    setProjects(prev => [...prev, name]);
    setShowNewProjectModal(false);
  };

  const handleRenameProject = (index: number) => {
    setRenamingProject({ index, name: projects[index] });
  };

  const handleRenameSubmit = (newName: string) => {
    if (renamingProject && newName.trim()) {
      setProjects(prev => {
        const updated = [...prev];
        updated[renamingProject.index] = newName.trim();
        return updated;
      });
      setRenamingProject(null);
    }
  };

  const handleDeleteProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-background-dark text-gray-900 dark:text-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (workspaces !== null && workspaces.length === 0) {
    return <OnboardingWizard user={session.user} onComplete={handleOnboardingComplete} />;
  }

  const activeWorkspace = workspaces?.find(w => w.id === activeWorkspaceId) || (workspaces && workspaces.length > 0 ? workspaces[0] : null);

  return (
    <div className="flex h-screen w-full flex-row bg-white dark:bg-background-dark">
      <Sidebar
        user={session.user}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSwitchWorkspace={setActiveWorkspaceId}
        onCreateWorkspace={() => setView('home')} // For now, or trigger actual flow
        onShowHome={() => setView('home')}
        onShowFiles={() => setView('files')}
        onShowCandidateProfile={() => setView('candidate-profile')}
        onShowDrafts={() => setView('drafts')}
        onShowGuardrails={() => setView('guardrails')}
        onShowProjects={() => setView('projects')}
        onShowChats={() => setView('chats')}
      />
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-background-dark relative transition-colors duration-300">
        <header className="h-16 border-b border-border-light dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-background-dark shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-2 text-sm text-text-main dark:text-white font-medium">
            <span className="material-symbols-outlined text-[18px] text-gray-400">work</span>
            <span>{activeWorkspace?.name || 'Loading workspace...'}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Redundant Sign Out and Ellipsis removed as requested */}
          </div>
        </header>

        {view === 'home' && (
          <HomeScreen onStartChat={handleStartChat} />
        )}

        {view === 'chats' && (
          <ChatScreen
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
          />
        )}

        {view === 'files' && (
          <FilesScreen />
        )}

        {view === 'candidate-profile' && (
          <CandidateProfileScreen />
        )}

        {view === 'drafts' && (
          <DraftsScreen />
        )}

        {view === 'guardrails' && (
          <GuardrailsScreen />
        )}

        {view === 'projects' && (
          <ProjectsScreen
            projects={projects}
            onNewProject={() => setShowNewProjectModal(true)}
            onRenameProject={handleRenameProject}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </main>

      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreate={handleCreateProject}
      />

      <RenameProjectModal
        isOpen={!!renamingProject}
        onClose={() => setRenamingProject(null)}
        onRename={handleRenameSubmit}
        currentName={renamingProject?.name || ''}
      />
    </div>
  );
};

export default App;