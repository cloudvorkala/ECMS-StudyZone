// ✅ frontend/src/pages/student/groups.tsx
import React from 'react';

export default function StudyGroupPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-green-700 mb-4">👥 Study Groups</h1>
        <p className="text-gray-700 mb-2">Join or create study groups to collaborate with peers.</p>

        <div className="space-y-4 mt-6">
          <div className="border p-4 rounded shadow-sm">
            <h2 className="font-semibold">Frontend Development Group</h2>
            <p className="text-sm text-gray-600">Weekly on Wednesdays 3PM - 4PM</p>
            <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Join Group</button>
          </div>

          <div className="border p-4 rounded shadow-sm">
            <h2 className="font-semibold">Software Engineering Discussion</h2>
            <p className="text-sm text-gray-600">Fridays 1PM - 2PM via Zoom</p>
            <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Join Group</button>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Create New Group</h2>
            <input
              type="text"
              placeholder="Group name"
              className="border p-2 rounded w-full mb-2"
            />
            <textarea
              placeholder="Description or meeting details..."
              className="border p-2 rounded w-full mb-2"
            />
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Create Group</button>
          </div>
        </div>
      </div>
    </div>
  );
}
