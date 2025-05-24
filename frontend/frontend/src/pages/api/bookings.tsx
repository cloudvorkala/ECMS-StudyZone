import React, { useState } from 'react';

const mockBookings = [
  { id: 1, name: 'Mentor A', time: '10:00 AM - 11:00 AM' },
  { id: 2, name: 'Mentor B', time: '2:00 PM - 3:00 PM' }
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);

  const handleCancel = (id: number) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4 text-red-600">📋 My Bookings</h1>
        <ul className="space-y-4">
          {bookings.map(booking => (
            <li key={booking.id} className="flex justify-between items-center border p-4 rounded">
              <div>
                <p className="font-semibold">{booking.name}</p>
                <p className="text-sm text-gray-600">{booking.time}</p>
              </div>
              <button
                onClick={() => handleCancel(booking.id)}
                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
