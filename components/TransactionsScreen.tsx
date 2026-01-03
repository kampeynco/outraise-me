import React from 'react';

export const TransactionsScreen: React.FC = () => {
    const transactions = [
        { id: 1, date: 'Oct 24, 2024', description: 'Deposit from STRIPE TRANSFER', amount: '+$850.00', category: 'Income', account: 'Chase Checking (...2345)' },
        { id: 2, date: 'Oct 23, 2024', description: 'FACEBOOK ADS', amount: '-$120.50', category: 'Marketing', account: 'Chase Checking (...2345)' },
        { id: 3, date: 'Oct 22, 2024', description: 'AMAZON WEB SERVICES', amount: '-$45.00', category: 'Software', account: 'Chase Checking (...2345)' },
        { id: 4, date: 'Oct 21, 2024', description: 'Deposit from PAYPAL', amount: '+$1,200.00', category: 'Income', account: 'Chase Checking (...2345)' },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark p-8 transition-colors duration-300">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-text-main dark:text-white font-bold mb-2">Transactions</h1>
                    <p className="text-text-sub dark:text-gray-400">Imported transactions from your connected accounts.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-border-light dark:border-gray-700 bg-white dark:bg-gray-800 text-text-main dark:text-white rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm text-sm font-medium">
                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                        Filter
                    </button>
                    <button className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm font-medium">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Connect Account
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-text-sub dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Description</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Account</th>
                                <th className="px-6 py-4 font-medium text-right">Amount</th>
                                <th className="px-6 py-4 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {transactions.map((transaction) => {
                                const isPositive = transaction.amount.startsWith('+');
                                return (
                                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-text-sub dark:text-gray-400">{transaction.date}</td>
                                        <td className="px-6 py-4 font-medium text-text-main dark:text-white">{transaction.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                {transaction.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-sub dark:text-gray-400">{transaction.account}</td>
                                        <td className={`px-6 py-4 font-semibold text-right ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-text-main dark:text-white'}`}>
                                            {transaction.amount}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-text-main dark:hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
