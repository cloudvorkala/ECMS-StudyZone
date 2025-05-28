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
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async getRooms() {
    return this.voiceRoomModel.find({ isActive: true }).exec();
  }

  async createRoom(name: string, createdBy: string) {
    const room = new this.voiceRoomModel({
      name,
      createdBy,
      participants: 0,
      isActive: true,
    });
    return room.save();
  }

  async generateToken(roomId: string, identity: string) {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const accessToken = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID as string,
      process.env.TWILIO_API_KEY as string,
      process.env.TWILIO_API_SECRET as string,
      { identity }
    );

    const voiceGrant = new VoiceGrant({

      outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    });

    accessToken.addGrant(voiceGrant);

    return {
      token: accessToken.toJwt(),
    };
  }

  async updateParticipantCount(roomId: string, increment: boolean) {
    const update = increment
      ? { $inc: { participants: 1 } }
      : { $inc: { participants: -1 } };

    return this.voiceRoomModel.findByIdAndUpdate(roomId, update, { new: true }).exec();
  }
}