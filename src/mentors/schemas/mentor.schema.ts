// src/mentors/schemas/mentor.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type MentorDocument = Mentor & Document;

@Schema({ timestamps: true })
export class Mentor {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  })
  user: User;

  @Prop({ type: [String], default: [] })
  expertise: string[];

  @Prop({ required: true, min: 0 })
  hourlyRate: number;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0, min: 0 })
  ratingCount: number;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  profileImageUrl: string;

  @Prop({ type: [String], default: [] })
  education: string[];

  @Prop({ type: [String], default: [] })
  experience: string[];

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ default: 'UTC' })
  timeZone: string;

  // 计算平均评分的虚拟字段
  get averageRating(): number {
    if (this.ratingCount === 0) return 0;
    return this.rating / this.ratingCount;
  }
}

export const MentorSchema = SchemaFactory.createForClass(Mentor);

// 添加虚拟属性
MentorSchema.virtual('averageRating').get(function() {
  if (this.ratingCount === 0) return 0;
  return this.rating / this.ratingCount;
});

// 配置模式选项
MentorSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// 创建索引以提高搜索性能
MentorSchema.index({ expertise: 1 });
MentorSchema.index({ hourlyRate: 1 });
MentorSchema.index({ rating: -1 });