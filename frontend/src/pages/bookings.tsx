// ✅ frontend/src/pages/bookings.tsx
import React, { useState } from 'react';

interface Booking {
  id: number;
  name: string;
  time: string;
  rating?: number;
}

const mockBookings: Booking[] = [
  { id: 1, name: 'Mentor A', time: '10:00 AM - 11:00 AM' },
  { id: 2, name: 'Mentor B', time: '2:00 PM - 3:00 PM' },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [ratings, setRatings] = useState<Record<number, number>>({});

  const handleCancel = (id: number) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleRatingChange = (id: number, value: number) => {
    setRatings(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmitRating = (id: number) => {
    const updated = bookings.map(b =>
      b.id === id ? { ...b, rating: ratings[id] } : b
    );
    setBookings(updated);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4 text-red-600">📋 My Bookings</h1>
        <ul className="space-y-6">
          {bookings.map(booking => (
            <li key={booking.id} className="border p-4 rounded shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg text-blue-700">{booking.name}</p>
                  <p className="text-sm text-gray-600">{booking.time}</p>
                  {booking.rating !== undefined && (
                    <p className="text-green-600 text-sm mt-1">⭐ Rated: {booking.rating}/5</p>
                  )}
                </div>
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>

              {/* Rating Section */}
              {booking.rating === undefined && (
                <div className="mt-4">
                  <label className="text-sm font-medium">Rate this mentor:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <select
                      value={ratings[booking.id] || ''}
                      onChange={(e) => handleRatingChange(booking.id, Number(e.target.value))}
                      className="border p-1 rounded"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5].map(score => (
                        <option key={score} value={score}>{score}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSubmitRating(booking.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Submit Rating
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
