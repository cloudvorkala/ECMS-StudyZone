// ✅ src/pages/api/bookings.tsx
// 预约管理界面：Mentor 或 Student 查看预约列表，支持取消或修改时间

import React, { useState } from 'react';
import BookingCard from '../../components/BookingCard'; // 复用组件（稍后创建）

// 模拟数据，后续可替换为后端API获取
const mockBookings = [
  {
    id: 1,
    name: 'John Smith',
    date: '2025-04-20',
    time: '11:00 AM - 12:00 PM',
    student: 'Alice Johnson',
  },
  {
    id: 2,
    name: 'Jane Doe',
    date: '2025-04-21',
    time: '2:00 PM - 3:00 PM',
    student: 'Michael Lee',
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState(mockBookings);

  const handleCancel = (id: number) => {
    console.log('Cancelled booking ID:', id);
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleReschedule = (id: number) => {
    console.log('Rescheduling booking ID:', id);
    // TODO: 弹出 modal 或重定向至日历页面
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <p className="text-gray-500">You have no current bookings.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <BookingCard
                  booking={booking}
                  onCancel={() => handleCancel(booking.id)}
                  onReschedule={() => handleReschedule(booking.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
