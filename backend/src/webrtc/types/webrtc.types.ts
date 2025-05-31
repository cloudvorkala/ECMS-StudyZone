export interface MediaStreamConfig {
  video: boolean;
  audio: boolean;
  screen: boolean;
}

export type MediaType = 'screen' | 'camera' | 'both';

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  sessionId: string;
  from: string;
  to: string;
  data: any;
}

export interface ScreenShareSession {
  id: string;
  sharerId: string;
  groupId: string;
  status: 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  viewers: string[];
  mediaType: MediaType;
  audioEnabled: boolean;
}

export interface ScreenShareResponse {
  success: boolean;
  session?: ScreenShareSession;
  error?: string;
}

export interface WebRTCResponse {
  success: boolean;
  error?: string;
}

export interface WebRTCConnection {
  id: string;
  sharerId: string;
  viewerId: string;
  status: 'connecting' | 'connected' | 'disconnected';
  startTime: Date;
  endTime?: Date;
  mediaType: MediaType;
  audioEnabled: boolean;
  peerConnection?: RTCPeerConnection;
  mediaStream?: MediaStream;
}

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}