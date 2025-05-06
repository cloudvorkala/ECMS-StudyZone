// src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

// Enhanced UserDocument type with explicit _id typing
export type UserDocument = User & Document & { _id: Types.ObjectId };

export enum UserRole {
  USER = 'user',
  MENTOR = 'mentor',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

@Schema({ timestamps: true })
export class User {
  // Virtual property that will be populated from _id
  id: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: [String],
    enum: Object.values(UserRole),
    default: [UserRole.USER],
  })
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

  // Password comparison method
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add virtual 'id' property
UserSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Pre-save middleware for password hashing
UserSchema.pre('save', async function (next) {
  const user = this as UserDocument;

  // Only hash password when modified or new
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: unknown) {
    // Properly type the error and pass it to next
    next(error as Error);
  }
});

// Transform for JSON responses
UserSchema.set('toJSON', {
  virtuals: true, // Include virtuals
  transform: (document, returnedObject) => {
    // id is already added as a virtual
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password;
    delete returnedObject.passwordResetToken;
    delete returnedObject.passwordResetExpires;
  },
});
