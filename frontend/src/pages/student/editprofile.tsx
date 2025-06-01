import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

interface StudentProfile {
  fullName: string;
  email: string;
  phone: string;
  degree: string;
  major: string;
  year: string;
  institution: string;
  interests: string[];
}

interface ErrorResponse {
  data?: {
    message?: string;
  };
}

export default function StudentEditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<StudentProfile>({
    fullName: '',
    email: '',
    phone: '',
    degree: '',
    major: '',
    year: '',
    institution: '',
    interests: []
  });

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = sessionStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setProfile({
            fullName: parsedData.fullName || '',
            email: parsedData.email || '',
            phone: parsedData.phone || '',
            degree: parsedData.degree || '',
            major: parsedData.major || '',
            year: parsedData.year || '',
            institution: parsedData.institution || '',
            interests: parsedData.interests || []
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const interestsArray = e.target.value.split(',').map(item => item.trim());
    setProfile(prev => ({
      ...prev,
      interests: interestsArray
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put('/users/student/profile', {
        fullName: profile.fullName,
        phone: profile.phone,
        degree: profile.degree,
        major: profile.major,
        year: profile.year,
        institution: profile.institution,
        interests: profile.interests
      });

      // Update session storage with new data
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        sessionStorage.setItem('user', JSON.stringify({
          ...parsedData,
          ...profile
        }));
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 2000);
    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error && 'response' in err
        ? (err.response as ErrorResponse)?.data?.message || 'Failed to update profile. Please try again.'
        : 'Failed to update profile. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

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
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            <h1 className="text-2xl font-bold text-blue-700 mb-6">Edit Profile</h1>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={profile.degree}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                <input
                  type="text"
                  name="major"
                  value={profile.major}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                <select
                  name="year"
                  value={profile.year}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                  <option value="5+">Fifth Year or Above</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <input
                  type="text"
                  name="institution"
                  value={profile.institution}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Interest</label>
                <textarea
                  name="interests"
                  value={profile.interests.join(', ')}
                  onChange={handleInterestsChange}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                  required
                  placeholder="Enter your areas of interest (comma-separated)"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/student/dashboard')}
                  className="px-4 py-2 border border-gray-400 text-gray-600 rounded hover:bg-gray-100"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}