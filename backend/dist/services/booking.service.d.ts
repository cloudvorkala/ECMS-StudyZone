import { Model } from 'mongoose';
import { Booking } from '../models/booking.model';
export declare class BookingService {
    private bookingModel;
    constructor(bookingModel: Model<Booking>);
    createBooking(data: Partial<Booking>): Promise<import("mongoose").Document<unknown, {}, Booking, {}> & Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateBookingStatus(bookingId: string, status: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Booking, {}> & Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null, import("mongoose").Document<unknown, {}, Booking, {}> & Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, Booking, "findOneAndUpdate", {}>;
    getBookingsByMentor(mentorId: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Booking, {}> & Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, Booking, {}> & Booking & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, Booking, "find", {}>;
}
