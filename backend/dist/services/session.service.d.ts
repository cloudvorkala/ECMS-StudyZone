import { Model } from 'mongoose';
import { Session } from '../models/session.model';
export declare class SessionService {
    private sessionModel;
    constructor(sessionModel: Model<Session>);
    createSession(data: Partial<Session>): Promise<import("mongoose").Document<unknown, {}, Session, {}> & Session & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getSessionsByMentor(mentorId: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Session, {}> & Session & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, Session, {}> & Session & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, Session, "find", {}>;
}
