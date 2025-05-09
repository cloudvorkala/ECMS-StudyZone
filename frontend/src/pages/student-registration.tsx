import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';

export default function StudentRegistration() {
  const router = useRouter();
  // State variables for each input
  const [fullName, setFullName] = useState<string>('');
  const [emailLocalPart, setEmailLocalPart] = useState<string>(''); // local part only
  const [phone, setPhone] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Validation patterns
  const emailPattern = /^[a-zA-Z]{1,5}[0-9]{1,6}$/; // 1-5 letters followed by 1-6 digits
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{1,20}$/; // 1-20 chars, must contain both letters and digits
  const studentIdPattern = /^\d{8}$/; // 8 digits

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate local part
    if (!emailPattern.test(emailLocalPart)) {
      setError('Email must be 1-5 letters followed by 1-6 digits (e.g., abcd123456).');
      setLoading(false);
      return;
    }
    const email = `${emailLocalPart}@autuni.ac.nz`;

    // Validate password
    if (!passwordPattern.test(password)) {
      setError('Password must be 1-20 characters and contain both letters and numbers (e.g., abc123).');
      setLoading(false);
      return;
    }

    // Validate student ID
    if (!studentIdPattern.test(studentId)) {
      setError('Student ID must be 8 digits.');
      setLoading(false);
      return;
    }

    // Prepare data for API
    const data = {
      fullName,
      email,
      phone,
      studentId,
      password,
    };

    try {
      const response = await api.post('/users/register/student', data);

      if (response.status === 201) {
        alert('Registration successful! You can now login.');
        router.push('/');
      }
    } catch (error: unknown) {
      console.error('Registration error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message: string } } };
        setError(axiosError.response?.data?.message || 'An error occurred during registration');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4">Student Registration</h2>
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
              placeholder="Email (e.g., abcd123456)"
              value={emailLocalPart}
              onChange={(e) => setEmailLocalPart(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              pattern="[a-zA-Z]{1,5}[0-9]{1,6}"
              title="1-5 letters followed by 1-6 digits"
              required
            />
            <span className="px-3 bg-gray-100 text-gray-700 text-sm rounded-r select-none">
              @autuni.ac.nz
            </span>
          </div>

          {/* Student ID */}
          <input
            type="text"
            placeholder="Student ID (8 digits)"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            pattern="\d{8}"
            title="8 digits"
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password (must contain both letters and numbers)"
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
  );
}