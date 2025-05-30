import React from 'react';
import Link from 'next/link';

export default function MentorDashboard() {
  const handleLogout = () => {
    // Clear token from localStorage (if applicable)
    localStorage.removeItem('token');
    // Redirect to the index login page
    window.location.href = '/';
  };

  return (
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
        <Link href="/notifications" className="block p-4 bg-purple-100 rounded-lg hover:bg-purple-200">
          🔔 Notifications
        </Link>
        {/* New Booking Requests Button */}
        <Link href="/mentor/booking-requests" className="block p-4 bg-orange-100 rounded-lg hover:bg-orange-200">
          📩 Booking Requests
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

      {/* Right Panel: Welcome Content */}
      <div className="flex-1 ml-10 bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Welcome, Mentor!</h1>
        <p className="text-gray-700">
          Thank you for supporting students. You can manage your schedule, approve session requests,
          and provide group study support. Check your availability and notifications regularly!
        </p>
      </div>
    </div>
  );
}
