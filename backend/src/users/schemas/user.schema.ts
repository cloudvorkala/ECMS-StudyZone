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
  major?: string;

  @Prop()
  year?: string;

  @Prop()
  specialty?: string;

  @Prop({ type: [String], default: [] })
  expertise!: string[];

  @Prop({ type: [String], default: [] })
  interests!: string[];

  @Prop()
  institution?: string;

  @Prop()
  bio?: string;

  @Prop({ default: 0 })
  rating!: number;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);