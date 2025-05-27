import React from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MentorProfile() {
  // Retrieve profile data including mentor details
  const profileData = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem('user') || '{}') : {};

  // Static average rating for now
  const averageRating = 4.0; 

  /* UN-COMMENT WHEN COMPLETE: Generate stars for visual rating
  const fullStars = Math.floor(averageRating);
  const halfStar = averageRating % 1 !== 0 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  */

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
          {/* Profile Header */}
          <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">
            Mentor Profile
          </h1>
          
          {/* Profile Basic Info */}
          <div className="space-y-2 mb-4">
            <p><strong>Full Name:</strong> {profileData.fullName || 'Not provided'}</p>
            <p><strong>Email:</strong> {profileData.email || 'Not provided'}</p>
            <p><strong>Role:</strong> {profileData.role || 'Not provided'}</p>
          </div>

          {/* Additional Mentor Details */}
          <div className="space-y-2 mb-4">
            <p><strong>Degree:</strong> {profileData.degree || 'Not provided'}</p>
            <p><strong>Specialty Courses:</strong> {profileData.specialty || 'Not provided'}</p>
            <p><strong>Expertise Areas:</strong> {profileData.expertise?.join(', ') || 'Not provided'}</p>
            <p><strong>Institution:</strong> {profileData.institution || 'Not provided'}</p>
          </div>

          {/* Average Rating Display */}
          <div className="mb-4 text-center">
            <p className="text-lg font-semibold text-gray-800 mb-1">Average Rating</p>
            <div className="flex justify-center items-center mx-auto">
              {/* Number and Star Emoji */}
              <span className="text-3xl font-bold text-purple-600">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-3xl ml-2 text-yellow-500">⭐</span>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="mt-4">
            <Link href="/mentor/editprofile" passHref>
              <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
