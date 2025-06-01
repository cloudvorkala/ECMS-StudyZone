
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    console.log('AdminDashboard - Logging out...');
    // Clear token and user data from sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    console.log('AdminDashboard - Cleared session storage');
    // Redirect to the index login page
    router.push('/');
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-100 flex p-8">
        {/* Left Panel: Navigation */}
        <div className="w-1/4 space-y-4">
          <Link href="/admin/notifications" className="block p-4 bg-purple-100 rounded-lg hover:bg-purple-200">
            🔔 Manage Notifications
          </Link>
          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            🚪 Log Out
          </button>
        </div>

        {/* Right Panel: Welcome Content */}
        <div className="flex-1 ml-10">
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h1 className="text-2xl font-bold text-blue-700 mb-4">Welcome, Administrator!</h1>
            <p className="text-gray-700">
              You can manage system notifications here. Create, update, or deactivate notifications to keep users informed about important updates and announcements.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/admin/notifications" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="font-medium text-purple-700">📢 Manage Notifications</h3>
                <p className="text-sm text-gray-600">Create and manage system notifications</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
