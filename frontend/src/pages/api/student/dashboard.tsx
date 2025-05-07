// ✅ src/pages/api/student/dashboard.tsx
// 学生 Dashboard 页面：左侧导航 + 右侧欢迎信息（基于角色）

import React from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col sm:flex-row gap-6">
      {/* 左侧导航栏 */}
      <div className="w-full sm:w-1/3 space-y-4">
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

      {/* 右侧欢迎区块 */}
      <div className="w-full sm:w-2/3 bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-green-700">Welcome, Student! 🎓</h1>
        <p className="text-gray-700 mb-2">
          You're all set to boost your learning! Use the left panel to book sessions, manage your time,
          and ask questions to our awesome mentors.
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600">
          <li>💡 Click "Recommended Mentors" to explore matched mentors</li>
          <li>🗓️ Check "Session Time Suggestions" for availability</li>
          <li>📋 Track your bookings and update your profile anytime</li>
        </ul>

        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
          📣 Announcement: Mid-semester tutoring sessions open now! Book early to reserve your slot.
        </div>
      </div>
    </div>
  );
}

