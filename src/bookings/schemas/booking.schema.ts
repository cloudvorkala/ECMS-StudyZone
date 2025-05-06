import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  mentorId: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ default: 'pending' })
  status: string;  // pending, confirmed, cancelled
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
