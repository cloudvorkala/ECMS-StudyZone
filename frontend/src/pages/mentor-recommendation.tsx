import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';
import { useRouter } from 'next/router';

interface Mentor {
  _id: string;
  fullName: string;
  email: string;
  expertise: string[];
  institution: string;
  rating: number;
}

interface TimeSlot {
  _id: string;
  startTime: string;
  endTime: string;
}

interface Booking {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function MentorRecommendationPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get<Mentor[]>('/users/mentors');
      setMentors(response.data);
    } catch (err) {
      setError('Failed to fetch mentors');
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (mentorId: string) => {
    try {
      const response = await api.get<TimeSlot[]>(`/calendar/mentor/${mentorId}`);
      setTimeSlots(response.data);
    } catch (err) {
      setError('Failed to fetch available time slots');
      console.error('Error fetching time slots:', err);
    }
  };

  const fetchBookings = async (mentorId: string) => {
    try {
      const response = await api.get<Booking[]>(`/bookings/mentor/${mentorId}/all`);
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const handleMentorSelect = async (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSelectedTimeSlot(null);
    await Promise.all([
      fetchTimeSlots(mentor._id),
      fetchBookings(mentor._id)
    ]);
  };

  const isTimeSlotBooked = (slot: TimeSlot) => {
    const slotStart = new Date(slot.startTime);
    const slotEnd = new Date(slot.endTime);

    return bookings.some(booking => {
      if (booking.status === 'cancelled') return false;

      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);

      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      );
    });
  };

  const handleBooking = async () => {
    if (!selectedMentor || !selectedTimeSlot) {
      setError('Please select a mentor and time slot');
      return;
    }

    if (isTimeSlotBooked(selectedTimeSlot)) {
      setError('This time slot is already booked');
      return;
    }

    try {
      // Get current user information
      const user = sessionStorage.getItem('user');
      if (!user) {
        throw new Error('User not logged in');
      }

      const userData = JSON.parse(user);

      // Verify if user is a student
      if (userData.role !== 'student') {
        throw new Error('Only students can create bookings');
      }

      const bookingData = {
        mentorId: selectedMentor._id,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        notes: notes || undefined
      };

      await api.post('/bookings', bookingData);

      setSuccess('Booking request sent successfully!');
      setSelectedMentor(null);
      setSelectedTimeSlot(null);
      setNotes('');
      setTimeSlots([]);
      setBookings([]);
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create booking';
      setError(errorMessage);
      console.error('Error creating booking:', error);
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
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-blue-700">🌟 Recommended Mentors</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">Loading mentors...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map(mentor => (
                <div
                  key={mentor._id}
                  className={`bg-white p-6 rounded-xl shadow-md cursor-pointer transition-all ${
                    selectedMentor?._id === mentor._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleMentorSelect(mentor)}
                >
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">{mentor.fullName}</h3>
                  <p className="text-sm text-gray-600 mb-1">Institution: {mentor.institution}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Expertise: {mentor.expertise.join(', ')}
                  </p>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm text-gray-600">{mentor.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedMentor && (
            <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4">Available Time Slots</h2>
              {timeSlots.length === 0 ? (
                <p className="text-gray-500">No available time slots found</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeSlots.map(slot => {
                    const isBooked = isTimeSlotBooked(slot);
                    return (
                      <div
                        key={slot._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTimeSlot?._id === slot._id
                            ? 'border-blue-500 bg-blue-50'
                            : isBooked
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => !isBooked && setSelectedTimeSlot(slot)}
                      >
                        <p className="font-medium">
                          {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                        </p>
                        {isBooked && (
                          <p className="text-sm text-red-500 mt-1">This time slot is booked</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedTimeSlot && (
                <div className="mt-6">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes for the mentor..."
                    className="w-full p-3 border rounded-lg mb-4"
                    rows={3}
                  />
                  <button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Request Booking
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
