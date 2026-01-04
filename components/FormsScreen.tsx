import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient'; // Or use context if available
import { formService, Form } from '../services/formService';
import { CreateFormModal } from './Forms/CreateFormModal';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FormsScreenProps {
    onEdit?: (formId: string) => void;
}

export const FormsScreen: React.FC<FormsScreenProps> = ({ onEdit }) => {
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeEntityId, setActiveEntityId] = useState<string | null>(null);

    const fetchForms = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Ideally get this from a global context/store
            // For now, fetch the first active entity for the user (or passed via props if we refactor)
            // But since this component is standalone in the router, we need to find the entity.
            // Let's grab the first one from checking workspaces again or assume passed in props?
            // Existing App.tsx passes nothing to FormsScreen. 
            // We'll fetch the user's entities and pick the first one for MVP or update App.tsx to pass it.
            // Let's do a quick fetch here to be safe.
            const { workspaceService } = await import('../services/workspaceService');
            const workspaces = await workspaceService.getUserWorkspaces(session.user.id);

            if (workspaces.length > 0) {
                const entityId = workspaces[0].id; // Default to first
                setActiveEntityId(entityId);
                const data = await formService.getForms(entityId);
                setForms(data);
            }
        } catch (error) {
            console.error('Error fetching forms:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleFormCreated = (formId: string) => {
        // Refresh list
        fetchForms();
        if (onEdit) onEdit(formId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark p-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-text-main dark:text-white font-bold mb-2">My Forms</h1>
                    <p className="text-text-sub dark:text-gray-400">Manage your donation pages and forms.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Create Form
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-text-sub dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Form Name</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Goal</th>
                                <th className="px-6 py-4 font-medium">Created</th>
                                <th className="px-6 py-4 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {forms.length > 0 ? forms.map((form) => (
                                <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-text-main dark:text-white">
                                        {form.title}
                                        <div className="text-xs text-gray-400 font-normal mt-0.5">{form.slug}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${form.status === 'active'
                                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {form.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-main dark:text-white font-semibold">
                                        {form.goal_amount ? `$${form.goal_amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-text-sub dark:text-gray-400">
                                        {formatDistanceToNow(new Date(form.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-text-main dark:hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No forms found. Create your first campaign!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {activeEntityId && (
                <CreateFormModal
                    entityId={activeEntityId}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleFormCreated}
                />
            )}
        </div>
    );
};
