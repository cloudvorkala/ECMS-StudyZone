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
      return email === 'admin';
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

      // delay for 2 seconds
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
    <div
      className="min-h-screen flex flex-col justify-center items-center"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="card w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h1 className="section-title text-blue-700 dark:text-blue-400">ECMS</h1>
          <h2 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 0 }}>StudyZone Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center card-input-group bg-transparent">
            <input
              type="text"
              placeholder="Email local part"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input rounded-l"
              required
              disabled={loading}
            />
            <span className="email-suffix px-3 text-sm rounded-r select-none">
              @autuni.ac.nz
            </span>
          </div>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            disabled={loading}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input"
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className={`btn w-full ${loading ? 'btn-disabled' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded-lg text-center text-sm dark:bg-red-900/50 dark:text-red-200">
            {error}
          </div>
        )}

        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 text-gray-700 text-xs font-mono whitespace-pre-wrap rounded-lg dark:bg-gray-700 dark:text-gray-300">
            {debugInfo}
          </div>
        )}

        <div className="text-center text-sm mt-4 space-y-2">
          <p className="text-gray-500 dark:text-gray-400">
            New student?{' '}
            <Link
              href="/student-registration"
              className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Register here
            </Link>
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            New mentor?{' '}
            <Link
              href="/mentor-registration"
              className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

