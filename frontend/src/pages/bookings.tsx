//  src/pages/bookings.tsx
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/router';

interface MentorBooking {
  id: number;
  mentorName: string;
  startTime: string;
  endTime: string;
  completed?: boolean;
  rated?: boolean;
  feedback?: string;
  rating?: number;
  expertise?: string;
  averageRating?: number;
}

interface RoomBooking {
  id: number;
  room: string;
  date: string;
  slot: string;
  completed?: boolean;
}

export default function StudentBookingsPage() {
  const [tokenPresent, setTokenPresent] = useState(false);
  const [mentorBookings, setMentorBookings] = useState<MentorBooking[]>([]);
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
  const [ratingInput, setRatingInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [showFeedbackBox, setShowFeedbackBox] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setTokenPresent(!!token);

    setMentorBookings([
      {
        id: 1,
        mentorName: 'Dr. Alice Wang',
        startTime: '2025-05-28T09:00:00Z',
        endTime: '2025-05-28T10:00:00Z',
        completed: true,
        rated: false,
      },
      {
        id: 2,
        mentorName: 'Prof. John Smith',
        startTime: '2025-06-02T11:00:00Z',
        endTime: '2025-06-02T12:00:00Z',
        completed: false,
      },
      {
        id: 3,
        mentorName: 'Dr. Emily Tan',
        expertise: 'Cybersecurity',
        averageRating: 4.9,
        startTime: '2025-06-05T15:00:00Z',
        endTime: '2025-06-05T16:00:00Z',
        completed: false,
      },
    ]);

    setRoomBookings([
      {
        id: 1,
        room: 'WZ-103',
        date: '2025-05-29',
        slot: '13:00 - 15:00',
        completed: true,
      },
      {
        id: 2,
        room: 'WZ-201',
        date: '2025-06-04',
        slot: '09:00 - 11:00',
        completed: false,
      },
    ]);
  }, []);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('en-NZ', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleCancelMentor = (id: number) => {
    setMentorBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleCancelRoom = (id: number) => {
    setRoomBookings(prev => prev.filter(r => r.id !== id));
  };

  const goToEditMentor = () => {
    sessionStorage.setItem('fromBookings', 'true');
    router.push('/mentor-recommendation');
  };

  const goToEditRoom = () => {
    sessionStorage.setItem('fromBookings', 'true');
    router.push('/student/study-room-booking');
  };

  const goToEditTime = () => {
    sessionStorage.setItem('fromBookings', 'true');
    router.push('/student/mentor-calendar');
  };

  const handleRateSubmit = (id: number) => {
    setMentorBookings(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, rated: true, rating: ratingInput, feedback: feedbackInput }
          : b
      )
    );
    setRatingInput(0);
    setFeedbackInput('');
    setShowFeedbackBox(null);
  };

  const completedMentor = mentorBookings.filter(b => b.completed);
  const upcomingMentor = mentorBookings.filter(b => !b.completed);
  const completedRoom = roomBookings.filter(r => r.completed);
  const upcomingRoom = roomBookings.filter(r => !r.completed);

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">📋 My Bookings</h1>

          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
            <p><strong>🔐 Token Status:</strong> {tokenPresent ? 'Present ✅' : 'Missing ❌'}</p>
            <p><strong>👨‍🏫 Mentor Bookings:</strong> {mentorBookings.length}</p>
            <p><strong>🏫 Room Bookings:</strong> {roomBookings.length}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Mentor Bookings */}
            <div>
              <h2 className="text-lg font-semibold text-orange-700 mb-2">⏳ Upcoming Mentor Sessions</h2>
              {upcomingMentor.map(b => (
                <div key={b.id} className="p-3 bg-white border rounded mb-4">
                  <p><strong>Mentor:</strong> {b.mentorName}</p>
                  {b.expertise && <p><strong>Expertise:</strong> {b.expertise}</p>}
                  {b.averageRating && <p><strong>Rating:</strong> ⭐ {b.averageRating.toFixed(1)}</p>}
                  <p><strong>Time:</strong> {formatTime(b.startTime)} – {formatTime(b.endTime)}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={goToEditMentor} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit Mentor</button>
                    <button onClick={goToEditTime} className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600">Edit Time</button>
                    <button onClick={() => handleCancelMentor(b.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
                  </div>
                </div>
              ))}

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
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-green-600">
                      ✅ Thank you for your feedback: &quot;{b.feedback}&quot; (Rating: {b.rating}/5)
                    </div>
                  )}
                  {showFeedbackBox === b.id && (
                    <div className="mt-4 p-3 border border-green-300 bg-green-50 rounded">
                      <p className="text-sm font-semibold mb-1">📝 Leave a message to help mentors improve:</p>
                      <textarea
                        value={feedbackInput}
                        onChange={(e) => setFeedbackInput(e.target.value)}
                        rows={3}
                        className="w-full p-2 border rounded mb-2"
                      />
                      <button
                        onClick={() => handleRateSubmit(b.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Room Bookings */}
            <div>
              <h2 className="text-lg font-semibold text-orange-700 mb-2">⏳ Upcoming Meeting Rooms</h2>
              {upcomingRoom.map(r => (
                <div key={r.id} className="p-3 bg-white border rounded mb-4">
                  <p><strong>Room:</strong> {r.room}</p>
                  <p><strong>Date:</strong> {r.date}</p>
                  <p><strong>Time Slot:</strong> {r.slot}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={goToEditRoom} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                    <button onClick={() => handleCancelRoom(r.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
                  </div>
                </div>
              ))}

              <h2 className="text-lg font-semibold text-green-700 mt-8 mb-2">✅ Completed Meeting Rooms</h2>
              {completedRoom.map(r => (
                <div key={r.id} className="p-3 bg-gray-50 border rounded mb-4">
                  <p><strong>Room:</strong> {r.room}</p>
                  <p><strong>Date:</strong> {r.date}</p>
                  <p><strong>Time Slot:</strong> {r.slot}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}