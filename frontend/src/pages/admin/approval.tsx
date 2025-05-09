// ✅ src/pages/admin/approval.tsx
import React from 'react';
import Link from 'next/link';

export default function AdminApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col md:flex-row gap-8">
      {/* 左侧导航区域 */}
      <div className="w-full md:w-1/3 space-y-4">
        <Link
          href="/admin/applications"
          className="block p-4 bg-blue-100 rounded hover:bg-blue-200"
        >
          📋 Review Mentor Applications
        </Link>
        <Link
          href="/bookings"
          className="block p-4 bg-yellow-100 rounded hover:bg-yellow-200"
        >
          📆 Manage All Bookings
        </Link>
        <Link
          href="/calendar"
          className="block p-4 bg-purple-100 rounded hover:bg-purple-200"
        >
          📅 Session Overview
        </Link>
        <Link
          href="/settings"
          className="block p-4 bg-gray-200 rounded hover:bg-gray-300"
        >
          ⚙️ Admin Settings
        </Link>
      </div>

      {/* 右侧欢迎说明区域 */}
      <div className="w-full md:w-2/3 bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Welcome Admin!</h1>
        <p className="text-gray-700 mb-2">
          You are responsible for approving new mentors, managing session timelines, and keeping the
          system running smoothly.
        </p>
        <p className="text-gray-700">
          🔐 Please regularly review pending mentor applications and update session status. You are
          the backbone of StudyZone's operational excellence.
        </p>
      </div>
    </div>
  );
}
