import React from 'react';

interface HomeScreenProps {
  user: any;
  activeWorkspaceId: string | null;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user, activeWorkspaceId }) => {
  // Mock data to match V4 mockup
  const stats = [
    { label: 'Total Raised', value: '$12,450.00', icon: 'payments', trend: '+12% from last month' },
    { label: 'Total Donors', value: '142', icon: 'group', trend: '+5 new this week' },
    { label: 'Avg. Donation', value: '$87.60', icon: 'trending_up', trend: 'Consistent' },
  ];

  const recentDonations = [
    { id: 1, donor: 'Sarah Jenkins', amount: '$50.00', date: 'Oct 24, 2024', form: 'General Fund' },
    { id: 2, donor: 'Michael Ross', amount: '$100.00', date: 'Oct 23, 2024', form: 'End of Year Drive' },
    { id: 3, donor: 'Amelia Earhart', amount: '$250.00', date: 'Oct 22, 2024', form: 'Gala Tickets' },
    { id: 4, donor: 'Tom Hiddleston', amount: '$25.00', date: 'Oct 21, 2024', form: 'General Fund' },
    { id: 5, donor: 'Chris Evans', amount: '$500.00', date: 'Oct 20, 2024', form: 'End of Year Drive' },
  ];

  const activeForms = [
    { id: 1, name: 'General Fund', raised: '$8,200', donors: 85, status: 'Active' },
    { id: 2, name: 'End of Year Drive', raised: '$3,400', donors: 42, status: 'Active' },
    { id: 3, name: 'Gala Tickets', raised: '$850', donors: 15, status: 'Active' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark p-8 transition-colors duration-300">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-serif text-text-main dark:text-white font-bold mb-2">
          Fundraising Dashboard
        </h1>
        <p className="text-text-sub dark:text-gray-400">
          Overview of your campaign performance and recent activities.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-start transition-colors duration-300">
            <div className="p-2 rounded-lg bg-accent/10 dark:bg-accent/20 mb-4">
              <span className="material-symbols-outlined text-accent dark:text-blue-400 text-2xl">{stat.icon}</span>
            </div>
            <span className="text-text-sub dark:text-gray-400 text-sm font-medium mb-1">{stat.label}</span>
            <span className="text-3xl font-bold text-text-main dark:text-white mb-2">{stat.value}</span>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
              {stat.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Donations Table */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-main dark:text-white font-serif">Recent Donations</h2>
            <button className="text-sm text-accent font-medium hover:text-accent-hover dark:hover:text-blue-300 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-text-sub dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Donor</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Form</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {recentDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-main dark:text-white">{donation.donor}</td>
                    <td className="px-6 py-4 text-text-main dark:text-white font-semibold">{donation.amount}</td>
                    <td className="px-6 py-4 text-text-sub dark:text-gray-400">{donation.form}</td>
                    <td className="px-6 py-4 text-text-sub dark:text-gray-400">{donation.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Forms List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-colors duration-300 h-fit">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-main dark:text-white font-serif">Active Forms</h2>
            <button className="text-sm text-accent font-medium hover:text-accent-hover dark:hover:text-blue-300 transition-colors">Manage</button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {activeForms.map((form) => (
              <div key={form.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-text-main dark:text-white group-hover:text-accent transition-colors">{form.name}</h3>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">{form.status}</span>
                </div>
                <div className="flex justify-between text-sm text-text-sub dark:text-gray-400">
                  <span>Raised: <span className="text-text-main dark:text-white font-semibold">{form.raised}</span></span>
                  <span>{form.donors} donors</span>
                </div>
              </div>
            ))}
            <button className="w-full p-4 text-sm font-medium text-text-sub dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 border-t border-gray-50 dark:border-gray-700">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create New Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};