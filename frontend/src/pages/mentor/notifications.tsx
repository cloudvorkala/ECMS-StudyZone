import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

interface Notification {
  _id: string;
  title: string;
  content: string;
  type: 'announcement' | 'maintenance' | 'update' | 'emergency';
  createdBy: {
    fullName: string;
    email: string;
  };
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export default function MentorNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get<Notification[]>('/notifications/active');
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return '📢';
      case 'maintenance':
        return '🔧';
      case 'update':
        return '🔄';
      case 'emergency':
        return '🚨';
      default:
        return '📌';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'announcement':
        return 'bg-blue-50 border-blue-200';
      case 'maintenance':
        return 'bg-yellow-50 border-yellow-200';
      case 'update':
        return 'bg-green-50 border-green-200';
      case 'emergency':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ← Back to Dashboard
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500">No active notifications at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border rounded-lg p-6 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{notification.title}</h3>
                      <p className="mt-1 text-gray-600">{notification.content}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Posted by: {notification.createdBy.fullName}</p>
                        <p>Posted on: {formatDate(notification.startDate)}</p>
                        {notification.endDate && (
                          <p>Valid until: {formatDate(notification.endDate)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}