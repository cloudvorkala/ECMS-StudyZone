import React, { useState, useEffect, useRef } from 'react';
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
  readBy: string[];
}

export default function MentorNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const readNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Load read notifications from localStorage
    const storedReadNotifications = localStorage.getItem('mentorReadNotifications');
    console.log('Stored read notifications:', storedReadNotifications);
    if (storedReadNotifications) {
      const parsedNotifications = JSON.parse(storedReadNotifications);
      console.log('Parsed read notifications:', parsedNotifications);
      readNotificationsRef.current = new Set(parsedNotifications);
    }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get<Notification[]>('/notifications/active');
      console.log('All active notifications:', response.data);
      console.log('Current read notifications:', Array.from(readNotificationsRef.current));

      // Get all active notification IDs
      const activeNotificationIds = new Set(response.data.map(n => n._id));

      // Clean up read notifications by removing inactive ones
      const cleanedReadNotifications = Array.from(readNotificationsRef.current)
        .filter(id => activeNotificationIds.has(id));
      readNotificationsRef.current = new Set(cleanedReadNotifications);

      // Update localStorage with cleaned data
      localStorage.setItem('mentorReadNotifications', JSON.stringify(cleanedReadNotifications));

      // Filter out notifications that are in the readNotifications set
      const unreadNotifications = response.data.filter(
        notification => !readNotificationsRef.current.has(notification._id)
      );
      console.log('Filtered unread notifications:', unreadNotifications);

      setNotifications(unreadNotifications);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      await api.post(`/notifications/${notificationId}/read`);

      // Add to read notifications set
      readNotificationsRef.current.add(notificationId);
      console.log('Updated read notifications set:', Array.from(readNotificationsRef.current));

      // Save to localStorage
      const notificationsArray = Array.from(readNotificationsRef.current);
      console.log('Saving to localStorage:', notificationsArray);
      localStorage.setItem('mentorReadNotifications', JSON.stringify(notificationsArray));

      // Remove from current notifications
      setNotifications(prevNotifications =>
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
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
              <p className="text-gray-500">No unread notifications at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`border rounded-lg p-6 ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start justify-between">
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
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50"
                    >
                      Mark as Read
                    </button>
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