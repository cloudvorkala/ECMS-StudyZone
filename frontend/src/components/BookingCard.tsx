// ✅ src/components/BookingCard.tsx
// 可复用预约卡片组件：用于显示单个预约详情和操作按钮

import React from 'react';

interface Booking {
  id: number;
  name: string;
  date: string;
  time: string;
  student?: string;
}

interface Props {
  booking: Booking;
  onCancel: () => void;
  onReschedule: () => void;
}

const BookingCard: React.FC<Props> = ({ booking, onCancel, onReschedule }) => {
  return (
    <div className="p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-lg font-semibold text-blue-800">{booking.name}</h2>
          <p className="text-sm text-gray-500">Date: {booking.date}</p>
          <p className="text-sm text-gray-500">Time: {booking.time}</p>
          {booking.student && (
            <p className="text-sm text-gray-500">Student: {booking.student}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onCancel}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onReschedule}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
