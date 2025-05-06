import { Document, Model } from 'mongoose';
export declare enum UserRole {
    USER = "user",
    MENTOR = "mentor",
    ADMIN = "admin",
    SUPPORT = "support"
}
export interface IUser {
    username: string;
    email: string;
    password: string;
    roles: UserRole[];
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserDocument extends IUser, Document {
    comparePassword(password: string): Promise<boolean>;
}
export interface IUserModel extends Model<IUserDocument> {
}
declare const User: IUserModel;
export default User;
