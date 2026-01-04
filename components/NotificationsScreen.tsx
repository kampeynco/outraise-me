import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    type: string;
}

interface NotificationsScreenProps {
    onRefresh?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onRefresh }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
        } else {
            setNotifications(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllAsRead = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', session.user.id)
            .eq('read', false);

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        if (onRefresh) onRefresh();
    };

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id);

        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        if (onRefresh) onRefresh();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">Notifications</h1>
                    <p className="text-gray-500 dark:text-gray-400">Stay updated on your fundraising activity.</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 text-sm font-medium text-accent hover:text-accent-hover dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-4 ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10 cursor-pointer' : ''}`}
                            >
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-accent dark:bg-blue-400' : 'bg-transparent'}`} />
                                <div className="flex-1">
                                    <h3 className={`text-sm font-medium text-gray-900 dark:text-white mb-0.5 ${!notification.read ? 'font-semibold' : ''}`}>
                                        {notification.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-400 mt-1 block">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">notifications_off</span>
                        <p>No notifications yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};
