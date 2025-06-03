//src/pages/api/student/settings.tsx


import { useState, useEffect } from 'react';
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
}

export default function MentorEditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<MentorProfile>({
    fullName: '',
    email: '',
    phone: '',
    degree: '',
    specialty: '',
    expertise: [],
    institution: ''
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
            specialty: parsedData.specialty || '',
            expertise: parsedData.expertise || [],
            institution: parsedData.institution || ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExpertiseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const expertiseArray = e.target.value.split(',').map(item => item.trim());
    setProfile(prev => ({
      ...prev,
      expertise: expertiseArray
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Send PUT request to backend

    try {
      await api.put('/users/mentor/profile', profile);

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
        router.push('/mentor/profile');
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
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
    <ProtectedRoute allowedRoles={['mentor']}>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty Courses</label>
                <textarea
                  name="specialty"
                  value={profile.specialty}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                  required
                  placeholder="List the courses you are available to mentor for"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Expertise</label>
                <textarea
                  name="expertise"
                  value={profile.expertise.join(', ')}
                  onChange={handleExpertiseChange}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                  required
                  placeholder="Enter your areas of expertise (comma-separated)"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/mentor/profile')}
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
