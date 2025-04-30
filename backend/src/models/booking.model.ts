import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingStatus = 'Pending' | 'Confirmed' | 'Declined';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  mentorId: Types.ObjectId;

  @Prop({ required: true })
  subject: string;

  @Prop({ type: Date, required: true })
  requestedTime: Date;

  @Prop({ enum: ['Pending', 'Confirmed', 'Declined'], default: 'Pending' })
  status: BookingStatus;

  @Prop()
  helpDetails?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
