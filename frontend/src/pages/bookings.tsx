import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';

interface Booking {
  _id: string;
  student: {
    fullName: string;
    email: string;
  };
  mentor: {
    fullName: string;
    email: string;
  };
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed';
  notes?: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching bookings...');
      const token = sessionStorage.getItem('token');
      setDebugInfo(prev => `${prev}\nToken: ${token ? 'Present' : 'Missing'}`);

      const user = sessionStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        const endpoint = userData.role === 'mentor' ? '/bookings/mentor' : '/bookings/student';
        const response = await api.get<Booking[]>(endpoint);
        setDebugInfo(prev => `${prev}\nResponse received: ${JSON.stringify(response.data)}`);
        setBookings(response.data);
      }
      setError('');
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch bookings';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}\nFull error: ${JSON.stringify(error)}`);
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      setDebugInfo(`Updating booking ${bookingId} status to ${newStatus}...`);
      await api.post(`/bookings/${bookingId}/status`, { status: newStatus });
      setDebugInfo(prev => `${prev}\nStatus updated successfully`);
      await fetchBookings();
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update booking status';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}\nFull error: ${JSON.stringify(error)}`);
      console.error('Error updating booking:', error);
    }
  };

  const handleReschedule = async () => {
    if (!selectedBooking) return;

    try {
      setDebugInfo(`Rescheduling booking ${selectedBooking._id}...`);

      // Get current user information
      const user = sessionStorage.getItem('user');
      if (!user) {
        throw new Error('User not logged in');
      }

      const userData = JSON.parse(user);

      // Verify if user is a student
      if (userData.role !== 'student') {
        throw new Error('Only students can reschedule bookings');
      }

      // Verify if user is the student who made the booking
      if (selectedBooking.student.email !== userData.email) {
        throw new Error('You can only reschedule your own bookings');
      }

      await api.post(`/bookings/${selectedBooking._id}/reschedule`, {
        startTime: newStartTime,
        endTime: newEndTime,
      });

      setDebugInfo(prev => `${prev}\nBooking rescheduled successfully`);
      setIsRescheduleModalOpen(false);
      await fetchBookings();
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reschedule booking';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}\nFull error: ${JSON.stringify(error)}`);
      console.error('Error rescheduling booking:', error);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      setDebugInfo(`Cancelling booking ${bookingId}...`);
      await api.post(`/bookings/${bookingId}/cancel`);
      setDebugInfo(prev => `${prev}\nBooking cancelled successfully`);
      await fetchBookings();
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel booking';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}\nFull error: ${JSON.stringify(error)}`);
      console.error('Error cancelling booking:', error);
    }
  };

  const openRescheduleModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStartTime(booking.startTime);
    setNewEndTime(booking.endTime);
    setIsRescheduleModalOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NZ', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute allowedRoles={['student', 'mentor']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-700">📋 My Bookings</h1>
            {userRole === 'mentor' && (
              <Link
                href="/mentor/dashboard"
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Debug Information */}
          <div className="mb-4 p-3 bg-gray-100 text-gray-700 rounded font-mono text-sm">
            <pre>{debugInfo}</pre>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-blue-700 mt-8 mb-2">📅 All Bookings</h2>
              {bookings.map(booking => (
                <div key={booking._id} className="p-3 bg-gray-50 border rounded mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p><strong>Mentor:</strong> {booking.mentor.fullName}</p>
                      <p><strong>Time:</strong> {formatDateTime(booking.startTime)}</p>
                      <p><strong>Status:</strong> {booking.status}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        booking.status === 'rescheduled' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {userRole === 'mentor' && booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'cancelled')}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {userRole === 'student' && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openRescheduleModal(booking)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancel(booking._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reschedule Modal */}
        <Dialog
          open={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Reschedule Booking
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Start Time</label>
                  <input
                    type="datetime-local"
                    value={newStartTime.slice(0, 16)}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">New End Time</label>
                  <input
                    type="datetime-local"
                    value={newEndTime.slice(0, 16)}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Reschedule
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
