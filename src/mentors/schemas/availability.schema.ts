// src/mentors/schemas/availability.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Mentor } from './mentor.schema';

export type AvailabilityDocument = Availability & Document;

@Schema({ timestamps: true })
export class Availability {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'Mentor', 
    required: true 
  })
  mentor: Mentor;

  @Prop({ required: true, min: 0, max: 6 })
  dayOfWeek: number; // 0-6 (星期日-星期六)

  @Prop({ 
    required: true, 
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  })
  startTime: string; // 格式: "HH:MM" 24小时制

  @Prop({ 
    required: true,
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  })
  endTime: string; // 格式: "HH:MM" 24小时制

  @Prop({ default: true })
  isRecurring: boolean;

  @Prop({ type: Date, default: null })
  specificDate: Date;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);

// 配置模式选项
AvailabilitySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// 添加验证：确保结束时间晚于开始时间
AvailabilitySchema.pre('validate', function(next) {
  const availability = this as AvailabilityDocument;
  
  const start = availability.startTime.split(':').map(Number);
  const end = availability.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    this.invalidate('endTime', 'End time must be later than start time');
  }
  
  next();
});

// 创建索引以提高查询性能
AvailabilitySchema.index({ mentor: 1, dayOfWeek: 1 });
AvailabilitySchema.index({ mentor: 1, specificDate: 1 });