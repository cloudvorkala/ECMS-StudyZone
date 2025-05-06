// ✅ src/pages/api/notifications.tsx
// 导师查看预约请求：支持接收/拒绝预约请求（前端页面展示）

import React, { useEffect, useState } from 'react';

interface NotificationItem {
  id: number;
  student: string;
  requestedTime: string;
  status: 'pending' | 'accepted' | 'declined';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    fetchNotifications();
  }, []);

  const handleResponse = async (id: number, action: 'accepted' | 'declined') => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error('Failed to respond');
      const updated = await res.json();
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: updated.status } : n))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">Booking Requests</h1>

        {notifications.length === 0 ? (
          <p className="text-gray-500">No pending requests.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`p-4 border rounded flex justify-between items-center ${
                  n.status === 'pending'
                    ? 'bg-yellow-100'
                    : n.status === 'accepted'
                    ? 'bg-green-100'
                    : 'bg-red-100 text-gray-500'
                }`}
              >
                <div>
                  <p className="font-medium">
                    {n.student} requested a session at {n.requestedTime}
                  </p>
                  <p className="text-sm">Status: <strong>{n.status}</strong></p>
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