import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ScreenShareSession {
  id: string;
  sharerId: string;
  status: 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  viewers: string[];
  mediaType: 'screen' | 'camera' | 'both';
  audioEnabled: boolean;
}

export default function ScreenSharePage() {
  const router = useRouter();
  const { groupId } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [activeSession, setActiveSession] = useState<ScreenShareSession | null>(null);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = sessionStorage.getItem('token');

    if (!token || !user || !groupId) {
      router.push('/');
      return;
    }

    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}/webrtc`, {
      query: { token, groupId },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebRTC server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebRTC server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [router, groupId]);

  const startScreenShare = async () => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setMediaStream(stream);
      setIsSharing(true);

      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const response = await socket.emitWithAck('start-screen-share', {
        userId: user.id,
        groupId,
        mediaType: 'both',
      });

      setActiveSession(response);
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const stopScreenShare = async () => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }

    if (activeSession) {
      await socket.emitWithAck('end-screen-share', {
        sessionId: activeSession.id,
        groupId,
      });
      setActiveSession(null);
    }

    setIsSharing(false);
    toast.success('Screen sharing stopped');
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">Screen Sharing Session</h1>
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
        <Card className="p-6">
          <div className="space-y-4">
            {!isSharing ? (
              <Button onClick={startScreenShare} className="w-full">
                Start Screen Sharing
              </Button>
            ) : (
              <Button onClick={stopScreenShare} variant="destructive" className="w-full">
                Stop Screen Sharing
              </Button>
            )}

            {activeSession && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">Session Info</h2>
                <p>Session ID: {activeSession.id}</p>
                <p>Viewers: {activeSession.viewers.length}</p>
                <p>Status: {activeSession.status}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}