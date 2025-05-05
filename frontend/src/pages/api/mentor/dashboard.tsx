// ✅ src/pages/api/mentor/dashboard.tsx
// Mentor Dashboard 页面：显示 mentor 的欢迎信息、操作入口

import React from 'react';
import Link from 'next/link';

export default function MentorDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Welcome Mentor!</h1>

        <p className="mb-6 text-gray-700">
          Here is your dashboard. From here, you can manage your availability, bookings, and students.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/api/calendar" className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
            📆 Manage Availability
          </Link>
          <Link href="/api/bookings" className="block p-4 bg-green-100 rounded-lg hover:bg-green-200">
            📋 View Bookings
          </Link>
          <Link href="/api/mentor/groups" className="block p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200">
            👥 Manage Study Groups
          </Link>
          <Link href="/api/notifications" className="block p-4 bg-purple-100 rounded-lg hover:bg-purple-200">
            🔔 Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
