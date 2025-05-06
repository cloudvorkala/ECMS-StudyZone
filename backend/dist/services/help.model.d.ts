import { Document, Model, Types } from 'mongoose';
import { IUserDocument } from './user.model';
export declare enum HelpRequestStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
export declare enum HelpRequestCategory {
    ACCOUNT = "account",
    BOOKING = "booking",
    PAYMENT = "payment",
    TECHNICAL = "technical",
    OTHER = "other"
}
export declare enum HelpRequestPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare enum HelpRequestRefModel {
    BOOKING = "Booking",
    USER = "User"
}
export interface IHelpResponse {
    responder: Types.ObjectId | IUserDocument;
    message: string;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface IHelpResponseDocument extends IHelpResponse, Document {
}
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
}
export interface IHelpRequestModel extends Model<IHelpRequestDocument> {
}
declare const HelpRequest: IHelpRequestModel;
export default HelpRequest;
