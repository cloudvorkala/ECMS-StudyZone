// ✅ src/pages/api/notifications.tsx
// 通知中心页面：导师接收学生预约请求，可接受或拒绝

import React, { useState } from 'react';

// 模拟通知数据（后续接入后端 API）
const mockNotifications = [
  {
    id: 1,
    student: 'Alice Johnson',
    requestedTime: '2025-04-21 10:00 AM',
    status: 'pending',
  },
  {
    id: 2,
    student: 'Michael Lee',
    requestedTime: '2025-04-22 3:00 PM',
    status: 'pending',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const handleResponse = (id: number, response: 'accepted' | 'declined') => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, status: response } : n
      )
    );
    console.log(`Booking ${id} marked as ${response}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <p className="text-gray-500">No new booking requests.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li key={n.id} className="p-4 border rounded bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>{n.student}</strong> requested a session at <strong>{n.requestedTime}</strong>
                  </p>
                  <p className="text-xs text-gray-500">Status: <span className={`font-semibold ${n.status === 'accepted' ? 'text-green-600' : n.status === 'declined' ? 'text-red-500' : 'text-yellow-600'}`}>{n.status}</span></p>
                </div>

                {n.status === 'pending' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleResponse(n.id, 'accepted')}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(n.id, 'declined')}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
