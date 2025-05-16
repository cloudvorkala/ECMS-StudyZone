// ✅ frontend/src/pages/student/study-room-booking.tsx
import React, { useState } from 'react';

const mockRooms = [
  { id: 1, room: 'Library Room A', available: true },
  { id: 2, room: 'Library Room B', available: false },
  { id: 3, room: 'Engineering Block Room 302', available: true },
];

export default function StudyRoomBookingPage() {
  const [rooms, setRooms] = useState(mockRooms);

  const handleBook = (id: number) => {
    alert(`✅ Room ${id} booked successfully! (mock only)`);
    setRooms(prev => prev.map(r => r.id === id ? { ...r, available: false } : r));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">🏫 Study Room Booking</h1>
        <ul className="space-y-4">
          {rooms.map(room => (
            <li key={room.id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-lg">{room.room}</h2>
                <p className="text-sm text-gray-600">
                  {room.available ? 'Available today 10AM - 5PM' : 'Currently booked'}
                </p>
              </div>
              <button
                disabled={!room.available}
                onClick={() => handleBook(room.id)}
                className={`px-4 py-2 rounded text-white ${
                  room.available ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {room.available ? 'Book Now' : 'Booked'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
