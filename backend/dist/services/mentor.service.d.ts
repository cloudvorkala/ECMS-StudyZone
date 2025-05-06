import { IMentorDocument } from '../models/mentor.model';
import { CreateMentorDto, UpdateMentorDto, MentorSearchDto, AvailabilityDto } from '../dtos/mentor.dto';
export declare class MentorService {
    createProfile(userId: string, mentorData: CreateMentorDto): Promise<IMentorDocument>;
    getProfileById(mentorId: string): Promise<IMentorDocument | null>;
    getProfileByUserId(userId: string): Promise<IMentorDocument | null>;
    updateProfile(userId: string, updateData: UpdateMentorDto): Promise<IMentorDocument | null>;
    searchMentors(searchDto: MentorSearchDto): Promise<{
        mentors: IMentorDocument[];
        totalPages: number;
        currentPage: number;
        total: number;
    }>;
    getAvailability(mentorId: string): Promise<any[]>;
    updateAvailability(userId: string, availabilityData: AvailabilityDto[]): Promise<any[]>;
    getTopRatedMentors(limit: number): Promise<IMentorDocument[]>;
    getExpertiseOptions(): Promise<string[]>;
    updateRating(mentorId: string, rating: number): Promise<void>;
}
declare const _default: MentorService;
export default _default;
