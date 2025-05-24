// ✅ src/pages/api/student/mentor-recommendation.tsx
// 学生页面：根据课程推荐导师

import { useState } from 'react';

export default function MentorRecommendationPage() {
  const [course, setCourse] = useState('');
  const [preferred, setPreferred] = useState('');
  const [description, setDescription] = useState('');

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    alert('📨 Mentor request sent (demo)');
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Mentor Recommendation</h1>
        <form onSubmit={handleAsk} className="space-y-4">
          <input
            type="text"
            placeholder="Course Name"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          <select
            value={preferred}
            onChange={(e) => setPreferred(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">No preference</option>
            <option value="Bonnin Wang">Bonnin Wang</option>
            <option value="Sofia Hewitt">Sofia Hewitt</option>
          </select>
          <textarea
            placeholder="Description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
          >
            Ask Mentor
          </button>
        </form>
      </div>
    </div>
  );
}
