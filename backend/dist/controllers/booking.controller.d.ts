import { BookingService } from '../services/booking.service';
export declare class BookingController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    create(body: any): Promise<import("mongoose").Document<unknown, {}, import("../models/booking.model").Booking, {}> & import("../models/booking.model").Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateStatus(bookingId: string, status: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("../models/booking.model").Booking, {}> & import("../models/booking.model").Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null, import("mongoose").Document<unknown, {}, import("../models/booking.model").Booking, {}> & import("../models/booking.model").Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("../models/booking.model").Booking, "findOneAndUpdate", {}>;
    findMentorBookings(mentorId: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("../models/booking.model").Booking, {}> & import("../models/booking.model").Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("../models/booking.model").Booking, {}> & import("../models/booking.model").Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("../models/booking.model").Booking, "find", {}>;
}
