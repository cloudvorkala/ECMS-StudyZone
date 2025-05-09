import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function EditProfile() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Get current user data
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    // Update user data
    const updatedUserData = {
      ...userData,
      fullName,
    };
    // Save to sessionStorage
    sessionStorage.setItem('user', JSON.stringify(updatedUserData));
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.push('/mentor/profile');
    }, 3000);
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
          <h1 className="text-2xl font-bold text-blue-700 mb-4">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
              <Link href="/mentor/profile" passHref>
                <button className="w-full bg-gray-600 text-white p-2 rounded hover:bg-gray-700">
                  Cancel
                </button>
              </Link>
            </div>
          </form>

          {showPopup && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
              Profile updated successfully!
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
