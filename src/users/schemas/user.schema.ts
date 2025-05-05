// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'user',
  MENTOR = 'mentor',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], enum: Object.values(UserRole), default: [UserRole.USER] })
  roles: UserRole[];
  
  @Prop()
  firstName?: string;
  
  @Prop()
  lastName?: string;
  
  @Prop()
  profileImageUrl?: string;
  
  @Prop()
  bio?: string;
  
  @Prop({ default: null })
  lastLogin: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  // 用于比较密码的实例方法
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// 添加中间件：保存前加密密码
UserSchema.pre('save', async function(next) {
  const user = this as UserDocument;
  
  // 仅当密码被修改或新用户时加密密码
  if (!user.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 去除返回给客户端的密码字段
UserSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
    delete returnedObject.passwordResetToken;
    delete returnedObject.passwordResetExpires;
  },
});