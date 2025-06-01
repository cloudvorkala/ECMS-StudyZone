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
  readBy: string[];
}

type NotificationType = Notification['type'];

export default function AdminNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    type: 'announcement' as NotificationType,
    endDate: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get<Notification[]>('/notifications');
      setNotifications(response.data);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Format the date if it exists
      let formattedEndDate = undefined;
      if (newNotification.endDate) {
        const date = new Date(newNotification.endDate);
        console.log('Original date:', newNotification.endDate);
        console.log('Parsed date:', date);
        console.log('Is valid date:', !isNaN(date.getTime()));
        formattedEndDate = date.toISOString();
      }

      const notificationData = {
        title: newNotification.title,
        content: newNotification.content,
        type: newNotification.type,
        endDate: formattedEndDate
      };

      console.log('Sending notification data:', JSON.stringify(notificationData, null, 2));

      const response = await api.post<Notification>('/notifications', notificationData);

      setNotifications([response.data, ...notifications]);
      setShowCreateForm(false);
      setNewNotification({
        title: '',
        content: '',
        type: 'announcement',
        endDate: ''
      });
    } catch (err) {
      if (err instanceof Error) {
        const errorData = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
        const errorMessage = errorData?.message || 'Failed to create notification';
        setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
        console.error('Error creating notification:', errorData);
      } else {
        setError('An unexpected error occurred');
        console.error('Unexpected error:', err);
      }
    }
  };

  const handleDeactivate = async (notificationId: string) => {
    try {
      console.log('Deactivating notification:', notificationId);
      const response = await api.delete(`/notifications/${notificationId}`);
      console.log('Deactivation response:', response);
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Error deactivating notification:', err);
      if (err instanceof Error) {
        const errorData = (err as { response?: { data?: { message?: string | string[] } } }).response?.data;
        const errorMessage = errorData?.message || 'Failed to deactivate notification';
        setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      } else {
        setError('An unexpected error occurred while deactivating the notification');
      }
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
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

  const getNotificationColor = (type: NotificationType) => {
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
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Manage Notifications</h1>
            <div className="space-x-4">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showCreateForm ? 'Cancel' : 'Create New Notification'}
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Create New Notification</h2>
              <form onSubmit={handleCreateNotification} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={newNotification.content}
                    onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as NotificationType })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="update">Update</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                  <input
                    type="datetime-local"
                    value={newNotification.endDate}
                    onChange={(e) => setNewNotification({ ...newNotification, endDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Notification
                </button>
              </form>
            </div>
          )}

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
              <p className="text-gray-500">No notifications found.</p>
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
                          <p>Status: {notification.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                      </div>
                    </div>
                    {notification.isActive && (
                      <button
                        onClick={() => handleDeactivate(notification._id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 border border-red-300 rounded-full hover:bg-red-200"
                      >
                        Deactivate
                      </button>
                    )}
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