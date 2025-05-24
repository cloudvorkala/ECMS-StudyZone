// ✅ src/pages/student/study-room-booking.tsx
import React, { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = ['09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00'];
const meetingRooms = Array.from({ length: 10 }, (_, i) => ({
  name: `WZ-${100 + i + 1}`, // e.g., WZ-101, WZ-102 ...
}));

type BookingStatus = {
  [roomName: string]: {
    [day: string]: {
      [time: string]: boolean; // true = booked
    };
  };
};

// 🔧 Fake some rooms as booked
const generateMockBookings = (): BookingStatus => {
  const status: BookingStatus = {};
  meetingRooms.forEach(room => {
    status[room.name] = {};
    weekdays.forEach(day => {
      status[room.name][day] = {};
      timeSlots.forEach(slot => {
        // Randomly mark some slots as booked
        const isBooked = Math.random() < 0.2; // ~20% chance
        status[room.name][day][slot] = isBooked;
      });
    });
  });
  return status;
};

export default function StudyRoomBookingPage() {
  const [bookings] = useState<BookingStatus>(generateMockBookings());

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-blue-700 mb-6">🏫 Book a Meeting Room in WZ Building</h1>

          <div className="space-y-8">
            {weekdays.map(day => (
              <div key={day}>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{day}</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm text-left text-gray-700">
                    <thead>
                      <tr>
                        <th className="border px-3 py-2">Room</th>
                        {timeSlots.map(slot => (
                          <th key={slot} className="border px-3 py-2">{slot}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {meetingRooms.map(room => (
                        <tr key={room.name}>
                          <td className="border px-3 py-2 font-medium">{room.name}</td>
                          {timeSlots.map(slot => {
                            const isBooked = bookings[room.name][day][slot];
                            return (
                              <td key={slot} className="border px-3 py-2 text-center">
                                {isBooked ? (
                                  <span className="text-red-500">❌ Unavailable</span>
                                ) : (
                                  <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                                    Book
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Weekend Message */}
          <div className="mt-10 text-center text-gray-500 italic">
            🚫 No bookings available on Saturday and Sunday.
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
