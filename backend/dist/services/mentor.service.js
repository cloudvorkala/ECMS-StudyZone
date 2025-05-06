"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorService = void 0;
const mentor_model_1 = __importDefault(require("../models/mentor.model"));
const user_model_1 = __importStar(require("../models/user.model"));
const availability_model_1 = __importDefault(require("../models/availability.model"));
class MentorService {
    async createProfile(userId, mentorData) {
        const existingMentor = await mentor_model_1.default.findOne({ user: userId });
        if (existingMentor) {
            throw new Error('User already has a mentor profile');
        }
        const mentor = new mentor_model_1.default({
            user: userId,
            expertise: mentorData.expertise,
            hourlyRate: mentorData.hourlyRate,
            bio: mentorData.bio,
            profileImageUrl: mentorData.profileImageUrl,
            education: mentorData.education || [],
            experience: mentorData.experience || [],
            languages: mentorData.languages || []
        });
        await mentor.save();
        await user_model_1.default.findByIdAndUpdate(userId, {
            $addToSet: { roles: user_model_1.UserRole.MENTOR }
        });
        return mentor;
    }
    async getProfileById(mentorId) {
        return mentor_model_1.default.findById(mentorId).populate('user', 'username email');
    }
    async getProfileByUserId(userId) {
        return mentor_model_1.default.findOne({ user: userId }).populate('user', 'username email');
    }
    async updateProfile(userId, updateData) {
        const mentor = await mentor_model_1.default.findOne({ user: userId });
        if (!mentor) {
            return null;
        }
        if (updateData.expertise !== undefined)
            mentor.expertise = updateData.expertise;
        if (updateData.hourlyRate !== undefined)
            mentor.hourlyRate = updateData.hourlyRate;
        if (updateData.bio !== undefined)
            mentor.bio = updateData.bio;
        if (updateData.profileImageUrl !== undefined)
            mentor.profileImageUrl = updateData.profileImageUrl;
        if (updateData.education !== undefined)
            mentor.education = updateData.education;
        if (updateData.experience !== undefined)
            mentor.experience = updateData.experience;
        if (updateData.languages !== undefined)
            mentor.languages = updateData.languages;
        if (updateData.timeZone !== undefined)
            mentor.timeZone = updateData.timeZone;
        await mentor.save();
        return mentor;
    }
    async searchMentors(searchDto) {
        const { expertise, maxRate, searchTerm, page, limit } = searchDto;
        const query = {};
        if (expertise && expertise.length > 0) {
            query.expertise = { $in: expertise };
        }
        if (maxRate) {
            query.hourlyRate = { $lte: maxRate };
        }
        if (searchTerm) {
            query.$or = [
                { bio: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const mentors = await mentor_model_1.default.find(query)
            .populate('user', 'username email')
            .skip(skip)
            .limit(limit)
            .sort({ rating: -1 });
        const total = await mentor_model_1.default.countDocuments(query);
        return {
            mentors,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        };
    }
    async getAvailability(mentorId) {
        return availability_model_1.default.find({ mentor: mentorId });
    }
    async updateAvailability(userId, availabilityData) {
        const mentor = await mentor_model_1.default.findOne({ user: userId });
        if (!mentor) {
            throw new Error('Mentor profile not found');
        }
        await availability_model_1.default.deleteMany({ mentor: mentor._id });
        const availabilityPromises = availabilityData.map(slot => {
            const availability = new availability_model_1.default({
                mentor: mentor._id,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isRecurring: slot.isRecurring,
                specificDate: slot.specificDate
            });
            return availability.save();
        });
        return Promise.all(availabilityPromises);
    }
    async getTopRatedMentors(limit) {
        return mentor_model_1.default.find({ ratingCount: { $gt: 0 } })
            .populate('user', 'username email')
            .sort({ rating: -1 })
            .limit(limit);
    }
    async getExpertiseOptions() {
        return [
            'Programming', 'Web Development', 'Mobile Development',
            'Data Science', 'Machine Learning', 'Cloud Computing',
            'DevOps', 'UI/UX Design', 'Product Management',
            'Digital Marketing', 'Business Strategy', 'Leadership'
        ];
    }
    async updateRating(mentorId, rating) {
        const mentor = await mentor_model_1.default.findById(mentorId);
        if (!mentor) {
            throw new Error('Mentor not found');
        }
        mentor.rating = (mentor.rating * mentor.ratingCount + rating) / (mentor.ratingCount + 1);
        mentor.ratingCount += 1;
        await mentor.save();
    }
}
exports.MentorService = MentorService;
exports.default = new MentorService();
//# sourceMappingURL=mentor.service.js.map