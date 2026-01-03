import React from 'react';

export const DonationsScreen: React.FC = () => {
    const donations = [
        { id: 1, donor: 'Sarah Jenkins', amount: '$50.00', date: 'Oct 24, 2024', email: 'sarah.j@example.com', form: 'General Fund', status: 'Succeeded' },
        { id: 2, donor: 'Michael Ross', amount: '$100.00', date: 'Oct 23, 2024', email: 'mike.ross@example.com', form: 'End of Year Drive', status: 'Succeeded' },
        { id: 3, donor: 'Amelia Earhart', amount: '$250.00', date: 'Oct 22, 2024', email: 'amelia@example.com', form: 'Gala Tickets', status: 'Succeeded' },
        { id: 4, donor: 'Tom Hiddleston', amount: '$25.00', date: 'Oct 21, 2024', email: 'tom.h@example.com', form: 'General Fund', status: 'Refunded' },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark p-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-text-main dark:text-white font-bold mb-2">Donations</h1>
                    <p className="text-text-sub dark:text-gray-400">View and manage all received donations.</p>
                </div>
                <button className="px-4 py-2 border border-border-light dark:border-gray-700 bg-white dark:bg-gray-800 text-text-main dark:text-white rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-sm font-medium">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Export CSV
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-text-sub dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Donor</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Form</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {donations.map((donation) => (
                                <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 text-text-main dark:text-white">
                                        <div className="font-medium">{donation.donor}</div>
                                        <div className="text-xs text-text-sub dark:text-gray-500">{donation.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-text-main dark:text-white font-semibold">{donation.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${donation.status === 'Succeeded'
                                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                                : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                                            }`}>
                                            {donation.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-sub dark:text-gray-400">{donation.form}</td>
                                    <td className="px-6 py-4 text-text-sub dark:text-gray-400">{donation.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-text-main dark:hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
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
