import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

interface Student {
  _id: string;
  fullName: string;
  email: string;
  studentId: string;
}

interface StudyGroup {
  _id: string;
  name: string;
  description?: string;
  mentor: string;
  students: Student[];
  isActive: boolean;
}

export default function MentorGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newStudentId, setNewStudentId] = useState('');
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);

  // Fetch study groups
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get<StudyGroup[]>('/study-groups');
      setGroups(response.data);
      if (response.data.length > 0) {
        setSelectedGroupId(response.data[0]._id);
      }
    } catch (error) {
      toast.error('Failed to fetch study groups');
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get<Student[]>('/users/students');
        setAvailableStudents(response.data);
      } catch (error) {
        toast.error('Failed to fetch students');
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName) {
      toast.error('Please enter a group name');
      return;
    }

    try {
      const response = await api.post<StudyGroup>('/study-groups', {
        name: newGroupName,
        description: newGroupDescription,
        studentIds: [], // Start with no students
      });

      setGroups([...groups, response.data]);
      setNewGroupName('');
      setNewGroupDescription('');
      toast.success('Study group created successfully');
    } catch (error) {
      toast.error('Failed to create study group');
      console.error('Error creating group:', error);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedGroupId || !newStudentId) {
      toast.error('Please select a group and student');
      return;
    }

    try {
      console.log('Adding student:', {
        groupId: selectedGroupId,
        studentId: newStudentId
      });

      const response = await api.post<StudyGroup>(`/study-groups/${selectedGroupId}/students`, {
        studentId: newStudentId,
      });

      console.log('Add student response:', response.data);

      setGroups(groups.map(group =>
        group._id === selectedGroupId ? response.data : group
      ));
      setNewStudentId('');
      toast.success('Student added successfully');
    } catch (error) {
      console.error('Error adding student:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const response = error.response as { data?: { message?: string }, status?: number };
        const errorMessage = response.data?.message || 'Failed to add student';
        console.error('Error details:', {
          message: errorMessage,
          status: response.status,
          data: response.data
        });
        toast.error(errorMessage);
      } else {
        toast.error('Failed to add student');
      }
    }
  };

  const handleRemoveStudent = async (groupId: string, studentId: string) => {
    try {
      await api.delete(`/study-groups/${groupId}/students/${studentId}`);

      setGroups(groups.map(group =>
        group._id === groupId
          ? {
              ...group,
              students: group.students.filter(s => s._id !== studentId),
            }
          : group
      ));
      toast.success('Student removed successfully');
    } catch (error) {
      toast.error('Failed to remove student');
      console.error('Error removing student:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      await api.delete(`/study-groups/${groupId}`);
      setGroups(groups.filter(g => g._id !== groupId));
      toast.success('Group deleted successfully');
    } catch (error) {
      toast.error('Failed to delete group');
      console.error('Error deleting group:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold text-purple-700 mb-6">Manage Study Groups</h1>

          {/* Create New Group */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Create New Group</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full p-2 border rounded"
              />
              <textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Group description (optional)"
                className="w-full p-2 border rounded"
                rows={3}
              />
              <button
                onClick={handleCreateGroup}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Create Group
              </button>
            </div>
          </div>

          {/* Add Student to Group */}
          {groups.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Add Student to Group</h2>
              <div className="space-y-4">
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>

                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a student</option>
                  {availableStudents.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.fullName} ({student.studentId})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddStudent}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Add Student
                </button>
              </div>
            </div>
          )}

          {/* Display Groups */}
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-indigo-700">{group.name}</h2>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteGroup(group._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete Group
                  </button>
                </div>

                {group.students.length === 0 ? (
                  <p className="text-sm text-gray-500">No students in this group.</p>
                ) : (
                  <ul className="space-y-2">
                    {group.students.map((student) => (
                      <li
                        key={student._id}
                        className="flex justify-between items-center bg-gray-50 p-3 rounded"
                      >
                        <div>
                          <span className="font-medium">{student.fullName}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({student.studentId})
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(group._id, student._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
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
    </ProtectedRoute>
  );
}