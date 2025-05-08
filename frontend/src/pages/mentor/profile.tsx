// src/pages/mentor/profile.tsx
import React from 'react';

export default function MentorProfile() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg flex flex-col items-center">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Mentor Profile</h1>
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Edit Profile
        </button>
      </div>
    </div>
  );
}
