import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  STUDENT = 'student',
  MENTOR = 'mentor',
}

@Schema()
export class User extends Document {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, enum: UserRole })
  role!: UserRole;

  @Prop()
  phone?: string;

  @Prop()
  studentId?: string;

  @Prop()
  degree?: string;

  @Prop()
  specialty?: string;

  @Prop({ type: [String], default: [] })
  expertise!: string[];

  @Prop()
  institution?: string;

  @Prop({ default: 0 })
  rating!: number;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);