// ✅ frontend/src/pages/notifications.tsx
import React, { useState, useEffect } from 'react';

interface NotificationItem {
  id: number;
  message: string;
  type: 'info' | 'room-change' | 'cancelled';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const mockData: NotificationItem[] = [
      { id: 1, message: '📢 Class rescheduled to 3PM in Room 204', type: 'room-change' },
      { id: 2, message: '❌ Mentor has cancelled your session tomorrow', type: 'cancelled' },
      { id: 3, message: '✅ Your group session has been approved', type: 'info' },
    ];
    setNotifications(mockData);
  }, []);

  const getColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'room-change': return 'border-yellow-400 text-yellow-700';
      case 'cancelled': return 'border-red-400 text-red-700';
      case 'info':
      default: return 'border-blue-400 text-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4 text-purple-600">🔔 Notifications</h1>
        <ul className="space-y-3">
          {notifications.map(note => (
            <li
              key={note.id}
              className={`p-4 bg-gray-50 border-l-4 rounded shadow-sm ${getColor(note.type)}`}
            >
              {note.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
