import React from 'react';
import { Link } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

const MentorDashboard: React.FC = () => {
  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-purple-700 mb-6">Mentor Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Study Groups */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">Study Groups</h2>
              <p className="text-gray-600 mb-4">Manage your study groups and students.</p>
              <Link
                to="/mentor/groups"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Manage Groups
              </Link>
            </div>

            {/* View Bookings */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-4">View Bookings</h2>
              <p className="text-gray-600 mb-4">View and manage your booking requests.</p>
              <Link
                to="/mentor/bookings"
                className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                View Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MentorDashboard;