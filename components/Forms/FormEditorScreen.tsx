import React, { useEffect, useState } from 'react';
import { formService, Form } from '../../services/formService';
import { Loader2 } from 'lucide-react';

interface FormEditorScreenProps {
    formId: string;
    onBack: () => void;
}

export const FormEditorScreen: React.FC<FormEditorScreenProps> = ({ formId, onBack }) => {
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const data = await formService.getFormById(formId);
                setForm(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [formId]);

    const handleUpdate = async (updates: Partial<Form>) => {
        if (!form) return;
        setSaving(true);
        try {
            const updated = await formService.updateForm(form.id, updates);
            setForm(updated);
        } catch (err) {
            console.error('Failed to update form', err);
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = () => {
        handleUpdate({ status: 'active' });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (!form) return <div>Form not found</div>;

    const currentTheme = form.settings?.themeColor || 'blue';

    return (
        <div className="flex h-full flex-col bg-gray-50 dark:bg-background-dark">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{form.title}</h1>
                        <span className="text-xs text-gray-500 flex items-center gap-2">
                            {saving ? 'Saving...' : 'Saved'}
                            <span className={`w-1.5 h-1.5 rounded-full ${form.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            {form.status === 'active' ? 'Published' : 'Draft'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Preview
                    </button>
                    {form.status !== 'active' && (
                        <button
                            onClick={handlePublish}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors disabled:opacity-50"
                        >
                            Publish
                        </button>
                    )}
                    {form.status === 'active' && (
                        <button
                            onClick={() => handleUpdate({ status: 'draft' })}
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 transition-colors"
                        >
                            Unpublish
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Canvas */}
                <div className="flex-1 overflow-y-auto p-8 flex justify-center">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[500px] p-8">
                        <div className="text-center mb-8 border-b-2 border-dashed border-gray-200 dark:border-gray-700 pb-8 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer rounded-lg p-4 -mx-4 group relative">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-gray-400">edit</span>
                            </div>
                            <h2 className="text-3xl font-serif text-gray-900 dark:text-white mb-4">{form.title}</h2>
                            <textarea
                                className="w-full bg-transparent border-none focus:ring-0 text-center text-gray-600 dark:text-gray-300 leading-relaxed resize-none p-0"
                                rows={3}
                                value={form.description || ''}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                onBlur={(e) => handleUpdate({ description: e.target.value })}
                                placeholder="Add a description to tell your story..."
                            />
                        </div>

                        {/* Donation Amounts Placeholder */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[25, 50, 100].map(amount => (
                                <div key={amount} className={`border rounded-lg p-4 text-center font-semibold transition-colors
                                    ${currentTheme === 'blue' ? 'border-gray-200 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}
                                    ${currentTheme === 'emerald' ? 'border-gray-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : ''}
                                    ${currentTheme === 'purple' ? 'border-gray-200 text-purple-600 bg-purple-50 dark:bg-purple-900/20' : ''}
                                `}>
                                    ${amount}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Properties</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Color</label>
                            <div className="flex gap-2">
                                {[
                                    { name: 'blue', class: 'bg-blue-600' },
                                    { name: 'emerald', class: 'bg-emerald-600' },
                                    { name: 'purple', class: 'bg-purple-600' }
                                ].map(theme => (
                                    <button
                                        key={theme.name}
                                        onClick={() => handleUpdate({ settings: { ...form.settings, themeColor: theme.name } })}
                                        className={`w-8 h-8 rounded-full ${theme.class} transition-transform hover:scale-110 focus:outline-none ${currentTheme === theme.name ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-500' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal Amount</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-7 pr-12 focus:border-accent focus:ring-accent sm:text-sm dark:bg-gray-700 dark:text-white py-2"
                                    placeholder="0.00"
                                    value={form.goal_amount || ''}
                                    onChange={(e) => setForm({ ...form, goal_amount: parseFloat(e.target.value) })}
                                    onBlur={(e) => handleUpdate({ goal_amount: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
