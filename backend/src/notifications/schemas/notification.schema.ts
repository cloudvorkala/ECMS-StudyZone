import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum NotificationType {
  ANNOUNCEMENT = 'announcement',
  MAINTENANCE = 'maintenance',
  UPDATE = 'update',
  EMERGENCY = 'emergency'
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, enum: NotificationType })
  type!: NotificationType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy!: MongooseSchema.Types.ObjectId | User;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: Date.now })
  startDate!: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  readBy!: MongooseSchema.Types.ObjectId[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);