import React from 'react';

export default function BookingRequests() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-20 p-8"> {/* Added pt-20 for top padding */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg text-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Booking Requests</h1>
        <p className="text-gray-700">
          Booking requests from students will appear here.
        </p>
      </div>
    </div>
  );
}
