import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

interface MentorProfile {
  fullName: string;
  email: string;
  phone: string;
  degree: string;
  specialty: string;
  expertise: string[];
  institution: string;
  role: string;
}

interface ProfileResponse {
  fullName: string;
  email: string;
  phone: string;
  degree: string;
  specialty: string;
  expertise: string[];
  institution: string;
  role: string;
}

export default function MentorProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<MentorProfile>({
    fullName: '',
    email: '',
    phone: '',
    degree: '',
    specialty: '',
    expertise: [],
    institution: '',
    role: ''
  });

  // Static average rating for now
  const averageRating = 4.0;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get<ProfileResponse>('/users/mentor/profile');
        setProfileData(response.data);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/mentor/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-blue-700">
              Mentor Profile
            </h1>
            <div className="w-24"></div> {/* Placeholder element to keep title centered */}
          </div>

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
