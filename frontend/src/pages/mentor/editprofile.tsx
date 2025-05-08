import React, { useState } from 'react';
import Link from 'next/link';

export default function EditProfile() {
  const [degreeType, setDegreeType] = useState('Bachelors'); // State for dropdown
  const [degree, setDegree] = useState('');
  const [major, setMajor] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [coursesStudied, setCoursesStudied] = useState('');
  const [otherInfo, setOtherInfo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission (e.g., save to database)
    console.log({ degreeType, degree, major, currentYear, coursesStudied, otherInfo });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Dropdown for Degree Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Degree Type</label>
            <select
              value={degreeType}
              onChange={(e) => setDegreeType(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            >
              <option value="Bachelors">Bachelors</option>
              <option value="Masters">Masters</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Degree</label>
            <input
              type="text"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>

          {/* Major */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Major</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>

          {/* Current Year of Study */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Year of Study</label>
            <input
              type="text"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>

          {/* Courses Studied */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Courses Studied</label>
            <input
              type="text"
              value={coursesStudied}
              onChange={(e) => setCoursesStudied(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>

          {/* Other Relevant Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Other Relevant Info</label>
            <textarea
              value={otherInfo}
              onChange={(e) => setOtherInfo(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
              rows={3}
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
      </div>
    </div>
  );
}
