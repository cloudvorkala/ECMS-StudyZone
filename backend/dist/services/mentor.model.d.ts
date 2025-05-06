import { Document, Model, Types } from 'mongoose';
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
    averageRating: number;
}
export interface IMentorModel extends Model<IMentorDocument> {
}
declare const Mentor: IMentorModel;
export default Mentor;
