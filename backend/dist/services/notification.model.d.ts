import { Document, Model, Types } from 'mongoose';
import { IUserDocument } from '../user.model';
export declare enum NotificationType {
    SYSTEM = "system",
    BOOKING = "booking",
    REMINDER = "reminder",
    MESSAGE = "message"
}
export declare enum NotificationRefModel {
    BOOKING = "Booking",
    USER = "User",
    HELP_REQUEST = "HelpRequest"
}
export interface INotification {
    user: Types.ObjectId | IUserDocument;
    message: string;
    title: string;
    type: NotificationType;
    isRead: boolean;
    relatedTo?: Types.ObjectId;
    onModel?: NotificationRefModel | null;
    action?: string;
    actionUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface INotificationDocument extends INotification, Document {
}
export interface INotificationModel extends Model<INotificationDocument> {
}
declare const Notification: INotificationModel;
export default Notification;
