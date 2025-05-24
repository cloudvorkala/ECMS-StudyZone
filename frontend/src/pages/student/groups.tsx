// ✅ src/pages/student/groups.tsx
import React, { useState } from 'react';

const StudentStudyGroup = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const currentGroup = {
    name: 'Group Alpha',
    members: ['Alice', 'Bob', 'Charlie', 'You'],
    lastMeeting: '2025-05-22 14:00',
    major: 'Software Engineering'
  };

  const otherGroups = [
    {
      name: 'Group Beta',
      members: ['Diana', 'Ethan']
    },
    {
      name: 'Group Gamma',
      members: ['Fiona', 'George']
    }
  ];

  const filteredGroups = otherGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">📚 Study Group</h1>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-pink-600 mb-2">🧠 Your Current Group</h2>
          <p><strong>Group Name:</strong> {currentGroup.name}</p>
          <p className="mt-1 mb-1">Members:</p>
          <ul className="list-disc list-inside mb-2">
            {currentGroup.members.map(member => (
              <li key={member}>{member}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-700 mb-1">📅 Last Meeting: {currentGroup.lastMeeting}</p>
          <p className="text-sm text-gray-700 mb-4">🎓 Major: {currentGroup.major}</p>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Leave Group</button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">🔍 Explore Other Groups</h2>
            <input
              type="text"
              placeholder="Type keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 rounded w-60 text-sm"
            />
          </div>

          <h3 className="text-md font-semibold text-gray-700 mb-2">🌟 Groups that might suit you</h3>

          {filteredGroups.map(group => (
            <div key={group.name} className="p-4 mb-4 border rounded bg-gray-50">
              <p><strong>Group:</strong> {group.name}</p>
              <p><strong>Members:</strong> {group.members.join(', ')}</p>
              <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Join Group
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentStudyGroup;