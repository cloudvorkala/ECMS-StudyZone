import { AvailabilityService } from '../services/availability.service';
export declare class AvailabilityController {
    private readonly availabilityService;
    constructor(availabilityService: AvailabilityService);
    create(body: any): Promise<import("mongoose").Document<unknown, {}, import("../models/availability.model").Availability, {}> & import("../models/availability.model").Availability & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    find(mentorId: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("../models/availability.model").Availability, {}> & import("../models/availability.model").Availability & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null, import("mongoose").Document<unknown, {}, import("../models/availability.model").Availability, {}> & import("../models/availability.model").Availability & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("../models/availability.model").Availability, "findOne", {}>;
}
