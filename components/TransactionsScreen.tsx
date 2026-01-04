import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { supabase } from '../services/supabaseClient';

export const TransactionsScreen: React.FC = () => {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [isLinking, setIsLinking] = useState(false);
    const [transactions, setTransactions] = useState([
        { id: 1, date: 'Oct 24, 2024', description: 'Stripe Payout', category: 'Income', account: 'Chase Business Checking', amount: '+$5,240.50' },
        { id: 2, date: 'Oct 23, 2024', description: 'FaceBook Ads', category: 'Marketing', account: 'Chase Business Checking', amount: '-$450.00' },
        { id: 3, date: 'Oct 22, 2024', description: 'Google Workspace', category: 'Software', account: 'Chase Business Checking', amount: '-$12.00' },
        { id: 4, date: 'Oct 21, 2024', description: 'ActBlue Disbursement', category: 'Income', account: 'Chase Business Checking', amount: '+$1,200.00' },
        { id: 5, date: 'Oct 20, 2024', description: 'Zoom Video Communications', category: 'Software', account: 'Chase Business Checking', amount: '-$15.99' },
    ]);

    const generateLinkToken = useCallback(async () => {
        try {
            const { data, error } = await supabase.functions.invoke('plaid-create-link-token');
            if (error) throw error;
            setLinkToken(data.link_token);
        } catch (error) {
            console.error('Error generating link token:', error);
        }
    }, []);

    useEffect(() => {
        generateLinkToken();
    }, [generateLinkToken]);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token, metadata) => {
        setIsLinking(true);
        try {
            const { error } = await supabase.functions.invoke('plaid-exchange', {
                body: {
                    public_token,
                    institution_id: metadata.institution?.institution_id,
                    institution_name: metadata.institution?.name,
                },
            });
            if (error) throw error;
            alert('Account connected successfully!');
        } catch (error) {
            console.error('Error exchanging token:', error);
            alert('Failed to connect account.');
        } finally {
            setIsLinking(false);
        }
    }, []);

    const config: PlaidLinkOptions = {
        token: linkToken,
        onSuccess,
    };

    const { open, ready } = usePlaidLink(config);

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">Transactions</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and categorize your imported transactions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Filter
                    </button>
                    <button
                        onClick={() => open()}
                        disabled={!ready || isLinking}
                        className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLinking ? 'Connecting...' : 'Connect Bank Account'}
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Account</th>
                            <th className="py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-medium">{tx.date}</td>
                                <td className="py-4 px-6 text-sm text-gray-900 dark:text-white font-medium">{tx.description}</td>
                                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        {tx.category}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{tx.account}</td>
                                <td className={`py-4 px-6 text-sm font-mono font-medium text-right ${tx.amount.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                    {tx.amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
