import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class TimeSlot extends Document {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  mentor!: User;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop({ default: true })
  isAvailable!: boolean;
}

export const TimeSlotSchema = SchemaFactory.createForClass(TimeSlot);