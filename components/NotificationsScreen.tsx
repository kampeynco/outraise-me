import React from 'react';

export const NotificationsScreen: React.FC = () => {
    const notifications = [
        { id: 1, title: 'New Donation', message: 'Sarah Jenkins donated $50.00', time: '2 mins ago', read: false },
        { id: 2, title: 'Goal Reached', message: 'Campaign "End of Year Drive" hit 50% of goal', time: '1 hour ago', read: false },
        { id: 3, title: 'New Form Active', message: 'Gala Tickets form is now live', time: '1 day ago', read: true },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-white mb-2">Notifications</h1>
                    <p className="text-gray-500 dark:text-gray-400">Stay updated on your fundraising activity.</p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-accent hover:text-accent-hover dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    Mark all as read
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex gap-4 ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
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
                                        {notification.time}
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
