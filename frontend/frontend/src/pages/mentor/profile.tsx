import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MentorProfile() {
  // Retrieve profile data from sessionStorage
  const profileData = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || '{}') : {};

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg flex flex-col items-center">
          <h1 className="text-2xl font-bold text-blue-700 mb-4">Mentor Profile</h1>

          {/* Display Profile Data */}
          <div className="w-full space-y-2 mb-4">
            <p><strong>Full Name:</strong> {profileData.fullName || 'Not provided'}</p>
            <p><strong>Email:</strong> {profileData.email || 'Not provided'}</p>
            <p><strong>Role:</strong> {profileData.role || 'Not provided'}</p>
          </div>

          {/* Edit Profile Button */}
          <Link href="/mentor/editprofile" passHref>
            <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Edit Profile
            </button>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
