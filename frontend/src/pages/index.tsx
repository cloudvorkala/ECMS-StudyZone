import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/services/api';

interface UserData {
  id: string;
  email: string;
  role: string;
  fullName?: string;
}

interface ApiErrorResponse {
  message: string;
  statusCode?: number;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  const validateEmail = (email: string) => {
    if (role === 'student' || role === 'mentor') {
      return /^[a-zA-Z]{1,5}\d{1,6}$/.test(email);
    } else if (role === 'admin') {
      return /^[a-zA-Z]+\.[a-zA-Z]+$/.test(email);
    }
    return false;
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{1,20}$/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo('');
    setLoading(true);

    if (!validateEmail(email)) {
      setError('❌ Invalid email format for selected role.');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('❌ Password must be 1-20 characters and contain both letters and numbers.');
      setLoading(false);
      return;
    }

    try {
      const fullEmail = `${email}@autuni.ac.nz`;
      console.log('Attempting login with:', { email: fullEmail, role });
      setDebugInfo(prev => prev + '\nAttempting login...');

      const response = await api.post<{ token: string; user: UserData }>('/auth/login', {
        email: fullEmail,
        password,
        role,
      });

      console.log('Login successful, response:', response.data);
      setDebugInfo(prev => prev + '\nLogin successful');

      // Store token and user data in sessionStorage
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));

      console.log('Stored token and user data in sessionStorage');
      setDebugInfo(prev => prev + '\nStored user data: ' + JSON.stringify(response.data.user));

      console.log('User role from response:', response.data.user.role);
      setDebugInfo(prev => prev + '\nUser role: ' + response.data.user.role);

      console.log('Redirecting to:', `/${response.data.user.role}/dashboard`);
      setDebugInfo(prev => prev + '\nRedirecting to: /' + response.data.user.role + '/dashboard');

      // 添加延迟，以便查看日志
      setTimeout(() => {
        router.push(`/${response.data.user.role}/dashboard`);
      }, 2000);
    } catch (error: unknown) {
      console.error('Login error details:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiErrorResponse } };
        const errorMessage = axiosError.response?.data?.message || 'Login failed. Please check your credentials.';
        console.error('Server error response:', axiosError.response?.data);
        setError(`❌ ${errorMessage}`);
        setDebugInfo(prev => prev + '\nError: ' + errorMessage);
      } else {
        setError('❌ Login failed. Please check your credentials.');
        setDebugInfo(prev => prev + '\nUnknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-wide text-blue-700">ECMS</h1>
          <h2 className="text-2xl font-bold mt-2">StudyZone Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border border-gray-300 rounded">
            <input
              type="text"
              placeholder="Email local part"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-2 outline-none rounded-l"
              required
              disabled={loading}
            />
            <span className="px-3 bg-gray-100 text-gray-700 text-sm rounded-r select-none">
              @autuni.ac.nz
            </span>
          </div>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
            disabled={loading}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 text-sm text-center rounded">
            {error}
          </div>
        )}

        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 text-gray-700 text-xs font-mono whitespace-pre-wrap">
            {debugInfo}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 mt-4 space-y-2">
          <p>
            New student?{' '}
            <Link
              href="/student-registration"
              className="text-blue-600 hover:underline"
            >
              Register here
            </Link>
          </p>
          <p>
            New mentor?{' '}
            <Link
              href="/mentor-registration"
              className="text-blue-600 hover:underline"
            >
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

