import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VoiceRoom } from './schemas/room.schema';
import * as twilio from 'twilio';

@Injectable()
export class VoiceService {
  private twilioClient: twilio.Twilio;

  constructor(
    @InjectModel(VoiceRoom.name) private voiceRoomModel: Model<VoiceRoom>,
  ) {
    // Initialize Twilio client with credentials
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  // Get all active voice rooms
  async getRooms() {
    return this.voiceRoomModel.find({ isActive: true }).exec();
  }

  // Create a new voice room
  async createRoom(name: string, createdBy: string) {
    const room = new this.voiceRoomModel({
      name,
      createdBy,
      participants: 0,
      isActive: true,
    });
    return room.save();
  }

  // Generate Twilio access token for voice room
  async generateToken(roomId: string, identity: string) {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Create access token with Twilio credentials
    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID as string,
      process.env.TWILIO_API_KEY as string,
      process.env.TWILIO_API_SECRET as string,
      { identity }
    );

    // Configure voice grant with TwiML app
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);

    return {
      token: accessToken.toJwt(),
    };
  }

  // Update participant count in voice room
  async updateParticipantCount(roomId: string, increment: boolean) {
    const update = increment
      ? { $inc: { participants: 1 } }
      : { $inc: { participants: -1 } };

    return this.voiceRoomModel.findByIdAndUpdate(roomId, update, { new: true }).exec();
  }

  // Join a voice room
  async joinRoom(roomId: string, participantEmail: string) {
    const room = await this.voiceRoomModel.findByIdAndUpdate(
      roomId,
      { $inc: { participants: 1 } },
      { new: true }
    ).exec();

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  // Leave a voice room
  async leaveRoom(roomId: string, participantEmail: string) {
    const room = await this.voiceRoomModel.findByIdAndUpdate(
      roomId,
      { $inc: { participants: -1 } },
      { new: true }
    ).exec();

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }
}