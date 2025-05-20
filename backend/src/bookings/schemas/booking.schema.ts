import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  _id!: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  student!: User;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  mentor!: User;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop({ required: true, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' })
  status!: string;

  @Prop()
  notes?: string;

  @Prop()
  confirmationCode?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
