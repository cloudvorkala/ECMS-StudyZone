// ✅ src/pages/api/admin/dashboard.tsx
import React from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 flex p-8">
      <div className="w-1/4 space-y-4">
        <Link href="/api/admin/approval" className="block p-4 bg-blue-100 rounded hover:bg-blue-200">
          ✅ Approve Mentors
        </Link>
        <Link href="/api/notifications" className="block p-4 bg-purple-100 rounded hover:bg-purple-200">
          🔔 View Notifications
        </Link>
      </div>
      <div className="flex-1 ml-10 bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Welcome, Admin!</h1>
        <p className="text-gray-700">
          Here you can manage mentor applications, view platform activity, and ensure system integrity.
        </p>
      </div>
    </div>
  );
}
