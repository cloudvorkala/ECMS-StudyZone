// ✅ frontend/src/pages/calendar.tsx
import React, { useState } from 'react';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const times = ['9:00 - 11:00 AM', '12:00 - 2:00 PM', '2:00 - 4:00 PM'];

type Slot = {
  day: string;
  time: string;
  confirmed: boolean;
};

const initialSlots: Slot[] = weekdays.flatMap(day =>
  times.map(time => ({ day, time, confirmed: false }))
);

export default function CalendarPage() {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);

  const handleConfirm = (day: string, time: string) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.day === day && slot.time === time ? { ...slot, confirmed: true } : slot
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-indigo-600">📅 Session Time Suggestions</h1>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left bg-gray-200">Time</th>
                {weekdays.map(day => (
                  <th key={day} className="border p-2 bg-gray-100 text-center">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map(time => (
                <tr key={time}>
                  <td className="border p-2 font-medium">{time}</td>
                  {weekdays.map(day => {
                    const slot = slots.find(s => s.day === day && s.time === time);
                    return (
                      <td key={day + time} className="border p-2 text-center">
                        <button
                          disabled={slot?.confirmed}
                          onClick={() => handleConfirm(day, time)}
                          className={`px-3 py-1 text-sm rounded text-white ${
                            slot?.confirmed ? 'bg-green-400 cursor-default' : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          {slot?.confirmed ? '✅ Confirmed' : 'Confirm'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
