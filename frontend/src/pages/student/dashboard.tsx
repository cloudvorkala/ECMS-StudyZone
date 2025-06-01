// ✅ src/pages/student/dashboard.tsx
import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function StudentDashboard() {
  const handleLogout = () => {
    // Clear token from localStorage (if applicable)
    localStorage.removeItem('token');
    // Redirect to the index login page
    window.location.href = '/';
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-100 flex p-8">
        {/* Left Panel: Navigation */}
        <div className="w-1/4 space-y-4">
          <Link href="/bookings" className="block p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200">
            📋 View Bookings
          </Link>
          <Link href="/student/groups" className="block p-4 bg-green-100 rounded-lg hover:bg-green-200">
            👥 Study Groups
          </Link>
          <Link href="/mentor-recommendation" className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
            👨‍🏫 Find Mentors
          </Link>
          <Link href="/student/notifications" className="block p-4 bg-purple-100 rounded-lg hover:bg-purple-200">
            🔔 Notifications
          </Link>
          {/* Profile Button */}
          <Link href="/student/editprofile" className="block p-4 bg-gray-300 rounded-lg hover:bg-gray-400">
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

        {/* Right Panel: Welcome Content */}
        <div className="flex-1 ml-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link key="view-bookings" href="/bookings" className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <h3 className="font-medium text-yellow-700">📝 View Bookings</h3>
                <p className="text-sm text-gray-600">Check your booking history</p>
              </Link>
              <Link key="study-groups" href="/student/groups" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="font-medium text-green-700">👥 Study Groups</h3>
                <p className="text-sm text-gray-600">View your study groups</p>
              </Link>
              <Link key="find-mentors" href="/mentor-recommendation" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="font-medium text-blue-700">👨‍🏫 Find Mentors</h3>
                <p className="text-sm text-gray-600">Book sessions with mentors</p>
              </Link>
              <Link key="update-profile" href="/student/editprofile" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="font-medium text-purple-700">👤 Update Profile</h3>
                <p className="text-sm text-gray-600">Edit your information</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
