import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

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
  status: 'pending' | 'confirmed' | 'cancelled';
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
      await fetchBookings(); // Refresh the list
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update booking status';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}\nFull error: ${JSON.stringify(error)}`);
      console.error('Error updating booking:', error);
    }
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
          <h1 className="text-2xl font-bold mb-6 text-blue-700">📋 My Bookings</h1>

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
            <div className="text-center py-4">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No bookings found</div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Session with {userRole === 'mentor' ? booking.student.fullName : booking.mentor.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {userRole === 'mentor' ? booking.student.email : booking.mentor.email}
                      </p>
                      <p className="mt-2">
                        <span className="font-medium">Time:</span>{' '}
                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                      </p>
                      {booking.notes && (
                        <p className="mt-1 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {booking.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
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
