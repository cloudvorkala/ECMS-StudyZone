export type MediaType = 'screen' | 'camera' | 'both';

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  targetUserId: string;
  senderId: string;
  mediaType: MediaType;
}

export interface ScreenShareSession {
  id: string;
  sharerId: string;
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
}

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface MediaStreamConfig {
  audio: boolean | AudioConfig;
  video: boolean | {
    width: number;
    height: number;
    frameRate: number;
  };
}