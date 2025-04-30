import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Availability extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  mentorId: Types.ObjectId;

  @Prop([
    {
      date: { type: Date, required: true },
      timeSlots: [{ type: String }],
    },
  ])
  availableSlots: { date: Date; timeSlots: string[] }[];
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);
