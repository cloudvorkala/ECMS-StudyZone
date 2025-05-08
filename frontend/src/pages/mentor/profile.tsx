import React from 'react';
import Link from 'next/link';

export default function MentorProfile() {
  // Retrieve profile data from localStorage
  const profileData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mentorProfile') || '{}') : {};

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Mentor Profile</h1>

        {/* Display Profile Data */}
        <div className="w-full space-y-2 mb-4">
          <p><strong>Degree Type:</strong> {profileData.degreeType || 'Not provided'}</p>
          <p><strong>Degree:</strong> {profileData.degree || 'Not provided'}</p>
          <p><strong>Major:</strong> {profileData.major || 'Not provided'}</p>
          <p><strong>Current Year of Study:</strong> {profileData.currentYear || 'Not provided'}</p>
          <p><strong>Courses Studied:</strong> {profileData.coursesStudied || 'Not provided'}</p>
          <p><strong>Other Relevant Info:</strong> {profileData.otherInfo || 'Not provided'}</p>
        </div>

        {/* Edit Profile Button */}
        <Link href="/mentor/editprofile" passHref>
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Edit Profile
          </button>
        </Link>
      </div>
    </div>
  );
}
