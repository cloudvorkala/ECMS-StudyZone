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
  const [completedMentor, setCompletedMentor] = useState<Array<{
    id: string;
    mentorName: string;
    startTime: string;
    endTime: string;
    rated: boolean;
    rating?: number;
    feedback?: string;
  }>>([]);
  const [ratingInput, setRatingInput] = useState<number>(0);
  const [showFeedbackBox, setShowFeedbackBox] = useState<string | null>(null);

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

        // Set completed mentor sessions
        const completed = response.data
          .filter(booking => booking.status === 'confirmed')
          .map(booking => ({
            id: booking._id,
            mentorName: booking.mentor.fullName,
            startTime: booking.startTime,
            endTime: booking.endTime,
            rated: false
          }));
        setCompletedMentor(completed);
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NZ', {
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
            <div>Loading...</div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-green-700 mt-8 mb-2">✅ Completed Mentor Sessions</h2>
              {completedMentor.map(b => (
                <div key={b.id} className="p-3 bg-gray-50 border rounded mb-4">
                  <p><strong>Mentor:</strong> {b.mentorName}</p>
                  <p><strong>Time:</strong> {formatTime(b.startTime)} – {formatTime(b.endTime)}</p>
                  {!b.rated ? (
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">Rate this mentor:</label>
                      <select
                        value={ratingInput}
                        onChange={(e) => setRatingInput(Number(e.target.value))}
                        className="w-32 border p-1 rounded"
                      >
                        <option value={0}>-- Select --</option>
                        <option value={1}>⭐ 1</option>
                        <option value={2}>⭐ 2</option>
                        <option value={3}>⭐ 3</option>
                        <option value={4}>⭐ 4</option>
                        <option value={5}>⭐ 5</option>
                      </select>
                      <button
                        onClick={() => setShowFeedbackBox(b.id)}
                        disabled={ratingInput === 0}
                        className="ml-3 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      {showFeedbackBox === b.id && (
                        <div className="mt-2">
                          <textarea
                            className="w-full p-2 border rounded"
                            placeholder="Enter your feedback..."
                            rows={3}
                          />
                          <button
                            onClick={() => {
                              // TODO: Submit feedback
                              setShowFeedbackBox(null);
                            }}
                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Submit Feedback
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-green-600">
                      ✅ Thank you for your feedback: &quot;{b.feedback}&quot; (Rating: {b.rating}/5)
                    </div>
                  )}
                </div>
              ))}

              <h2 className="text-lg font-semibold text-blue-700 mt-8 mb-2">📅 Upcoming Bookings</h2>
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
