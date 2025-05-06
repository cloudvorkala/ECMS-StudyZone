"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    (0, express_validator_1.body)('confirmPassword').notEmpty().withMessage('Please confirm your password')
], auth_controller_1.default.register.bind(auth_controller_1.default));
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
], auth_controller_1.default.login.bind(auth_controller_1.default));
router.post('/change-password', auth_middleware_1.authMiddleware, [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
    (0, express_validator_1.body)('confirmNewPassword').notEmpty().withMessage('Please confirm your new password')
], auth_controller_1.default.changePassword.bind(auth_controller_1.default));
router.get('/profile', auth_middleware_1.authMiddleware, auth_controller_1.default.getProfile.bind(auth_controller_1.default));
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], auth_controller_1.default.forgotPassword.bind(auth_controller_1.default));
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Token is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
    (0, express_validator_1.body)('confirmNewPassword').notEmpty().withMessage('Please confirm your new password')
], auth_controller_1.default.resetPassword.bind(auth_controller_1.default));
router.post('/refresh-token', [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required')
], auth_controller_1.default.refreshToken.bind(auth_controller_1.default));
router.post('/logout', auth_middleware_1.authMiddleware, auth_controller_1.default.logout.bind(auth_controller_1.default));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map