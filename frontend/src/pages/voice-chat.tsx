import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface VoiceRoom {
  _id: string;
  name: string;
  createdBy: string;
  participants: number;
  isActive: boolean;
  createdAt: string;
}

export default function VoiceChat() {
  const router = useRouter();
  const [voiceRooms, setVoiceRooms] = useState<VoiceRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get<VoiceRoom[]>('/api/voice/rooms');
      setVoiceRooms(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch rooms');
      console.error('Error fetching rooms:', err);
      setIsLoading(false);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await api.post<VoiceRoom>('/api/voice/rooms', { name: newRoomName });
      setVoiceRooms([...voiceRooms, response.data]);
      setNewRoomName('');
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room:', err);
    }
  };

  const joinRoom = async (roomId: string) => {
    try {
      // Get Twilio token
      const tokenResponse = await api.get<{ token: string }>(`/api/voice/token/${roomId}`);
      // Store token and room info
      sessionStorage.setItem('twilioToken', tokenResponse.data.token);
      sessionStorage.setItem('currentRoom', roomId);
      // Navigate to room page
      router.push(`/voice-chat/room/${roomId}`);
    } catch (err) {
      setError('Failed to join room');
      console.error('Error joining room:', err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student', 'mentor']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Voice Chat Rooms</h1>

          {/* Create New Room */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
            <form onSubmit={createRoom} className="flex gap-4">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Room
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Room List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
            {isLoading ? (
              <div className="text-center py-4">Loading rooms...</div>
            ) : voiceRooms.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No rooms available</div>
            ) : (
              <div className="grid gap-4">
                {voiceRooms.map((room) => (
                  <div
                    key={room._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created by {room.createdBy} • {room.participants} participants
                      </p>
                    </div>
                    <button
                      onClick={() => joinRoom(room._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Join Room
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}