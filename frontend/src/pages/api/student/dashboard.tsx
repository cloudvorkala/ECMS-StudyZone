// ✅ src/pages/api/student/dashboard.tsx
// Student Dashboard 页面：显示学生欢迎信息与导航入口

import React from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-green-700">Welcome Student!</h1>

        <p className="mb-6 text-gray-700">
          From here, you can book mentors, view your bookings, and access recommended sessions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/api/mentor-recommendation" className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
            🌟 Recommended Mentors
          </Link>
          <Link href="/api/bookings" className="block p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200">
            📋 My Bookings
          </Link>
          <Link href="/api/calendar" className="block p-4 bg-indigo-100 rounded-lg hover:bg-indigo-200">
            📅 Session Time Suggestions
          </Link>
          <Link href="/api/settings" className="block p-4 bg-gray-200 rounded-lg hover:bg-gray-300">
            ⚙️ Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}