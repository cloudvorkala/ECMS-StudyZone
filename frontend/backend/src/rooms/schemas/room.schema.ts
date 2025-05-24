import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ default: false })
  isInUse!: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
