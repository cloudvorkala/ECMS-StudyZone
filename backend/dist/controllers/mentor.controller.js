"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorController = void 0;
const express_validator_1 = require("express-validator");
const mentor_service_1 = __importDefault(require("../services/mentor.service"));
const errorHandler_1 = require("../utils/errorHandler");
const user_model_1 = require("../models/user.model");
class MentorController {
    async createProfile(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const mentorData = req.body;
            const mentor = await mentor_service_1.default.createProfile(userId, mentorData);
            res.status(201).json({
                message: 'Mentor profile created successfully',
                mentor
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async getProfile(req, res) {
        try {
            const mentorId = req.params.id;
            const mentor = await mentor_service_1.default.getProfileById(mentorId);
            if (!mentor) {
                res.status(404).json({ message: 'Mentor not found' });
                return;
            }
            res.status(200).json({ mentor });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async getMyProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const mentor = await mentor_service_1.default.getProfileByUserId(userId);
            if (!mentor) {
                res.status(404).json({ message: 'Mentor profile not found' });
                return;
            }
            res.status(200).json({ mentor });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async updateProfile(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const updateData = req.body;
            const updatedMentor = await mentor_service_1.default.updateProfile(userId, updateData);
            if (!updatedMentor) {
                res.status(404).json({ message: 'Mentor profile not found' });
                return;
            }
            res.status(200).json({
                message: 'Mentor profile updated successfully',
                mentor: updatedMentor
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async searchMentors(req, res) {
        try {
            const searchDto = {
                expertise: req.query.expertise || [],
                maxRate: req.query.maxRate ? parseFloat(req.query.maxRate) : undefined,
                searchTerm: req.query.searchTerm || '',
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10
            };
            const { mentors, totalPages, currentPage, total } = await mentor_service_1.default.searchMentors(searchDto);
            res.status(200).json({
                mentors,
                totalPages,
                currentPage,
                total
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async getAvailability(req, res) {
        try {
            const mentorId = req.params.id;
            const availability = await mentor_service_1.default.getAvailability(mentorId);
            res.status(200).json({ availability });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async updateAvailability(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            if (!req.user?.roles.includes(user_model_1.UserRole.MENTOR)) {
                res.status(403).json({ message: 'Permission denied. Mentor role required.' });
                return;
            }
            const availabilityData = req.body;
            const availability = await mentor_service_1.default.updateAvailability(userId, availabilityData);
            res.status(200).json({
                message: 'Availability updated successfully',
                availability
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async getTopRated(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 5;
            const mentors = await mentor_service_1.default.getTopRatedMentors(limit);
            res.status(200).json({ mentors });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async getExpertiseOptions(_req, res) {
        try {
            const expertiseOptions = await mentor_service_1.default.getExpertiseOptions();
            res.status(200).json({ expertiseOptions });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
}
exports.MentorController = MentorController;
exports.default = new MentorController();
//# sourceMappingURL=mentor.controller.js.map