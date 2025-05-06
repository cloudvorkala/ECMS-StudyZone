import { Document, Types } from 'mongoose';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Declined';
export declare class Booking extends Document {
    studentId: Types.ObjectId;
    mentorId: Types.ObjectId;
    subject: string;
    requestedTime: Date;
    status: BookingStatus;
    helpDetails?: string;
}
export declare const BookingSchema: import("mongoose").Schema<Booking, import("mongoose").Model<Booking, any, any, any, Document<unknown, any, Booking, any> & Booking & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Booking, Document<unknown, {}, import("mongoose").FlatRecord<Booking>, {}> & import("mongoose").FlatRecord<Booking> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
