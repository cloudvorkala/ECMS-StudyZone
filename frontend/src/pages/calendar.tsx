import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

interface TimeSlot {
  _id: string;
  startTime: string;
  endTime: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function CalendarPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchTimeSlots();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      setDebugInfo('Fetching time slots...');
      const token = sessionStorage.getItem('token');
      setDebugInfo(prev => `${prev}\nToken: ${token ? 'Present' : 'Missing'}`);

      const response = await api.get<TimeSlot[]>('/calendar/mentor');
      setDebugInfo(prev => `${prev}\nResponse received: ${JSON.stringify(response.data)}`);

      setTimeSlots(response.data);
      setError('');
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch time slots';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}\nFull error: ${JSON.stringify(error)}`);
      console.error('Error fetching time slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = new Date(selectedDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(selectedDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);

    if (startDateTime >= endDateTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      setDebugInfo('Adding new time slot...');
      const response = await api.post('/calendar', {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });
      setDebugInfo(prev => `${prev}\nTime slot added: ${JSON.stringify(response.data)}`);
      await fetchTimeSlots();
      setError('');
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add time slot';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}\nFull error: ${JSON.stringify(error)}`);
      console.error('Error adding time slot:', error);
    }
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    try {
      setDebugInfo(`Deleting time slot ${slotId}...`);
      await api.delete(`/calendar/${slotId}`);
      setDebugInfo(prev => `${prev}\nTime slot deleted successfully`);
      await fetchTimeSlots();
      setError('');
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete time slot';
      setError(errorMessage);
      setDebugInfo(prev => `${prev}\nError: ${errorMessage}\nFull error: ${JSON.stringify(error)}`);
      console.error('Error deleting time slot:', error);
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
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-blue-700">📆 Manage Availability</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Debug Information */}
          <div className="mb-4 p-3 bg-gray-100 text-gray-700 rounded font-mono text-sm">
            <pre>{debugInfo}</pre>
          </div>

          {/* Add Time Slot Form */}
          <form onSubmit={handleAddTimeSlot} className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Add New Time Slot</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Time Slot
            </button>
          </form>

          {/* Time Slots List */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Available Time Slots</h2>
            {loading ? (
              <div className="text-center py-4">Loading time slots...</div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No time slots added yet</div>
            ) : (
              <div className="space-y-4">
                {timeSlots.map(slot => (
                  <div key={slot._id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium">
                        {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTimeSlot(slot._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
