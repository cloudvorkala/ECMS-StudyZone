export interface CreateMentorDto {
    expertise: string[];
    hourlyRate: number;
    bio?: string;
    profileImageUrl?: string;
    education?: string[];
    experience?: string[];
    languages?: string[];
    timeZone?: string;
}
export interface UpdateMentorDto {
    expertise?: string[];
    hourlyRate?: number;
    bio?: string;
    profileImageUrl?: string;
    education?: string[];
    experience?: string[];
    languages?: string[];
    timeZone?: string;
}
export interface MentorSearchDto {
    expertise?: string[];
    maxRate?: number;
    searchTerm?: string;
    page: number;
    limit: number;
}
export interface AvailabilityDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isRecurring?: boolean;
    specificDate?: Date;
}
export interface MentorProfileDto {
    id: string;
    userId: string;
    username: string;
    email: string;
    expertise: string[];
    hourlyRate: number;
    rating: number;
    ratingCount: number;
    bio: string;
    profileImageUrl: string;
    education: string[];
    experience: string[];
    languages: string[];
    timeZone: string;
}
