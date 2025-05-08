import React from 'react';

type TimeSlot = {
  id: number;
  start: string;
  end: string;
};

const mockSlots: TimeSlot[] = [
  { id: 1, start: '09:00 AM', end: '10:00 AM' },
  { id: 2, start: '11:00 AM', end: '12:00 PM' },
];

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-4 text-indigo-600">📅 Session Time Suggestions</h1>
        <ul className="space-y-2">
          {mockSlots.map(slot => (
            <li key={slot.id} className="p-3 border rounded">
              {slot.start} - {slot.end}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
