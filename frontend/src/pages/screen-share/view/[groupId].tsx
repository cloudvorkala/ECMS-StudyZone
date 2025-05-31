// This page is for the student to view the screen share

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ScreenShareSession {
  id: string;
  sharerId: string;
  groupId: string;
  status: 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  viewers: string[];
  mediaType: 'screen' | 'camera' | 'both';
  audioEnabled: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface WebRTCSignal {
  type: 'offer' | 'answer' | 'candidate' | 'ice-candidate';
  from: string;
  to: string;
  sessionId: string;
  data?: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export default function StudentScreenShareViewerPage() {
  const router = useRouter();
  const { groupId } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeSession, setActiveSession] = useState<ScreenShareSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionState, setConnectionState] = useState<string>('Disconnected');

  const cleanupPeerConnection = useCallback(() => {
    if (peerConnection) {
      console.log('Closing peer connection');
      peerConnection.close();
      setPeerConnection(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [peerConnection]);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (!token || !storedUser || !groupId) {
      toast.error('Authentication required');
      router.push('/');
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    console.log('Student viewer page - groupId:', groupId);

    // Connect to WebRTC namespace
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('Connecting to WebRTC server:', socketUrl);

    const newSocket = io(`${socketUrl}/webrtc`, {
      query: {
        token,
        groupId: groupId as string,
        userId: userData.id,
        role: 'viewer'
      },
      transports: ['polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 30000,
      secure: socketUrl.startsWith('https'),
      rejectUnauthorized: false,
      withCredentials: true,
      path: '/socket.io',
      autoConnect: true,
      forceNew: true,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Connected to WebRTC server');
      console.log('Socket ID:', newSocket.id);
      setIsConnected(true);
      setConnectionState('Connected to server');

      // Join the group room
      newSocket.emit('join-room', { groupId: groupId as string });
    });

    newSocket.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
    });

    newSocket.on('joined-room', (data) => {
      console.log('Successfully joined room:', data);
      toast.success('Connected to room');

      // Check for active sessions
      newSocket.emit('get-active-sessions', { groupId: groupId as string });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      if (error.message.includes('xhr poll error')) {
        console.log('Falling back to polling...');
      }
      toast.error(`Connection failed: ${error.message}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
      setConnectionState('Disconnected');
      if (reason === 'io server disconnect') {
        toast.error('Disconnected by server');
      } else {
        toast.warning('Connection lost, attempting to reconnect...');
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error occurred');
    });

    // Screen share events
    newSocket.on('screen-share-started', (session: ScreenShareSession) => {
      console.log('Screen share started:', session);
      setActiveSession(session);
      setConnectionState('Screen share started, requesting connection...');
      toast.info('Mentor started screen sharing');

      // 主动请求 offer
      if (newSocket && user) {
        console.log('Requesting offer from mentor:', session.sharerId);
        newSocket.emit('request-offer', {
          sessionId: session.id,
          from: user.id,
          to: session.sharerId
        });
      }
    });

    newSocket.on('screen-share-ended', (session: ScreenShareSession) => {
      console.log('Screen share ended:', session);
      setActiveSession(null);
      setConnectionState('Screen share ended');
      cleanupPeerConnection();
      toast.info('Screen sharing has ended');
    });

    // WebRTC signaling
    newSocket.on('webrtc-signal', async (signal: WebRTCSignal) => {
      console.log('Received WebRTC signal:', signal);
      await handleWebRTCSignal(signal);
    });

    // 添加 offer 请求响应处理
    newSocket.on('offer-requested', (data) => {
      console.log('Offer requested:', data);
    });

    // 添加重连处理
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      toast.success('Reconnected to server');
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      toast.error('Failed to reconnect to server');
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('Cleaning up viewer connection...');
      cleanupPeerConnection();
      newSocket.disconnect();
    };
  }, [router, groupId, cleanupPeerConnection]);

  const createPeerConnection = () => {
    console.log('Creating new peer connection...');

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    // Handle incoming tracks
    pc.ontrack = (event) => {
      console.log('Received track:', event.track.kind);
      if (videoRef.current && event.streams[0]) {
        videoRef.current.srcObject = event.streams[0];
        setConnectionState('Receiving stream');
        toast.success('Connected to screen share');
      }
    };

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && activeSession && user) {
        console.log('Sending ICE candidate to mentor');
        socket.emit('webrtc-signal', {
          type: 'ice-candidate',
          sessionId: activeSession.id,
          from: user.id,
          to: activeSession.sharerId,
          data: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      setConnectionState(`ICE: ${pc.iceConnectionState}`);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setConnectionState(`Connection: ${pc.connectionState}`);

      if (pc.connectionState === 'connected') {
        toast.success('Successfully connected to stream');
      } else if (pc.connectionState === 'failed') {
        toast.error('Connection failed');
        cleanupPeerConnection();
      }
    };

    setPeerConnection(pc);
    return pc;
  };

  const handleWebRTCSignal = async (signal: WebRTCSignal) => {
    try {
      console.log('Handling WebRTC signal:', signal);

      // Check if signal is for us
      if (signal.to !== 'all' && signal.to !== user?.id) {
        console.log('Signal not for us, ignoring');
        return;
      }

      if (signal.type === 'offer') {
        console.log('Received offer from mentor:', signal.from);

        // Create or get peer connection
        let pc = peerConnection;
        if (!pc) {
          console.log('Creating new peer connection');
          pc = createPeerConnection();
        }

        // Set remote description
        if (signal.data) {
          console.log('Setting remote description');
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data as RTCSessionDescriptionInit));
          console.log('Remote description set successfully');

          // Create and send answer
          console.log('Creating answer');
          const answer = await pc.createAnswer();
          console.log('Setting local description');
          await pc.setLocalDescription(answer);
          console.log('Local description set successfully');

          if (socket && activeSession && user) {
            console.log('Sending answer to mentor:', signal.from);
            socket.emit('webrtc-signal', {
              type: 'answer',
              sessionId: activeSession.id,
              from: user.id,
              to: signal.from,
              data: answer,
            });
            console.log('Answer sent successfully');
          } else {
            console.error('Missing required data for sending answer:', { socket: !!socket, activeSession: !!activeSession, user: !!user });
          }
        } else {
          console.error('No signal data in offer');
        }

      } else if (signal.type === 'ice-candidate' || signal.type === 'candidate') {
        console.log('Received ICE candidate from mentor:', signal.from);

        if (peerConnection && signal.data) {
          console.log('Adding ICE candidate');
          await peerConnection.addIceCandidate(new RTCIceCandidate(signal.data as RTCIceCandidateInit));
          console.log('ICE candidate added successfully');
        } else {
          console.warn('No peer connection available for ICE candidate or missing data');
        }
      }
    } catch (error) {
      console.error('Error handling WebRTC signal:', error);
      toast.error('Failed to establish connection');
      cleanupPeerConnection();
    }
  };

  const handleBack = () => {
    cleanupPeerConnection();
    router.back();
  };

  const handleRefresh = () => {
    if (socket && groupId) {
      console.log('Refreshing connection...');
      cleanupPeerConnection();
      socket.emit('get-active-sessions', { groupId: groupId as string });
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">Screen Sharing - Viewer</h1>
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Connection Status</p>
                <p className={`font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionState}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Group ID</p>
                <p className="font-mono text-sm">{groupId}</p>
              </div>
            </div>

            {activeSession ? (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={false}
                    className="w-full h-full"
                    style={{ maxHeight: '70vh' }}
                  />
                  {!videoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>Connecting to stream...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Session Info</h2>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Session ID:</span> {activeSession.id}</p>
                    <p><span className="font-medium">Status:</span> <span className="text-green-600">Active</span></p>
                    <p><span className="font-medium">Media Type:</span> {activeSession.mediaType === 'both' ? 'Screen + Audio' : 'Screen Only'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">Waiting for mentor to start screen sharing...</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100"
                  disabled={!isConnected}
                >
                  Refresh Connection
                </button>
              </div>
            )}

            {!isConnected && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Not connected to server. Please check your internet connection and refresh the page.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}