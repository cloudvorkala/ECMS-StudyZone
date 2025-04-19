// src/models/mentor.model.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IUserDocument } from './user.model';

export interface IMentor {
  user: Types.ObjectId | IUserDocument;
  expertise: string[];
  hourlyRate: number;
  rating: number;
  ratingCount: number;
  bio: string;
  profileImageUrl: string;
  education: string[];
  experience: string[];
  languages: string[];
  timeZone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentorDocument extends IMentor, Document {
  // Add any instance methods here
  averageRating: number;
}

export interface IMentorModel extends Model<IMentorDocument> {
  // Add any static methods here
}

const mentorSchema = new Schema<IMentorDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    expertise: {
      type: [String],
      default: []
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    bio: {
      type: String,
      default: ''
    },
    profileImageUrl: {
      type: String,
      default: ''
    },
    education: {
      type: [String],
      default: []
    },
    experience: {
      type: [String],
      default: []
    },
    languages: {
      type: [String],
      default: []
    },
    timeZone: {
      type: String,
      default: 'UTC'
    }
  }, 
  { timestamps: true }
);

// Virtual for average rating calculation
mentorSchema.virtual('averageRating').get(function(this: IMentorDocument) {
  if (this.ratingCount === 0) return 0;
  return this.rating / this.ratingCount;
});

// Index for search capabilities
mentorSchema.index({ expertise: 1 });
mentorSchema.index({ hourlyRate: 1 });
mentorSchema.index({ rating: -1 });

const Mentor = mongoose.model<IMentorDocument, IMentorModel>('Mentor', mentorSchema);

export default Mentor;