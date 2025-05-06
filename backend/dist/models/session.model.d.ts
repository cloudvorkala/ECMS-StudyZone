import { Document, Types } from 'mongoose';
export type SessionStatus = 'Upcoming' | 'Completed' | 'Cancelled';
export declare class Session extends Document {
    bookingId: Types.ObjectId;
    mentorId: Types.ObjectId;
    studentId: Types.ObjectId;
    scheduledTime: Date;
    status: SessionStatus;
    feedback?: string;
}
export declare const SessionSchema: import("mongoose").Schema<Session, import("mongoose").Model<Session, any, any, any, Document<unknown, any, Session, any> & Session & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Session, Document<unknown, {}, import("mongoose").FlatRecord<Session>, {}> & import("mongoose").FlatRecord<Session> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
