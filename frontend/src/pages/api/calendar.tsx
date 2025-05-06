// ✅ src/pages/api/calendar.tsx
// Calendar 页面：拉取后端时间段 + PATCH 更新可用状态（支持后端同学开发）

import React, { useEffect, useState } from 'react';

interface TimeSlot {
  id: number;
  date: string;
  time: string;
  status: 'available' | 'unavailable' | 'booked';
}

export default function CalendarPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // 从后端加载可用时间段
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch('/api/calendar');
        const data = await res.json();
        setSlots(data);
      } catch (err) {
        console.error('Failed to load slots:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  // 发送 PATCH 请求切换可用状态
  const toggleAvailability = async (id: number) => {
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const updated = await res.json();
      setSlots((prev) =>
        prev.map((slot) => (slot.id === id ? { ...slot, status: updated.status } : slot))
      );
    } catch (err) {
      console.error('Failed to update slot:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">Availability Calendar</h1>

        {loading ? (
          <p className="text-gray-500">Loading time slots...</p>
        ) : (
          <ul className="space-y-4">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className={`p-4 border rounded flex justify-between items-center ${
                  slot.status === 'available'
                    ? 'bg-green-100'
                    : slot.status === 'booked'
                    ? 'bg-red-100 text-gray-500'
                    : 'bg-gray-100'
                }`}
              >
                <div>
                  <p className="font-medium">{slot.date}</p>
                  <p className="text-sm">{slot.time}</p>
                </div>
                {slot.status === 'booked' ? (
                  <span className="text-sm italic">Booked</span>
                ) : (
                  <button
                    onClick={() => toggleAvailability(slot.id)}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    {slot.status === 'available' ? 'Set Unavailable' : 'Set Available'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}