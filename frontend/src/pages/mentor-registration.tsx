// pages/mentor-registration.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function MentorRegistration() {
  const router = useRouter();
  // State variables for each input
  const [fullName, setFullName] = useState<string>('');
  const [emailLocalPart, setEmailLocalPart] = useState<string>(''); // local part only
  const [phone, setPhone] = useState<string>('');
  const [degree, setDegree] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [password, setPassword] = useState<string>(''); // password
  const [isLoading, setIsLoading] = useState(false);

  // Validation patterns
  const emailPattern = /^[a-zA-Z]{1,5}[0-9]{1,6}$/; // local part format
  const passwordPattern = /^(?=.*[A-Za-z])[A-Za-z0-9]{1,20}$/; // password rules

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate local part
    if (!emailPattern.test(emailLocalPart)) {
      toast.error('Email local part must be 1-5 letters followed by 1-6 digits.');
      setIsLoading(false);
      return;
    }
    const email = `${emailLocalPart}@autuni.ac.nz`;

    // Validate password
    if (!passwordPattern.test(password)) {
      toast.error('Password must be 1-20 characters, include at least one letter, and contain only letters and digits.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. 注册新用户
      const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          phone,
          degree,
          specialty,
          role: 'mentor'
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        throw new Error(error.message || 'Registration failed');
      }

      // 2. 注册成功后自动登录
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        role: 'mentor'
      });

      if (result?.error) {
        throw new Error('Login failed after registration');
      }

      // 3. 显示成功消息并重定向
      toast.success('Registration successful! Welcome to StudyZone!');
      router.push('/mentor/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            disabled={isLoading}
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
              disabled={isLoading}
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
            disabled={isLoading}
          />

          {/* Phone Number */}
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
            disabled={isLoading}
          />

          {/* Degree */}
          <input
            type="text"
            placeholder="Degree"
            value={degree}
            onChange={(e) => setDegree(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
            disabled={isLoading}
          />

          {/* Specialty Courses */}
          <textarea
            placeholder="List your courses you are available to mentor for"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded h-24"
            disabled={isLoading}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}
