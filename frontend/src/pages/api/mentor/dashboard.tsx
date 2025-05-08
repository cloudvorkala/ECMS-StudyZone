// ✅ src/pages/api/mentor/dashboard.tsx
// Mentor Dashboard 页面：展示欢迎信息与功能导航

import React from 'react';
import Link from 'next/link';

export default function MentorDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex p-8">
      {/* 左边功能导航 */}
      <div className="w-1/4 space-y-4">
        <Link href="/api/calendar" className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
          📆 Manage Availability
        </Link>
        <Link href="/api/bookings" className="block p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200">
          📋 View Bookings
        </Link>
        <Link href="/api/mentor/groups" className="block p-4 bg-green-100 rounded-lg hover:bg-green-200">
          👥 Study Groups
        </Link>
        <Link href="/api/notifications" className="block p-4 bg-purple-100 rounded-lg hover:bg-purple-200">
          🔔 Notifications
        </Link>
        {/* 新增的 Profile 按钮 */}
        <Link href="/mentor/profile" className="block p-4 bg-gray-300 rounded-lg hover:bg-gray-400">
  🙍‍♂️ Profile
</Link>

      
        
      </div>

      {/* 右边欢迎内容 */}
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
