import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Device } from '@twilio/voice-sdk';
import api from '@/services/api';

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

  const leaveRoom = useCallback(() => {
    if (device) {
      device.disconnectAll();
      device.destroy();
    }
    router.push('/voice-chat');
  }, [device, router]);

  const toggleMute = useCallback(() => {
    if (device) {
      if (isMuted) {
        device.audio?.setMute(false);
      } else {
        device.audio?.setMute(true);
      }
      setIsMuted(!isMuted);
      setParticipants(prev =>
        prev.map(p =>
          p.identity === 'You' ? { ...p, isMuted: !isMuted } : p
        )
      );
    }
  }, [device, isMuted]);

//
useEffect(() => {
  if (!roomId) return;

  let currentDevice: Device | null = null;

  const initializeVoice = async () => {
    try {
      // Get Twilio token from backend
      console.log('Fetching token for room:', roomId);

      const response = await api.get<{ token: string }>(`/voice/token/${roomId}`);
      console.log('Token response:', response.data);

      if (!response.data.token) {
        throw new Error('No token in response');
      }

      // Initialize Twilio device with configuration
      const newDevice = new Device(response.data.token, {
        codecPreferences: ['opus', 'pcmu'],
        enableRingingState: true,
      });

      // Set up event listeners
      newDevice.on('ready', () => {
        console.log('Twilio device is ready');
        setParticipants([{ identity: 'You', isMuted: false }]);
      });

      newDevice.on('error', (error) => {
        console.error('Twilio device error:', error);
        setError('Connection error occurred');
      });

      newDevice.on('disconnect', () => {
        console.log('Disconnected from room');
        router.push('/voice-chat');
      });

      // Connect to voice room
      await newDevice.connect({ params: { roomId: roomId as string } });

      currentDevice = newDevice;
      setDevice(newDevice);

    } catch (err) {
      console.error('Error initializing voice:', err);
      setError('Failed to connect to voice room');
    }
  };

  initializeVoice();

    // Cleanup function to destroy device when component unmounts
    return () => {
      if (currentDevice) {
        currentDevice.disconnectAll();
        currentDevice.destroy();
      }
    };
  }, [roomId, router]); // Add all dependencies

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