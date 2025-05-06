"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const mentor_controller_1 = __importDefault(require("../controllers/mentor.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
router.get('/expertise', mentor_controller_1.default.getExpertiseOptions.bind(mentor_controller_1.default));
router.get('/search', mentor_controller_1.default.searchMentors.bind(mentor_controller_1.default));
router.get('/top-rated', mentor_controller_1.default.getTopRated.bind(mentor_controller_1.default));
router.post('/', auth_middleware_1.authMiddleware, [
    (0, express_validator_1.body)('expertise').isArray().withMessage('Expertise must be an array'),
    (0, express_validator_1.body)('hourlyRate').isNumeric().withMessage('Hourly rate must be a number'),
    (0, express_validator_1.body)('bio').optional().isString().withMessage('Bio must be a string'),
    (0, express_validator_1.body)('profileImageUrl').optional().isURL().withMessage('Profile image URL must be valid'),
    (0, express_validator_1.body)('education').optional().isArray().withMessage('Education must be an array'),
    (0, express_validator_1.body)('experience').optional().isArray().withMessage('Experience must be an array'),
    (0, express_validator_1.body)('languages').optional().isArray().withMessage('Languages must be an array')
], mentor_controller_1.default.createProfile.bind(mentor_controller_1.default));
router.get('/my-profile', auth_middleware_1.authMiddleware, mentor_controller_1.default.getMyProfile.bind(mentor_controller_1.default));
router.put('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.roleMiddleware)([user_model_1.UserRole.MENTOR]), [
    (0, express_validator_1.body)('expertise').optional().isArray().withMessage('Expertise must be an array'),
    (0, express_validator_1.body)('hourlyRate').optional().isNumeric().withMessage('Hourly rate must be a number'),
    (0, express_validator_1.body)('bio').optional().isString().withMessage('Bio must be a string'),
    (0, express_validator_1.body)('profileImageUrl').optional().isURL().withMessage('Profile image URL must be valid'),
    (0, express_validator_1.body)('education').optional().isArray().withMessage('Education must be an array'),
    (0, express_validator_1.body)('experience').optional().isArray().withMessage('Experience must be an array'),
    (0, express_validator_1.body)('languages').optional().isArray().withMessage('Languages must be an array')
], mentor_controller_1.default.updateProfile.bind(mentor_controller_1.default));
router.get('/:id/availability', mentor_controller_1.default.getAvailability.bind(mentor_controller_1.default));
router.put('/availability', auth_middleware_1.authMiddleware, (0, auth_middleware_1.roleMiddleware)([user_model_1.UserRole.MENTOR]), [
    (0, express_validator_1.body)().isArray().withMessage('Request body must be an array of availability slots'),
    (0, express_validator_1.body)('*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
    (0, express_validator_1.body)('*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in format HH:MM'),
    (0, express_validator_1.body)('*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in format HH:MM'),
    (0, express_validator_1.body)('*.isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
    (0, express_validator_1.body)('*.specificDate').optional().isISO8601().withMessage('specificDate must be a valid date')
], mentor_controller_1.default.updateAvailability.bind(mentor_controller_1.default));
router.get('/:id', mentor_controller_1.default.getProfile.bind(mentor_controller_1.default));
exports.default = router;
//# sourceMappingURL=mentor.routes.js.map