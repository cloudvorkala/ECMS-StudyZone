// ✅ src/pages/api/mentor-registration.tsx
// 导师注册申请页面：填写信息后提交，进入等待审批状态

import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function MentorRegistrationPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    expertise: '',
    institution: '',
    password: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: 替换为后端真实API请求
      console.log('Mentor application submitted:', form);
      setSubmitted(true);
      setTimeout(() => router.push('/'), 2000); // 2秒后跳回登录页
    } catch (err) {
      alert('Failed to submit application');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Mentor Application</h1>

        {submitted ? (
          <p className="text-green-600 font-medium">Submitted! Awaiting admin approval...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="expertise"
              placeholder="Area of Expertise"
              value={form.expertise}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="institution"
              placeholder="Institution"
              value={form.institution}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Submit Application
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
