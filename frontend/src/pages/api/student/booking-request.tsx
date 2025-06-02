

export default function BookingRequestPage() {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-blue-700 mb-4">Booking Request</h1>
          <p className="text-gray-700 mb-2">📅 <strong>Tuesday 1st April</strong></p>
          <p className="text-gray-700 mb-2">🕒 <strong>11am–12pm</strong></p>
          <p className="text-gray-700 mb-6">👤 Student: <strong>John Smith</strong></p>

          <div className="flex justify-center gap-4">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Confirm
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  }
