import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'voice_rooms' })
export class VoiceRoom extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop({ default: 0 })
  participants!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const VoiceRoomSchema = SchemaFactory.createForClass(VoiceRoom);