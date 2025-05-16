// ✅ frontend/src/pages/settings.tsx
import React, { useState } from 'react';

interface ProfileData {
  fullName: string;
  studentId: string;
  email: string;
  phone: string;
  emergencyContact: string;
  yearOfStudy: string;
  major: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: 'Bonnin Wang',
    studentId: '21152927',
    email: 'bonninw@autuni.ac.nz',
    phone: '',
    emergencyContact: '',
    yearOfStudy: '',
    major: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    alert('✅ Profile updated! (mock only)');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Edit Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">Full Name (readonly)</label>
            <input value={profile.fullName} disabled className="mt-1 block w-full p-2 border rounded bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Student ID (readonly)</label>
            <input value={profile.studentId} disabled className="mt-1 block w-full p-2 border rounded bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">University Email (readonly)</label>
            <input value={profile.email} disabled className="mt-1 block w-full p-2 border rounded bg-gray-100" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded"
              placeholder="e.g. 021 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
            <input
              type="text"
              name="emergencyContact"
              value={profile.emergencyContact}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded"
              placeholder="Name + Phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Year of Study</label>
            <select
              name="yearOfStudy"
              value={profile.yearOfStudy}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded"
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="PG">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Major / Field</label>
            <input
              type="text"
              name="major"
              value={profile.major}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded"
              placeholder="e.g. Software Engineering"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
