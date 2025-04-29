// src/models/help.model.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IUserDocument } from './user.model';

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

export interface IHelpResponse {
  responder: Types.ObjectId | IUserDocument;
  message: string;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IHelpResponseDocument extends IHelpResponse, Document {}

export interface IHelpRequest {
  user: Types.ObjectId | IUserDocument;
  title: string;
  issue: string;
  category: HelpRequestCategory;
  priority: HelpRequestPriority;
  status: HelpRequestStatus;
  assignedTo?: Types.ObjectId | IUserDocument;
  resolvedAt?: Date;
  responses: IHelpResponseDocument[];
  relatedTo?: Types.ObjectId;
  onModel?: HelpRequestRefModel | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHelpRequestDocument extends IHelpRequest, Document {
  // Add any instance methods here
}

export interface IHelpRequestModel extends Model<IHelpRequestDocument> {
  // Add any static methods here
}

const helpResponseSchema = new Schema<IHelpResponseDocument>(
  {
    responder: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    attachments: {
      type: [String],
      default: []
    }
  }, 
  { timestamps: true }
);

const helpRequestSchema = new Schema<IHelpRequestDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    issue: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: Object.values(HelpRequestCategory),
      default: HelpRequestCategory.OTHER
    },
    priority: {
      type: String,
      enum: Object.values(HelpRequestPriority),
      default: HelpRequestPriority.MEDIUM
    },
    status: {
      type: String,
      enum: Object.values(HelpRequestStatus),
      default: HelpRequestStatus.OPEN
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    responses: [helpResponseSchema],
    relatedTo: {
      type: Schema.Types.ObjectId,
      refPath: 'onModel',
      default: null
    },
    onModel: {
      type: String,
      enum: [...Object.values(HelpRequestRefModel), null],
      default: null
    }
  }, 
  { timestamps: true }
);

// Indexes for efficient queries
helpRequestSchema.index({ user: 1, createdAt: -1 });
helpRequestSchema.index({ status: 1, priority: -1 });
helpRequestSchema.index({ assignedTo: 1, status: 1 });

const HelpRequest = mongoose.model<IHelpRequestDocument, IHelpRequestModel>('HelpRequest', helpRequestSchema);

export default HelpRequest;