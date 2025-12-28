import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Loader2, Plus, Mail, ArrowRight, Check } from 'lucide-react';
import { workspaceService } from '../../services/workspaceService';

interface OnboardingWizardProps {
    user: User;
    onComplete: () => void;
}

export function OnboardingWizard({ user, onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [workspaceName, setWorkspaceName] = useState('');
    const [invites, setInvites] = useState<string[]>(['']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const ws = await workspaceService.createWorkspace(workspaceName, user.id);
            setWorkspaceId(ws.id);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInviteChange = (index: number, value: string) => {
        const newInvites = [...invites];
        newInvites[index] = value;
        setInvites(newInvites);
    };

    const addInviteField = () => {
        setInvites([...invites, '']);
    };

    const handleSendInvites = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspaceId) return;

        setLoading(true);
        setError(null);
        try {
            const validEmails = invites.filter(email => email.trim() !== '');
            await workspaceService.inviteMembers(workspaceId, validEmails, user.id);
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSkipInvites = () => {
        setStep(3);
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-2xl">
                <div className="mb-8 text-center">
                    {step === 1 && (
                        <>
                            <div className="mx-auto w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Create your Workspace</h2>
                            <p className="text-zinc-400">Let's get you set up with a home for your team.</p>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <div className="mx-auto w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Invite your Team</h2>
                            <p className="text-zinc-400">Work is better together. Invite your colleagues.</p>
                        </>
                    )}
                    {step === 3 && (
                        <>
                            <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <Check className="w-6 h-6 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
                            <p className="text-zinc-400">Your workspace is ready. Let's start building.</p>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleCreateWorkspace} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">
                                Workspace Name
                            </label>
                            <input
                                type="text"
                                required
                                value={workspaceName}
                                onChange={(e) => setWorkspaceName(e.target.value)}
                                className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                placeholder="acme-inc"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Create Workspace <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSendInvites} className="space-y-4">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-400">
                                Email Addresses
                            </label>
                            {invites.map((email, index) => (
                                <input
                                    key={index}
                                    type="email"
                                    value={email}
                                    onChange={(e) => handleInviteChange(index, e.target.value)}
                                    className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                    placeholder="colleague@example.com"
                                />
                            ))}
                            <button
                                type="button"
                                onClick={addInviteField}
                                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add another
                            </button>
                        </div>
                        <div className="pt-2 flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Send Invites"
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleSkipInvites}
                                disabled={loading}
                                className="w-full bg-transparent hover:bg-zinc-800 text-zinc-400 font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center">
                        <button
                            onClick={onComplete}
                            className="w-full bg-white text-black hover:bg-zinc-200 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
