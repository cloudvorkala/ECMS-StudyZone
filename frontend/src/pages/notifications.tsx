
import React, { useState, useEffect } from 'react';

type NotificationItem = {
  id: number;
  message: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const mockData = [
      { id: 1, message: '📢 Class rescheduled for tomorrow' },
      { id: 2, message: '✅ Your group session has been approved' },
    ];
    setNotifications(mockData);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4 text-purple-600">🔔 Notifications</h1>
        <ul className="space-y-3">
          {notifications.map(note => (
            <li key={note.id} className="p-4 bg-gray-50 border rounded shadow-sm">
              {note.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
