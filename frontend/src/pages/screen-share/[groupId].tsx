// This page is for the mentor to start screen sharing

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ScreenShareResponse {
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

export default function MentorScreenSharePage() {
  const router = useRouter();
  const { groupId } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<string>('Disconnected');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [activeSession, setActiveSession] = useState<ScreenShareSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [viewerCount, setViewerCount] = useState(0);

  // Use refs to store mutable values without causing re-renders
  const socketRef = useRef<Socket | null>(null);
  const activeSessionRef = useRef<ScreenShareSession | null>(null);
  const userRef = useRef<User | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Update refs when state changes
  socketRef.current = socket;
  activeSessionRef.current = activeSession;
  userRef.current = user;
  mediaStreamRef.current = mediaStream;

  // Create peer connection for a viewer
  const createPeerConnection = useCallback((viewerId: string, stream: MediaStream) => {
    console.log('Creating peer connection for viewer:', viewerId);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      iceCandidatePoolSize: 10
    });

    // Add tracks
    stream.getTracks().forEach(track => {
      console.log('Adding track to peer connection:', track.kind);
      pc.addTrack(track, stream);
    });

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && activeSessionRef.current) {
        console.log('Sending ICE candidate to viewer:', viewerId);
        socketRef.current.emit('ice-candidate', {
          sessionId: activeSessionRef.current.id,
          candidate: event.candidate,
          targetId: viewerId,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${viewerId}:`, pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${viewerId}:`, pc.connectionState);
    };

    peerConnectionsRef.current.set(viewerId, pc);
    return pc;
  }, []);

  // Create and send offer to a viewer
  const createOfferForViewer = useCallback(async (viewerId: string, stream: MediaStream) => {
    try {
      console.log('Creating offer for viewer:', viewerId);
      const pc = createPeerConnection(viewerId, stream);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socketRef.current && activeSessionRef.current) {
        socketRef.current.emit('offer', {
          sessionId: activeSessionRef.current.id,
          offer: offer,
          targetId: viewerId,
        });
        console.log('Sent offer to viewer:', viewerId);
      }
    } catch (error) {
      console.error('Error creating offer for viewer:', error);
    }
  }, [createPeerConnection]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    console.log('Stopping screen share...');

    // Stop media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });
      setMediaStream(null);
    }

    // Close all peer connections
    peerConnectionsRef.current.forEach((pc, viewerId) => {
      console.log('Closing peer connection for:', viewerId);
      pc.close();
    });
    peerConnectionsRef.current.clear();

    // Notify server
    if (socketRef.current && activeSessionRef.current) {
      console.log('Notifying server about screen share end...');
      socketRef.current.emit('end-screen-share', {
        sessionId: activeSessionRef.current.id,
      });
    }

    setActiveSession(null);
    setIsSharing(false);
    setViewerCount(0);
    toast.success('Screen sharing stopped');
  }, []);

  // Main initialization effect - handle socket connection
  useEffect(() => {
    if (!groupId) return;

    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (!token || !storedUser) {
      toast.error('Authentication required');
      router.push('/');
      return;
    }

    let userData: User;
    try {
      userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/');
      return;
    }

    console.log('Mentor screen share page - groupId:', groupId);

    // Connect to WebRTC namespace
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    console.log('Connecting to WebRTC server:', socketUrl);

    const newSocket = io(`${socketUrl}/webrtc`, {
      query: {
        token,
        groupId: groupId as string,
        userId: userData.id,
        role: 'mentor'
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
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
      toast.error(`Connection failed: ${error.message}`);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
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

    // Cleanup function
    return () => {
      console.log('Cleaning up mentor connection...');
      newSocket.removeAllListeners();
      newSocket.disconnect();

      // Clean up peer connections
      peerConnectionsRef.current.forEach((pc) => {
        pc.close();
      });
      peerConnectionsRef.current.clear();

      // Stop media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [groupId, router]);

  // WebRTC event handling - separate useEffect
  useEffect(() => {
    if (!socket || !user) return;

    // Handle viewer joined event
    const handleViewerJoined = async (data: { sessionId: string; viewerId: string; viewerSocketId: string }) => {
      console.log('Viewer joined:', data);
      setViewerCount(prev => prev + 1);

      // Automatically create offer for the new viewer
      if (mediaStreamRef.current && activeSessionRef.current) {
        console.log('Creating offer for new viewer:', data.viewerId);
        await createOfferForViewer(data.viewerId, mediaStreamRef.current);
      } else {
        console.error('Cannot create offer - missing media stream or active session:', {
          hasMediaStream: !!mediaStreamRef.current,
          hasActiveSession: !!activeSessionRef.current
        });
      }
    };

    // Handle WebRTC answer from viewer
    const handleAnswer = async (data: { sessionId: string; answer: RTCSessionDescriptionInit; fromUserId: string }) => {
      console.log('Received answer from viewer:', data.fromUserId);
      console.log('Answer data:', data.answer);

      const pc = peerConnectionsRef.current.get(data.fromUserId);
      if (pc && data.answer) {
        try {
          console.log('Setting remote description for viewer:', data.fromUserId);
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          console.log('Successfully set remote description for viewer:', data.fromUserId);
          console.log('Peer connection state:', pc.connectionState);
          console.log('Signaling state:', pc.signalingState);
        } catch (error) {
          console.error('Error setting remote description for viewer:', data.fromUserId, error);
        }
      } else {
        console.error('No peer connection found for viewer or no answer data:', {
          viewerId: data.fromUserId,
          hasPc: !!pc,
          hasAnswer: !!data.answer,
          peerConnections: Array.from(peerConnectionsRef.current.keys())
        });
      }
    };

    // Handle ICE candidates from viewers
    const handleIceCandidate = async (data: { sessionId: string; candidate: RTCIceCandidateInit }) => {
      console.log('Received ICE candidate from viewer');

      // Since we don't know which viewer this ICE candidate belongs to,
      // we need to check our current peer connections
      // In a 1-to-1 scenario, we usually have only one active connection

      const peerConnections = Array.from(peerConnectionsRef.current.entries());

      for (const [viewerId, pc] of peerConnections) {
        // Check if the peer connection has already set the remote description
        if (pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('Added ICE candidate for viewer:', viewerId);
            break; // Exit the loop after successful addition
          } catch (error) {
            console.error('Error adding ICE candidate for viewer:', viewerId, error);
          }
        } else {
          console.log('Skipping ICE candidate for viewer', viewerId, '- no remote description yet');
        }
      }
    };

    socket.on('viewer-joined', handleViewerJoined);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('viewer-joined', handleViewerJoined);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [socket, user, createOfferForViewer]);

  // Start screen sharing
  const startScreenShare = async () => {
    if (!socket || !isConnected || !user) {
      toast.error('Not connected to server or user not authenticated');
      return;
    }

    try {
      console.log('Starting screen share...');

      // Check browser compatibility
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        toast.error('Your browser does not support screen sharing. Please use Chrome, Firefox, or Edge.');
        return;
      }

      // Get display media
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        } as MediaStreamConstraints['video'],
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      }).catch(error => {
        console.error('Error getting display media:', error);
        throw new Error('Failed to access screen sharing. Please make sure you have granted permission.');
      });

      console.log('Got media stream:', stream);
      setMediaStream(stream);
      setIsSharing(true);

      // Notify server
      console.log('Notifying server about screen share start...');
      const session = await new Promise<ScreenShareResponse>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for server response'));
        }, 5000);

        socket.emit('start-screen-share', {
          userId: user.id,
          groupId: groupId as string,
          mediaType: 'both',
        }, (response: ScreenShareResponse) => {
          clearTimeout(timeout);
          if (response && response.id) {
            resolve(response);
          } else {
            reject(new Error('Invalid response from server'));
          }
        });
      });

      console.log('Screen share session created:', session);
      setActiveSession(session);
      toast.success('Screen sharing started');

      // Handle stream end
      stream.getVideoTracks()[0].onended = () => {
        console.log('User stopped sharing');
        stopScreenShare();
      };

    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start screen sharing');

      // Cleanup
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      setIsSharing(false);
    }
  };

  const handleBack = () => {
    if (isSharing) {
      stopScreenShare();
    }
    router.back();
  };

  return (
    <ProtectedRoute allowedRoles={['mentor']}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">Screen Sharing - Mentor</h1>
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

            {!isSharing ? (
              <Button
                onClick={startScreenShare}
                className="w-full"
                disabled={!isConnected}
              >
                Start Screen Sharing
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopScreenShare}
                  variant="destructive"
                  className="w-full"
                >
                  Stop Screen Sharing
                </Button>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Session Info</h2>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Session ID:</span> {activeSession?.id}</p>
                    <p><span className="font-medium">Viewers:</span> {viewerCount}</p>
                    <p><span className="font-medium">Status:</span> <span className="text-green-600">Active</span></p>
                    <p><span className="font-medium">Media Type:</span> Screen + Audio</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}