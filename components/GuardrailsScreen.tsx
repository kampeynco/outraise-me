import React, { useState, useEffect, useRef } from 'react';
import { guardrailService } from '../services/guardrailService';
import {
  Loader2,
  CheckCircle,
  Ban,
  Palette,
  Plus,
  AlertTriangle,
  ShieldAlert,
  Save,
  X
} from 'lucide-react';

type Tab = 'forbidden' | 'tone' | 'approved';

interface Rule {
  id: string;
  title: string;
  description: string;
}

interface GuardrailsScreenProps {
  workspaceId: string | null;
}

export const GuardrailsScreen: React.FC<GuardrailsScreenProps> = ({ workspaceId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('approved');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Centralized State
  const [approvedTopics, setApprovedTopics] = useState<Rule[]>([]);
  const [forbiddenTopics, setForbiddenTopics] = useState<Rule[]>([]);
  const [toneStyle, setToneStyle] = useState<any>({
    adjectives: ['Empathetic', 'Decisive', 'Optimistic', 'Data-driven'],
    readingLevel: 4,
    stylisticPreferences: "Use short sentences. Avoid jargon. Always bring problems back to how they affect working families in the district."
  });

  useEffect(() => {
    const loadGuardrails = async () => {
      if (!workspaceId) return;
      setLoading(true);
      try {
        const data = await guardrailService.getGuardrails(workspaceId);
        if (data) {
          setApprovedTopics((data.approved_topics as any[]) || []);
          setForbiddenTopics((data.forbidden_topics as any[]) || []);
          setToneStyle(data.tone_style || {
            adjectives: ['Empathetic', 'Decisive', 'Optimistic', 'Data-driven'],
            readingLevel: 4,
            stylisticPreferences: "Use short sentences. Avoid jargon. Always bring problems back to how they affect working families in the district."
          });
        }
      } catch (error) {
        console.error('Error loading guardrails:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGuardrails();
  }, [workspaceId]);

  const handleSave = async () => {
    if (!workspaceId) return;
    setSaving(true);
    try {
      await guardrailService.upsertGuardrails({
        workspace_id: workspaceId,
        approved_topics: approvedTopics as any,
        forbidden_topics: forbiddenTopics as any,
        tone_style: toneStyle,
      });
    } catch (error) {
      console.error('Error saving guardrails:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'approved', label: 'Approved Topics', icon: CheckCircle },
    { id: 'forbidden', label: 'Forbidden Topics', icon: Ban },
    { id: 'tone', label: 'Tone & Style', icon: Palette },
  ];

  return (
    <div className="flex h-full bg-gray-50/50 dark:bg-background-dark transition-colors duration-300">
      {/* Inner Sidebar */}
      <aside className="w-64 bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-serif text-xl font-medium text-text-main dark:text-white">Guardrails</h2>
          <p className="text-xs text-text-sub dark:text-gray-400 mt-1">Set rules for AI generation</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-8">
            <div style={{ display: activeTab === 'forbidden' ? 'block' : 'none' }} className="animate-in fade-in duration-300">
              <ForbiddenView
                rules={forbiddenTopics}
                setRules={setForbiddenTopics}
                onSave={handleSave}
                saving={saving}
              />
            </div>
            <div style={{ display: activeTab === 'approved' ? 'block' : 'none' }} className="animate-in fade-in duration-300">
              <ApprovedTopicsView
                topics={approvedTopics}
                setTopics={setApprovedTopics}
                onSave={handleSave}
                saving={saving}
              />
            </div>
            <div style={{ display: activeTab === 'tone' ? 'block' : 'none' }} className="animate-in fade-in duration-300">
              <ToneView
                toneStyle={toneStyle}
                setToneStyle={setToneStyle}
                onSave={handleSave}
                saving={saving}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Generic Modal Components
const AddRuleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, description: string) => void;
  type: 'approved' | 'forbidden';
}> = ({ isOpen, onClose, onAdd, type }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDesc('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[480px] flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-xl font-serif font-medium text-text-main dark:text-white">
            {type === 'approved' ? 'Add Approved Topic' : 'Add Forbidden Rule'}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all"
              placeholder={type === 'approved' ? "e.g. Healthcare Access" : "e.g. Family Private Matters"}
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all resize-none"
              placeholder={type === 'approved' ? "Describe what the AI should focus on..." : "Describe what the AI should avoid..."}
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 rounded-b-xl border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={() => {
              if (title.trim() && desc.trim()) {
                onAdd(title, desc);
                onClose();
              }
            }}
            disabled={!title.trim() || !desc.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 ${type === 'approved' ? 'bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Add Rule
          </button>
        </div>
      </div>
    </div>
  );
}

const DeleteRuleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}> = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-main dark:text-white">Delete Rule?</h3>
            <p className="text-sm text-text-sub dark:text-gray-400 mt-1">
              Are you sure you want to delete <span className="font-medium">"{title}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">Delete</button>
        </div>
      </div>
    </div>
  );
}

interface ForbiddenViewProps {
  rules: Rule[];
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
  onSave: () => void;
  saving: boolean;
}

const ForbiddenView: React.FC<ForbiddenViewProps> = ({ rules, setRules, onSave, saving }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (title: string, description: string) => {
    setRules([...rules, { id: Date.now().toString(), title, description }]);
  };

  const handleDelete = () => {
    if (deleteId) {
      setRules(rules.filter(r => r.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8">
      <AddRuleModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} type="forbidden" />
      <DeleteRuleModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={rules.find(r => r.id === deleteId)?.title || ''}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-text-main dark:text-white">Forbidden Topics</h1>
          <p className="text-text-sub dark:text-gray-400 mt-1">Topics the AI should strictly avoid mentioning.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4 flex gap-3 text-red-800 dark:text-red-300 text-sm">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <p>These rules are applied as a system prompt to all AI generations within this project. Use with caution.</p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle flex items-start gap-4 transition-colors">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <Ban className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-main dark:text-white">{rule.title}</h3>
              <p className="text-sm text-text-sub dark:text-gray-400 mt-1">{rule.description}</p>
            </div>
            <button
              onClick={() => setDeleteId(rule.id)}
              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        ))}
        {rules.length === 0 && (
          <div className="text-center py-10 text-gray-400 italic">No forbidden rules set.</div>
        )}
      </div>
    </div>
  );
};

interface ApprovedTopicsViewProps {
  topics: Rule[];
  setTopics: React.Dispatch<React.SetStateAction<Rule[]>>;
  onSave: () => void;
  saving: boolean;
}

const ApprovedTopicsView: React.FC<ApprovedTopicsViewProps> = ({ topics, setTopics, onSave, saving }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (title: string, description: string) => {
    setTopics([...topics, { id: Date.now().toString(), title, description }]);
  };

  const handleDelete = () => {
    if (deleteId) {
      setTopics(topics.filter(t => t.id !== deleteId));
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8">
      <AddRuleModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAdd} type="approved" />
      <DeleteRuleModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={topics.find(t => t.id === deleteId)?.title || ''}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-text-main dark:text-white">Approved Topics</h1>
          <p className="text-text-sub dark:text-gray-400 mt-1">Core themes and subjects to prioritize in generation.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-xl p-4 flex gap-3 text-green-800 dark:text-green-300 text-sm">
        <CheckCircle className="w-5 h-5 shrink-0" />
        <p>The AI will prioritize these topics and themes when generating content.</p>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle flex items-start gap-4 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-text-main dark:text-white">{topic.title}</h3>
              <p className="text-sm text-text-sub dark:text-gray-400 mt-1">{topic.description}</p>
            </div>
            <button
              onClick={() => setDeleteId(topic.id)}
              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        ))}
        {topics.length === 0 && (
          <div className="text-center py-10 text-gray-400 italic">No approved topics set.</div>
        )}
      </div>
    </div>
  );
};

interface ToneViewProps {
  toneStyle: any;
  setToneStyle: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  saving: boolean;
}

const ToneView: React.FC<ToneViewProps> = ({ toneStyle, setToneStyle, onSave, saving }) => {
  const READING_LEVELS = [
    '6th Grade',
    '7th Grade',
    '8th Grade',
    '9th Grade',
    '10th Grade',
    '11th Grade',
    '12th Grade',
    'Academic'
  ];

  const adjectives = toneStyle.adjectives || [];
  const readingLevel = toneStyle.readingLevel || 0;
  const stylisticPreferences = toneStyle.stylisticPreferences || "";

  const [newAdjective, setNewAdjective] = useState('');
  const [isAddingAdjective, setIsAddingAdjective] = useState(false);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Handle Adjectives
  const handleAddAdjective = () => {
    if (newAdjective.trim()) {
      setToneStyle({ ...toneStyle, adjectives: [...adjectives, newAdjective.trim()] });
      setNewAdjective('');
      setIsAddingAdjective(false);
    }
  };

  const handleRemoveAdjective = (tag: string) => {
    setToneStyle({ ...toneStyle, adjectives: adjectives.filter(t => t !== tag) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddAdjective();
    }
  };

  // Handle Slider
  const updateSlider = (clientX: number) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

      // Convert percentage to discrete index
      const index = Math.round((percentage / 100) * (READING_LEVELS.length - 1));
      setToneStyle({ ...toneStyle, readingLevel: index });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    updateSlider(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        updateSlider(e.clientX);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const setStylisticPreferences = (value: string) => {
    setToneStyle({ ...toneStyle, stylisticPreferences: value });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-text-main dark:text-white">Tone & Style</h1>
          <p className="text-text-sub dark:text-gray-400 mt-1">Define the voice of the candidate.</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-subtle space-y-8 transition-colors">
        {/* Key Adjectives */}
        <div>
          <label className="block text-sm font-medium text-text-main dark:text-white mb-3">Key Adjectives</label>
          <div className="flex flex-wrap gap-2">
            {adjectives.map((tag) => (
              <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
                {tag}
                <button
                  onClick={() => handleRemoveAdjective(tag)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            {isAddingAdjective ? (
              <div className="inline-flex items-center">
                <input
                  type="text"
                  value={newAdjective}
                  onChange={(e) => setNewAdjective(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!newAdjective.trim()) setIsAddingAdjective(false);
                  }}
                  autoFocus
                  placeholder="Type & press Enter"
                  className="px-3 py-1.5 rounded-full text-sm border border-black dark:border-white bg-transparent text-text-main dark:text-white focus:outline-none focus:ring-0 min-w-[120px]"
                />
                <button
                  onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                  onClick={handleAddAdjective}
                  className="ml-2 p-1 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingAdjective(true)}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            )}
          </div>
        </div>

        {/* Reading Level Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-main dark:text-white">Reading Level</label>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {READING_LEVELS[readingLevel]} {readingLevel === 4 ? '(Target)' : ''}
            </span>
          </div>
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            className="h-6 flex items-center cursor-pointer group"
          >
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-black dark:bg-white rounded-full transition-all duration-75 ease-linear"
                style={{ width: `${(readingLevel / (READING_LEVELS.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-text-sub dark:text-gray-400 mt-1">
            <span>Simple (Grade 6)</span>
            <span className={`transition-opacity ${readingLevel >= 3 && readingLevel <= 5 ? 'opacity-100 font-medium text-text-main dark:text-white' : 'opacity-0'}`}>Grade 10 (Target)</span>
            <span>Academic</span>
          </div>
        </div>

        {/* Stylistic Preferences */}
        <div>
          <label className="block text-sm font-medium text-text-main dark:text-white mb-2">Stylistic Preferences</label>
          <textarea
            rows={4}
            value={stylisticPreferences}
            onChange={(e) => setStylisticPreferences(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white text-text-main dark:text-white outline-none transition-all resize-none placeholder:text-gray-300 dark:placeholder:text-gray-600"
            placeholder="e.g. Always use active voice..."
          />
        </div>
      </div>
    </div>
  );
};