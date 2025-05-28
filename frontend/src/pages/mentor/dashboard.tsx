import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedSessions: number;
  averageRating: number;
}

interface RecentBooking {
  _id: string;
  student: {
    fullName: string;
    email: string;
  };
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export default function MentorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedSessions: 0,
    averageRating: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, bookingsResponse] = await Promise.all([
        api.get<DashboardStats>('/bookings/mentor/stats'),
        api.get<RecentBooking[]>('/bookings/mentor/recent')
      ]);
      setStats(statsResponse.data);
      setRecentBookings(bookingsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NZ', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    console.log('MentorDashboard - Logging out...');
    // Clear token and user data from sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    console.log('MentorDashboard - Cleared session storage');
    // Redirect to the index login page
    router.push('/');
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-100 flex p-8">
        {/* Left Panel: Navigation */}
        <div className="w-1/4 space-y-4">
          <Link href="/calendar" className="block p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
            📆 Manage Availability
          </Link>
          <Link href="/bookings" className="block p-4 bg-yellow-100 rounded-lg hover:bg-yellow-200">
            📋 View Bookings
          </Link>
          <Link href="/mentor/groups" className="block p-4 bg-green-100 rounded-lg hover:bg-green-200">
            👥 Study Groups
          </Link>
          <Link href="/notifications" className="block p-4 bg-purple-100 rounded-lg hover:bg-purple-200">
            🔔 Notifications
          </Link>
          {/* New Booking Requests Button */}
          <Link href="/mentor/booking-requests" className="block p-4 bg-orange-100 rounded-lg hover:bg-orange-200">
            📩 Booking Requests
          </Link>
          {/* Profile Button */}
          <Link href="/mentor/profile" className="block p-4 bg-gray-300 rounded-lg hover:bg-gray-400">
            🙍‍♂️ Profile
          </Link>
          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="w-full p-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            🚪 Log Out
          </button>
        </div>

        {/* Right Panel: Welcome Content and Stats */}
        <div className="flex-1 ml-10">
          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h1 className="text-2xl font-bold text-blue-700 mb-4">Welcome, Mentor!</h1>
            <p className="text-gray-700">
              Thank you for supporting students. You can manage your schedule, approve session requests,
              and provide group study support. Check your availability and notifications regularly!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {loading ? (
              <div className="col-span-4 text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading statistics...</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Bookings</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Bookings</h3>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed Sessions</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.completedSessions}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Rating</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.averageRating.toFixed(1)} ⭐</p>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/calendar" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="font-medium text-blue-700">📅 Set Available Hours</h3>
                <p className="text-sm text-gray-600">Update your weekly availability</p>
              </Link>
              <Link href="/mentor/booking-requests" className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <h3 className="font-medium text-yellow-700">📝 Review Requests</h3>
                <p className="text-sm text-gray-600">Check new booking requests</p>
              </Link>
              <Link href="/mentor/groups" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="font-medium text-green-700">👥 Manage Groups</h3>
                <p className="text-sm text-gray-600">Create or join study groups</p>
              </Link>
              <Link href="/mentor/profile" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="font-medium text-purple-700">👤 Update Profile</h3>
                <p className="text-sm text-gray-600">Edit your expertise and information</p>
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white p-6 rounded-xl shadow-md mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Bookings</h2>
              <Link href="/bookings" className="text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading bookings...</p>
              </div>
            ) : recentBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent bookings</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map(booking => (
                  <div key={booking._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.student.fullName}</h3>
                        <p className="text-sm text-gray-600">{booking.student.email}</p>
                        <p className="mt-2">
                          <span className="font-medium">Time:</span>{' '}
                          {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                        </p>
                        {booking.notes && (
                          <p className="mt-1 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Voice Chat Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Voice Chat</h3>
            <p className="text-gray-600 mb-4">Join voice chat rooms for real-time communication with students.</p>
            <Link href="/voice-chat" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Go to Voice Chat
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}