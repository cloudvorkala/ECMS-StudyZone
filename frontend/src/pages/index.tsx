import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const router = useRouter();

  const validateEmail = (email: string) => {
    if (role === 'student' || role === 'mentor') {
      return /^[a-zA-Z]{1,5}\d{1,6}$/.test(email); // ✅ 只验证前缀
    } else if (role === 'admin') {
      return /^[a-zA-Z]+\.[a-zA-Z]+$/.test(email);
    }
    return false;
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{1,20}$/.test(password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('❌ Invalid email format for selected role.');
      return;
    }

    if (!validatePassword(password)) {
      setError('❌ Password must be 1-20 characters and contain both letters and numbers.');
      return;
    }

    try {
      setError('');
      const fullEmail =
        role === 'admin'
          ? `${email}@autuni.ac.nz`
          : `${email}@autuni.ac.nz`;

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, password, role }),
      });

      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();

      localStorage.setItem('token', data.token);
      router.push(`/${role}/dashboard`); // ✅ 不使用 /api 前缀，跳 UI 页面
    } catch (err) {
      setError('❌ Login failed.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-extrabold tracking-wide text-blue-700">ECMS</h1>
          <h2 className="text-2xl font-bold mt-2">StudyZone Login</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center border border-gray-300 rounded">
            <input
              type="text"
              placeholder="Email local part"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 p-2 outline-none rounded-l"
              required
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
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 text-sm text-center rounded">
            {error}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          New mentor?{' '}
          <a href="/api/mentor-registration" className="text-blue-600 hover:underline">
            Apply here
          </a>
        </p>
      </div>
    </div>
  );
}
