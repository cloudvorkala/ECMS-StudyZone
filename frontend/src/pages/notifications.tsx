// ✅ src/pages/notifications.tsx
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

type NotificationItem = {
  id: number;
  type: 'modified' | 'cancelled';
  message: string;
  timestamp: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Mocked notification data
    const mockData: NotificationItem[] = [
      {
        id: 1,
        type: 'modified',
        message: 'Your room booking time has been updated by the mentor.',
        timestamp: '2025-05-24T09:30:00Z',
      },
      {
        id: 2,
        type: 'cancelled',
        message: 'Your session was cancelled by the admin due to maintenance.',
        timestamp: '2025-05-23T17:10:00Z',
      },
    ];
    setNotifications(mockData);
  }, []);

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderIcon = (type: 'modified' | 'cancelled') => {
    return type === 'modified' ? (
      <span className="text-blue-500 mr-2">✏️</span>
    ) : (
      <span className="text-red-500 mr-2">❌</span>
    );
  };

  const getColorClass = (type: 'modified' | 'cancelled') => {
    return type === 'modified'
      ? 'border-blue-300 bg-blue-50'
      : 'border-red-300 bg-red-50';
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-xl font-bold mb-4 text-purple-600">🔔 Notifications</h1>
          <ul className="space-y-3">
            {notifications.map(note => (
              <li
                key={note.id}
                className={`p-4 border rounded shadow-sm flex items-start ${getColorClass(note.type)}`}
              >
                {renderIcon(note.type)}
                <div>
                  <p className="text-gray-800">{note.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDateTime(note.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
