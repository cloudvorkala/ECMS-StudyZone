import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true })
  bookingId!: string;

  @Prop()
  roomId?: string;

  @Prop()
  feedback?: string;

  @Prop()
  rating?: number;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
