import { Model } from 'mongoose';
import { Availability } from '../models/availability.model';
export declare class AvailabilityService {
    private availabilityModel;
    constructor(availabilityModel: Model<Availability>);
    createAvailability(data: Partial<Availability>): Promise<import("mongoose").Document<unknown, {}, Availability, {}> & Availability & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    getAvailabilityByMentor(mentorId: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Availability, {}> & Availability & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null, import("mongoose").Document<unknown, {}, Availability, {}> & Availability & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, Availability, "findOne", {}>;
}
