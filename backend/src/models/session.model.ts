import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionStatus = 'Upcoming' | 'Completed' | 'Cancelled';

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  mentorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  scheduledTime: Date;

  @Prop({ enum: ['Upcoming', 'Completed', 'Cancelled'], default: 'Upcoming' })
  status: SessionStatus;

  @Prop()
  feedback?: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
