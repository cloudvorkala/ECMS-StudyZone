// ✅ src/pages/api/bookings.tsx
// 预约管理页面：显示导师或学生的预约列表，并支持取消或调整时间

import React, { useState } from 'react';

const mockBookings = [
  {
    id: 1,
    title: 'Math Tutoring with Alice',
    date: '2025-04-21',
    time: '10:00 AM - 11:00 AM',
    student: 'Alice Johnson',
  },
  {
    id: 2,
    title: 'English Session with Michael',
    date: '2025-04-23',
    time: '2:00 PM - 3:00 PM',
    student: 'Michael Lee',
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);

  const handleCancel = (id: number) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    console.log(`Cancelled booking ID ${id}`);
  };

  const handleReschedule = (id: number) => {
    // 示例：跳转至日历页面或弹窗交互
    console.log(`Reschedule requested for booking ID ${id}`);
    alert('Reschedule feature is under construction.');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <p className="text-gray-500">No current bookings.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((b) => (
              <li key={b.id} className="p-4 border rounded bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-medium text-blue-800">{b.title}</p>
                  <p className="text-sm text-gray-600">{b.date} | {b.time}</p>
                  <p className="text-sm text-gray-500">Student: {b.student}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReschedule(b.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Reschedule
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}