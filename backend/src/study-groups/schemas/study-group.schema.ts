import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

@Schema({ timestamps: true })
export class StudyGroup extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  mentor!: MongooseSchema.Types.ObjectId | User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  students!: (MongooseSchema.Types.ObjectId | User)[];

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  description?: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
  pendingStudents!: MongooseSchema.Types.ObjectId[];
}

export const StudyGroupSchema = SchemaFactory.createForClass(StudyGroup);