import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Device } from '@twilio/voice-sdk';

interface Participant {
  identity: string;
  isMuted: boolean;
}

export default function VoiceRoom() {
  const router = useRouter();
  const { id: roomId } = router.query;
  const [device, setDevice] = useState<Device | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId) return;

    const initializeVoice = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        // get token
        const response = await fetch(`/api/voice/token/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to get token');
        }

        const data = await response.json();
        if (!data.token) {
          throw new Error('No token in response');
        }

        // Initialize Twilio device
        const newDevice = new Device(data.token);

        // Set up event listeners
        newDevice.on('ready', () => {
          console.log('Twilio device is ready');
          // Add current user to participants list
          setParticipants([{ identity: 'You', isMuted: false }]);
        });

        newDevice.on('error', (error: unknown) => {
          console.error('Twilio device error:', error);
          setError('Connection error occurred');
        });

        newDevice.on('disconnect', () => {
          console.log('Disconnected from room');
          router.push('/voice-chat');
        });

        // Connect to room
        await newDevice.connect({ params: { roomId: roomId as string } });
        setDevice(newDevice);

      } catch (err) {
        console.error('Error initializing voice:', err);
        setError('Failed to connect to voice room');
      }
    };

    initializeVoice();

    // Cleanup function
    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, [roomId]);

  const leaveRoom = () => {
    if (device) {
      device.disconnectAll();
      device.destroy();
    }
    router.push('/voice-chat');
  };

  const toggleMute = () => {
    if (device) {
      if (isMuted) {
        device.audio?.setMute(false);
      } else {
        device.audio?.setMute(true);
      }
      setIsMuted(!isMuted);
      // Update participants list with mute status
      setParticipants(prev =>
        prev.map(p =>
          p.identity === 'You' ? { ...p, isMuted: !isMuted } : p
        )
      );
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student', 'mentor']}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Voice Room: {roomId}</h1>
              <button
                onClick={leaveRoom}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Leave Room
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Participants List */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Participants</h2>
              <div className="grid gap-4">
                {participants.map((participant) => (
                  <div
                    key={participant.identity}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <span>{participant.identity}</span>
                    {participant.isMuted && (
                      <span className="text-gray-500">🔇 Muted</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`px-6 py-3 rounded-full ${
                  isMuted
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {isMuted ? '🔇 Unmute' : '🔊 Mute'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}