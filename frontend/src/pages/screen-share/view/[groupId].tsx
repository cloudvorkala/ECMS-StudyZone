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

interface ActiveSessionsResponse {
  success: boolean;
  sessions: ScreenShareSession[];
}

interface ViewerJoinedData {
  sessionId: string;
  userId: string;
  success: boolean;
}

interface OfferData {
  sessionId: string;
  fromUserId: string;
  offer: RTCSessionDescriptionInit;
}

interface IceCandidateData {
  sessionId: string;
  candidate: RTCIceCandidateInit;
}

export default function StudentScreenShareViewerPage() {
  const router = useRouter();
  const { groupId } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeSession, setActiveSession] = useState<ScreenShareSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionState, setConnectionState] = useState<string>('Disconnected');

  // Effect to set video stream when both video element and stream are available
  useEffect(() => {
    console.log('Video effect triggered:', {
      hasVideoRef: !!videoRef.current,
      hasRemoteStream: !!remoteStream,
      streamId: remoteStream?.id
    });

    if (videoRef.current && remoteStream) {
      console.log('Setting stream to video element via useEffect');
      videoRef.current.srcObject = remoteStream;

      // Force video to play
      videoRef.current.play().catch(console.error);
    } else if (remoteStream && !videoRef.current) {
      // Video ref not ready yet, set up retry mechanism
      console.log('Video ref not ready, setting up retry mechanism');
      let attempts = 0;
      const retryInterval = setInterval(() => {
        attempts++;
        console.log(`useEffect retry attempt ${attempts}`);

        if (videoRef.current && remoteStream) {
          console.log('Successfully set stream via useEffect retry');
          videoRef.current.srcObject = remoteStream;
          videoRef.current.play().catch(console.error);
          clearInterval(retryInterval);
        } else if (attempts >= 20) {
          console.error('Failed to set video stream via useEffect after 20 attempts');
          clearInterval(retryInterval);
        }
      }, 100); // Try every 100ms
    }
  }, [remoteStream]);

  // Additional effect to ensure video element is ready
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      console.log('Video ref ready, setting stream');
      videoRef.current.srcObject = remoteStream;
      videoRef.current.play().catch(console.error);
    }
  }, [remoteStream, activeSession]); // Also depend on activeSession

  // Use refs to avoid re-render issues
  const socketRef = useRef<Socket | null>(null);
  const userRef = useRef<User | null>(null);
  const activeSessionRef = useRef<ScreenShareSession | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  socketRef.current = socket;
  userRef.current = user;
  activeSessionRef.current = activeSession;
  peerConnectionRef.current = peerConnection;

  // Function to automatically join session as viewer
  const joinAsViewer = useCallback(async (sessionId: string) => {
    if (!socketRef.current || !userRef.current) return;

    console.log('Joining as viewer for session:', sessionId);

    // Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    setPeerConnection(pc);

    // Handle incoming streams
    pc.ontrack = (event) => {
      console.log('Received remote stream:', event.streams[0]);
      const stream = event.streams[0];

      // Store stream in state
      setRemoteStream(stream);
      setConnectionState('Receiving stream');
      toast.success('Connected to screen share');
      console.log('Stream stored in state');
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && activeSessionRef.current) {
        console.log('Sending ICE candidate to mentor');
        socketRef.current.emit('ice-candidate', {
          sessionId: activeSessionRef.current.id,
          candidate: event.candidate,
          targetId: activeSessionRef.current.sharerId
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
      }
    };

    // Request to join as viewer
    socketRef.current.emit('join-as-viewer', {
      sessionId,
      userId: userRef.current.id,
      groupId: groupId as string
    });
  }, [groupId]); // 只依赖groupId，使用refs访问其他值

  useEffect(() => {
    if (!groupId) return;

    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (!token || !storedUser) {
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
      transports: ['websocket', 'polling'],
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

    // Handle get active sessions response
    newSocket.on('get-active-sessions', (response: ActiveSessionsResponse) => {
      console.log('Active sessions response:', response);
      if (response.success && response.sessions && response.sessions.length > 0) {
        const activeSession = response.sessions[0]; // Get first active session
        console.log('Found active session, auto-joining:', activeSession);
        setActiveSession(activeSession);
        toast.info('Joining ongoing screen share...');

        // Immediately join this existing session
        joinAsViewer(activeSession.id);
      } else {
        console.log('No active sessions found');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      toast.error(`Connection failed: ${error.message}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
      setConnectionState('Disconnected');
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Connection error occurred');
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up viewer connection...');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [groupId, router, joinAsViewer]);

  // Handle WebRTC events separately
  useEffect(() => {
    if (!socket || !user) return;

    // Screen share events
    const handleScreenShareStarted = async (session: ScreenShareSession) => {
      console.log('Screen share started:', session);
      setActiveSession(session);
      toast.info('Mentor started screen sharing');

      // Auto join
      if (session.status === 'active') {
        await joinAsViewer(session.id);
      }
    };

    const handleScreenShareEnded = (session: ScreenShareSession) => {
      console.log('Screen share ended:', session);
      setActiveSession(null);
      setConnectionState('Screen share ended');
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        setPeerConnection(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      toast.info('Screen sharing has ended');
    };

    const handleGetActiveSessionsResponse = (response: ActiveSessionsResponse) => {
      console.log('Active sessions response in WebRTC handler:', response);
      if (response.success && response.sessions && response.sessions.length > 0) {
        const activeSession = response.sessions[0]; // Get first active session
        console.log('Found active session in WebRTC handler, auto-joining:', activeSession);
        setActiveSession(activeSession);
        toast.info('Joining ongoing screen share...');

        // Immediately join this existing session
        joinAsViewer(activeSession.id);
      } else {
        console.log('No active sessions found in WebRTC handler');
      }
    };

    const handleViewerJoined = (data: ViewerJoinedData) => {
      console.log('Viewer joined response:', data);
    };

    const handleOffer = async (data: OfferData) => {
      console.log('Received offer from sharer');

      const pc = peerConnectionRef.current;
      if (!pc) {
        console.log('No peer connection available');
        return;
      }

      try {
        await pc.setRemoteDescription(data.offer);

        // Create and send answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          sessionId: data.sessionId,
          answer,
          targetId: data.fromUserId
        });
        console.log('Sent answer to sharer');
      } catch (error) {
        console.error('Error handling offer:', error);
      }
    };

    const handleIceCandidate = async (data: IceCandidateData) => {
      console.log('Received ICE candidate');

      const pc = peerConnectionRef.current;
      if (!pc) {
        console.log('No peer connection available');
        return;
      }

      try {
        await pc.addIceCandidate(data.candidate);
        console.log('Added ICE candidate');
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    };

    // Bind events
    socket.on('screen-share-started', handleScreenShareStarted);
    socket.on('screen-share-ended', handleScreenShareEnded);
    socket.on('viewer-joined', handleViewerJoined);
    socket.on('offer', handleOffer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('get-active-sessions', handleGetActiveSessionsResponse);

    return () => {
      socket.off('screen-share-started', handleScreenShareStarted);
      socket.off('screen-share-ended', handleScreenShareEnded);
      socket.off('viewer-joined', handleViewerJoined);
      socket.off('offer', handleOffer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('get-active-sessions', handleGetActiveSessionsResponse);
    };
  }, [socket, user, groupId, joinAsViewer]);

  const handleBack = () => {
    if (peerConnection) {
      peerConnection.close();
    }
    router.back();
  };

  const handleRefresh = () => {
    if (socket && groupId) {
      console.log('Refreshing connection...');
      if (peerConnection) {
        peerConnection.close();
        setPeerConnection(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
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
                  {!remoteStream && (
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
                    <p><span className="font-medium">Connection:</span> {connectionState}</p>
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