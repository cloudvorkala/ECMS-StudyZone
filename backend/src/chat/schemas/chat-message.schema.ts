import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export interface IChatMessage {
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class ChatMessage extends Document implements IChatMessage {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'StudyGroup' })
  groupId!: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  senderId!: string;

  @Prop({ required: true })
  senderName!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  readBy!: string[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);