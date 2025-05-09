// pages/mentor-registration.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import PublicRoute from '@/components/PublicRoute';

interface ApiErrorResponse {
  message: string;
}

export default function MentorRegistration() {
  const router = useRouter();
  // State variables for each input
  const [fullName, setFullName] = useState<string>('');
  const [emailLocalPart, setEmailLocalPart] = useState<string>(''); // local part only
  const [phone, setPhone] = useState<string>('');
  const [degree, setDegree] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [password, setPassword] = useState<string>(''); // password
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Validation patterns
  const emailPattern = /^[a-zA-Z]{1,5}[0-9]{1,6}$/; // local part format
  const passwordPattern = /^(?=.*[A-Za-z])[A-Za-z0-9]{1,20}$/; // password rules

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate local part
    if (!emailPattern.test(emailLocalPart)) {
      setError('Email local part must be 1-5 letters followed by 1-6 digits.');
      setLoading(false);
      return;
    }
    const email = `${emailLocalPart}@autuni.ac.nz`;

    // Validate password
    if (!passwordPattern.test(password)) {
      setError('Password must be 1-20 characters, include at least one letter, and contain only letters and digits.');
      setLoading(false);
      return;
    }

    // Prepare data for API
    const data = {
      fullName,
      email,
      phone,
      degree,
      specialty,
      password,
    };

    try {
      const response = await api.post('/users/register/mentor', data);

      if (response.status === 201) {
        alert('Registration successful! Please wait for admin approval.');
        router.push('/');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiErrorResponse } };
        setError(axiosError.response?.data?.message || 'An error occurred during registration');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl">
          <h2 className="text-2xl font-bold mb-4">Mentor Registration</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />

            {/* Email Local Part + dropdown for domain */}
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Email"
                value={emailLocalPart}
                onChange={(e) => setEmailLocalPart(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                pattern="[A-Za-z]{1,5}[0-9]{1,6}"
                title="1-5 letters followed by 1-6 digits"
                required
              />
              <select
                disabled
                className="ml-2 p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
              >
                <option>@autuni.ac.nz</option>
              </select>
            </div>

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />

            {/* Phone Number */}
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />

            {/* Degree */}
            <input
              type="text"
              placeholder="Degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />

            {/* Specialty Courses */}
            <textarea
              placeholder="List your courses you are available to mentor for"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-24"
              required
            />

            {error && (
              <div className="p-2 bg-red-100 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
        </div>
      </div>
    </PublicRoute>
  );
}
