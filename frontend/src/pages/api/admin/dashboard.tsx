import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const handleLogout = () => {
    // Clear token from localStorage (if applicable)
    localStorage.removeItem('token');
    // Redirect to the index login page
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex p-8">
      <div className="w-1/4 space-y-4">
        <Link href="/admin/approval" className="block p-4 bg-blue-100 rounded hover:bg-blue-200">
          ✅ Review Mentor Applications
        </Link>
        <Link href="/bookings" className="block p-4 bg-yellow-100 rounded hover:bg-yellow-200">
          📅 Manage All Bookings
        </Link>
        <Link href="/calendar" className="block p-4 bg-purple-100 rounded hover:bg-purple-200">
          🗓️ Session Overview
        </Link>
        <Link href="/notifications" className="block p-4 bg-red-100 rounded hover:bg-red-200">
          🔔 Notifications
        </Link>
        <Link href="/settings" className="block p-4 bg-gray-300 rounded hover:bg-gray-400">
          ⚙️ Admin Settings
        </Link>
        {/* Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full p-4 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🚪 Log Out
        </button>
      </div>

      <div className="flex-1 ml-10 bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Welcome Admin!</h1>
        <p className="text-gray-700">
          You are responsible for approving new mentors, managing session timelines, and keeping the system running smoothly.
        </p>
      </div>
    </div>
  );
}
