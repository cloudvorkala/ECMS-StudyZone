import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';
import { useRouter } from 'next/navigation';
import ChatIcon from '@mui/icons-material/Chat';
import { Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
  mentor: {
    _id: string;
    fullName: string;
  };
  students: Student[];
  isActive: boolean;
}

export default function StudentGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch study groups
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await api.get<StudyGroup[]>('/study-groups/my-groups');
      setGroups(response.data);
    } catch (error) {
      toast.error('Failed to fetch study groups');
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = (groupId: string) => {
    router.push(`/group-chat/${groupId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-purple-700">My Study Groups</h1>
            <button
              onClick={() => window.history.back()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You are not a member of any study groups yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <div key={group._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-indigo-700">{group.name}</h2>
                      {group.description && (
                        <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Mentor: {group.mentor.fullName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleChatClick(group._id)}
                      className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <ChatIcon className="w-5 h-5 mr-1" />
                      Chat
                    </button>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Group Members:</h3>
                    <ul className="space-y-2">
                      {group.students.map((student) => (
                        <li
                          key={student._id}
                          className="flex items-center bg-gray-50 p-3 rounded"
                        >
                          <div>
                            <span className="font-medium">{student.fullName}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              ({student.studentId})
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={`/screen-share/view/${group._id}`}>
                    <Button
                      variant="outline"
                      className="mt-2 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 hover:scale-105"
                    >
                      <Share className="mr-2 h-4 w-4" />
                      View Screen Share
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}