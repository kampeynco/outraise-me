import React from 'react';

export const FormsScreen: React.FC = () => {
    const forms = [
        { id: 1, name: 'General Fund', raised: '$8,200', donors: 85, status: 'Active', created: 'Oct 1, 2024' },
        { id: 2, name: 'End of Year Drive', raised: '$3,400', donors: 42, status: 'Active', created: 'Oct 15, 2024' },
        { id: 3, name: 'Gala Tickets', raised: '$850', donors: 15, status: 'Active', created: 'Oct 20, 2024' },
        { id: 4, name: 'Community Outreach', raised: '$0', donors: 0, status: 'Draft', created: 'Oct 25, 2024' },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark p-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-text-main dark:text-white font-bold mb-2">My Forms</h1>
                    <p className="text-text-sub dark:text-gray-400">Manage your donation pages and forms.</p>
                </div>
                <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium">
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
                                <th className="px-6 py-4 font-medium">Raised</th>
                                <th className="px-6 py-4 font-medium">Donors</th>
                                <th className="px-6 py-4 font-medium">Created</th>
                                <th className="px-6 py-4 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {forms.map((form) => (
                                <tr key={form.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-text-main dark:text-white">{form.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${form.status === 'Active'
                                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {form.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-main dark:text-white font-semibold">{form.raised}</td>
                                    <td className="px-6 py-4 text-text-sub dark:text-gray-400">{form.donors}</td>
                                    <td className="px-6 py-4 text-text-sub dark:text-gray-400">{form.created}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-text-main dark:hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
