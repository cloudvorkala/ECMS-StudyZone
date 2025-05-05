// src/help-requests/schemas/help-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type HelpRequestDocument = HelpRequest & Document;

export enum HelpRequestStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum HelpRequestCategory {
  ACCOUNT = 'account',
  BOOKING = 'booking',
  PAYMENT = 'payment',
  TECHNICAL = 'technical',
  OTHER = 'other'
}

export enum HelpRequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum HelpRequestRefModel {
  BOOKING = 'Booking',
  USER = 'User'
}

export interface HelpResponse {
  _id?: string;
  responder: User | MongooseSchema.Types.ObjectId;
  message: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class HelpRequest {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  })
  user: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  issue: string;

  @Prop({ 
    type: String, 
    enum: Object.values(HelpRequestCategory), 
    default: HelpRequestCategory.OTHER 
  })
  category: HelpRequestCategory;

  @Prop({ 
    type: String, 
    enum: Object.values(HelpRequestPriority), 
    default: HelpRequestPriority.MEDIUM 
  })
  priority: HelpRequestPriority;

  @Prop({ 
    type: String, 
    enum: Object.values(HelpRequestStatus), 
    default: HelpRequestStatus.OPEN 
  })
  status: HelpRequestStatus;

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  })
  assignedTo?: User;

  @Prop({ type: Date, default: null })
  resolvedAt?: Date;

  @Prop({ 
    type: [{
      responder: { type: MongooseSchema.Types.ObjectId, ref: 'User', required: true },
      message: { type: String, required: true },
      attachments: { type: [String], default: [] },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  responses: HelpResponse[];

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    refPath: 'onModel',
    default: null 
  })
  relatedTo?: MongooseSchema.Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(HelpRequestRefModel),
    default: null 
  })
  onModel?: HelpRequestRefModel;
}

export const HelpRequestSchema = SchemaFactory.createForClass(HelpRequest);

// 配置模式选项
HelpRequestSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    
    // 转换响应中的ID
    if (ret.responses && ret.responses.length > 0) {
      ret.responses = ret.responses.map(response => {
        if (response._id) {
          response.id = response._id;
          delete response._id;
        }
        return response;
      });
    }
    
    return ret;
  },
});

// 创建索引以提高查询性能
HelpRequestSchema.index({ user: 1, createdAt: -1 });
HelpRequestSchema.index({ status: 1, priority: -1 });
HelpRequestSchema.index({ assignedTo: 1, status: 1 });