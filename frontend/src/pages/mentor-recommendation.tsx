// ✅ src/pages/mentor-recommendation.tsx
import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

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

export default function MentorRecommendationPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'availability'>('rating');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await api.get<Mentor[]>('/users/mentors');
      const sorted = response.data.sort((a, b) => b.rating - a.rating);
      setMentors(sorted);
      setFilteredMentors(sorted);
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

  const handleMentorSelect = async (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setSelectedTimeSlot(null);
    setRating(0);
    await fetchTimeSlots(mentor._id);
  };

  const handleBooking = async () => {
    if (!selectedMentor || !selectedTimeSlot) {
      setError('Please select a mentor and time slot');
      return;
    }

    try {
      await api.post('/bookings', {
        mentorId: selectedMentor._id,
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        notes
      });

      setSuccess('Booking request sent successfully!');
      setSelectedMentor(null);
      setSelectedTimeSlot(null);
      setNotes('');
      setTimeSlots([]);
    } catch (err) {
      setError('Failed to create booking');
      console.error('Error creating booking:', err);
    }
  };

  const handleRatingSubmit = async () => {
    if (!selectedMentor || rating === 0) {
      setError('Please select a mentor and rating before submitting');
      return;
    }

    try {
      await api.post('/ratings', {
        mentorId: selectedMentor._id,
        rating
      });

      setSuccess('Rating submitted successfully!');
      setRating(0);
      await fetchMentors();
    } catch (err) {
      setError('Failed to submit rating');
      console.error('Rating error:', err);
    }
  };

  const handleExpertiseFilter = (value: string) => {
    setSelectedExpertise(value);
    const filtered = mentors.filter(m =>
      m.expertise.join(', ').toLowerCase().includes(value.toLowerCase()) &&
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMentors(filtered);
  };

  const handleSortChange = (value: 'rating' | 'availability') => {
    setSortBy(value);
    const sorted = [...filteredMentors];
    if (value === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else {
      // availability sort logic placeholder
    }
    setFilteredMentors(sorted);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const filtered = mentors.filter(m =>
      m.fullName.toLowerCase().includes(value.toLowerCase()) &&
      m.expertise.join(', ').toLowerCase().includes(selectedExpertise.toLowerCase())
    );
    setFilteredMentors(filtered);
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

  const majorOptions = [
    'Software Engineering',
    'Data Science',
    'Cybersecurity',
    'Artificial Intelligence',
    'Information Systems',
    'Computer Science',
    'Mathematics',
    'Physics',
    'Business Analytics',
    'Electrical Engineering'
  ];

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-blue-700">🌟 Recommended Mentors</h1>

          <div className="flex flex-wrap gap-4 items-center mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Sort by:</label>
              <select
                className="p-2 border rounded"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'rating' | 'availability')}
              >
                <option value="rating">Rating</option>
                <option value="availability">Time Available</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course/Major:</label>
              <select
                className="p-2 border rounded"
                value={selectedExpertise}
                onChange={(e) => handleExpertiseFilter(e.target.value)}
              >
                <option value="">All</option>
                {majorOptions.map((m, i) => (
                  <option key={i} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">🔍 Search name:</label>
              <input
                type="text"
                placeholder="e.g. mentor name"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="p-2 border rounded"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>
          )}

          {loading ? (
            <div className="text-center py-4">Loading mentors...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map(mentor => (
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
                  {timeSlots.map(slot => (
                    <div
                      key={slot._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTimeSlot?._id === slot._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setSelectedTimeSlot(slot)}
                    >
                      <p className="font-medium">
                        {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                      </p>
                    </div>
                  ))}
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

              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Rate This Mentor</h2>
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl cursor-pointer ${
                        star <= rating ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{rating} star(s)</span>
                </div>
                <button
                  onClick={handleRatingSubmit}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}