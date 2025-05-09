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
      <div className="min-h-screen bg-gray-100 p-8 flex">
        {/* Left Navigation Panel  */}
        <div className="w-1/3 p-4 space-y-4">
          <Link href="/mentor-recommendation" className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
            🌟 Recommended Mentors
          </Link>
          <Link href="/bookings" className="block p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200">
            📋 My Bookings
          </Link>
          <Link href="/calendar" className="block p-4 bg-indigo-100 rounded-lg hover:bg-indigo-200">
            📅 Session Time Suggestions
          </Link>
          <Link href="/settings" className="block p-4 bg-gray-200 rounded-lg hover:bg-gray-300">
            ⚙️ Edit Profile
          </Link>
           {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          🚪 Log Out
        </button>
        </div>

        {/*Right Welcome Panel  */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-green-700">Welcome, Student! 🎓</h1>
          <p className="text-gray-700 mb-4">
            You&apos;re all set to boost your learning! Use the left panel to book sessions, manage your time, and ask questions to our awesome mentors.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>💡 Click &quot;Recommended Mentors&quot; to explore matched mentors</li>
            <li>🗓️ Check &quot;Session Time Suggestions&quot; for availability</li>
            <li>📋 Track your bookings and update your profile anytime</li>
          </ul>
          <div className="bg-green-100 text-green-700 p-3 rounded mt-4">
            📣 Announcement: Mid-semester tutoring sessions open now! Book early to reserve your slot.
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
