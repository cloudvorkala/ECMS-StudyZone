import { SessionService } from '../services/session.service';
export declare class SessionController {
    private readonly sessionService;
    constructor(sessionService: SessionService);
    create(body: any): Promise<import("mongoose").Document<unknown, {}, import("../models/session.model").Session, {}> & import("../models/session.model").Session & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findMentorSessions(mentorId: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("../models/session.model").Session, {}> & import("../models/session.model").Session & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("../models/session.model").Session, {}> & import("../models/session.model").Session & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("../models/session.model").Session, "find", {}>;
}
