// ✅ src/pages/mentor/groups.tsx
import React, { useState } from 'react';

interface Student {
  id: number;
  name: string;
}

interface Group {
  id: number;
  name: string;
  students: Student[];
}

const initialGroups: Group[] = [
  {
    id: 1,
    name: 'Group A',
    students: [
      { id: 101, name: 'Alice Johnson' },
      { id: 102, name: 'Michael Lee' },
    ],
  },
];

export default function MentorGroupsPage() {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<number>(1);

  const handleCreateGroup = () => {
    if (!newGroupName) return;
    const newGroup: Group = {
      id: Date.now(),
      name: newGroupName,
      students: [],
    };
    setGroups([...groups, newGroup]);
    setNewGroupName('');
  };

  const handleAddStudent = () => {
    if (!newStudentName) return;
    setGroups((prev) =>
      prev.map((group) =>
        group.id === selectedGroupId
          ? {
              ...group,
              students: [...group.students, { id: Date.now(), name: newStudentName }],
            }
          : group
      )
    );
    setNewStudentName('');
  };

  const handleRemoveStudent = (groupId: number, studentId: number) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              students: group.students.filter((s) => s.id !== studentId),
            }
          : group
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">Manage Study Groups</h1>

        <div className="mb-6">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name"
            className="p-2 border rounded mr-2"
          />
          <button
            onClick={handleCreateGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Create Group
          </button>
        </div>

        <div className="mb-8">
          <label className="block mb-2 font-medium">Select Group:</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(Number(e.target.value))}
            className="p-2 border rounded w-full"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="New student name"
              className="p-2 border rounded w-full"
            />
            <button
              onClick={handleAddStudent}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              Add Student
            </button>
          </div>
        </div>

        <div>
          {groups.map((group) => (
            <div key={group.id} className="mb-6">
              <h2 className="text-lg font-semibold text-indigo-700 mb-2">{group.name}</h2>
              {group.students.length === 0 ? (
                <p className="text-sm text-gray-500">No students in this group.</p>
              ) : (
                <ul className="space-y-1">
                  {group.students.map((s) => (
                    <li
                      key={s.id}
                      className="flex justify-between items-center bg-gray-50 p-2 border rounded"
                    >
                      <span>{s.name}</span>
                      <button
                        onClick={() => handleRemoveStudent(group.id, s.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
