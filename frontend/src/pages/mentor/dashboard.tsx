import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MentorDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    console.log('MentorDashboard - Logging out...');
    // Clear token and user data from sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    console.log('MentorDashboard - Cleared session storage');
    // Redirect to the index login page
    router.push('/');
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-100 flex p-8">
        {/* Left Panel: Navigation */}
        <div className="w-1/4 space-y-4">
          <Link href="/calendar" className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
            📆 Manage Availability
          </Link>
          <Link href="/bookings" className="block p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200">
            📋 View Bookings
          </Link>
          <Link href="/mentor/groups" className="block p-4 bg-green-100 rounded-lg hover:bg-green-200">
            👥 Study Groups
          </Link>
          <Link href="/mentor/notifications" className="block p-4 bg-purple-100 rounded-lg hover:bg-purple-200">
            🔔 Notifications
          </Link>
          {/* Profile Button */}
          <Link href="/mentor/profile" className="block p-4 bg-gray-300 rounded-lg hover:bg-gray-400">
            🙍‍♂️ Profile
          </Link>
          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            🚪 Log Out
          </button>
        </div>

        {/* Right Panel: Welcome Content and Stats */}
        <div className="flex-1 ml-10">
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h1 className="text-2xl font-bold text-blue-700 mb-4">Welcome, Mentor!</h1>
            <p className="text-gray-700">
              Thank you for supporting students. You can manage your schedule, approve session requests,
              and provide group study support. Check your availability and notifications regularly!
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link key="set-hours" href="/calendar" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="font-medium text-blue-700">📅 Set Available Hours</h3>
                <p className="text-sm text-gray-600">Update your weekly availability</p>
              </Link>
              <Link key="notifications" href="/mentor/notifications" className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <h3 className="font-medium text-yellow-700">🔔 Notifications</h3>
                <p className="text-sm text-gray-600">Check your notifications</p>
              </Link>
              <Link key="manage-groups" href="/mentor/groups" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="font-medium text-green-700">👥 Manage Groups</h3>
                <p className="text-sm text-gray-600">Create or join study groups</p>
              </Link>
              <Link key="update-profile" href="/mentor/profile" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="font-medium text-purple-700">👤 Update Profile</h3>
                <p className="text-sm text-gray-600">Edit your expertise and information</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}