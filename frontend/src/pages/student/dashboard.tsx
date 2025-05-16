// ✅ src/pages/student/dashboard.tsx
import React from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left Navigation */}
      <div className="w-1/4 p-6 space-y-4 bg-white shadow-md">
        <Link href="/notifications" className="block p-3 bg-red-100 rounded hover:bg-red-200">🚨 Notifications</Link>
        <Link href="/bookings" className="block p-3 bg-yellow-100 rounded hover:bg-yellow-200">📋 My Bookings</Link>
        <Link href="/mentor-recommendation" className="block p-3 bg-blue-100 rounded hover:bg-blue-200">🌟 Recommended Mentors</Link>
        <Link href="/calendar" className="block p-3 bg-purple-100 rounded hover:bg-purple-200">🗓️ Session Time Suggestions</Link>
        <Link href="/student/groups" className="block p-3 bg-green-100 rounded hover:bg-green-200">👥 Study Group</Link>
        <Link href="/student/study-room-booking" className="block p-3 bg-indigo-100 rounded hover:bg-indigo-200">🏫 Study Room Booking</Link>
        <Link href="/settings" className="block p-3 bg-gray-200 rounded hover:bg-gray-300">⚙️ Edit Profile</Link>
        <button
          onClick={() => {
            sessionStorage.clear();
            window.location.href = '/';
          }}
          className="block w-full p-3 text-white bg-red-500 rounded hover:bg-red-600"
        >
          🚪 Log Out
        </button>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-10">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-green-700 mb-4">Welcome, Student! 🎓</h1>
          <p className="text-gray-700 mb-4">You're all set to boost your learning!</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-1">
            <li>🌟 Explore matched mentors</li>
            <li>🗓️ Check available sessions</li>
            <li>📋 Track your bookings</li>
            <li>🚨 See updates in Notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
