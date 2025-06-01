declare module '@twilio/voice-sdk' {
  export class Device {
    constructor(token: string, options?: Device.Options);
    connect(params?: Device.ConnectOptions): Promise<void>;
    destroy(): void;
    disconnectAll(): void;
    on(event: 'ready' | 'error' | 'disconnect', callback: (data: unknown) => void): void;
    audio?: {
      setMute(mute: boolean): void;
    };
  }

  namespace Device {
    interface Options {
      codecPreferences?: string[];
      enableRingingState?: boolean;
    }

    interface ConnectOptions {
      params?: {
        roomId?: string;
      };
    }
  }
}