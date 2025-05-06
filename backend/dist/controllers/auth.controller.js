"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = __importDefault(require("../services/auth.service"));
const errorHandler_1 = require("../utils/errorHandler");
class AuthController {
    async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const userData = req.body;
            if (userData.password !== userData.confirmPassword) {
                res.status(400).json({ message: 'Passwords do not match' });
                return;
            }
            const { user, token } = await auth_service_1.default.register(userData);
            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles
                }
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const loginData = req.body;
            const { user, token } = await auth_service_1.default.login(loginData);
            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles
                }
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async changePassword(req, res) {
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
            const passwordData = req.body;
            if (passwordData.newPassword !== passwordData.confirmNewPassword) {
                res.status(400).json({ message: 'New passwords do not match' });
                return;
            }
            const user = await auth_service_1.default.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const isPasswordValid = await user.comparePassword(passwordData.currentPassword);
            if (!isPasswordValid) {
                res.status(401).json({ message: 'Current password is incorrect' });
                return;
            }
            user.password = passwordData.newPassword;
            await user.save();
            res.status(200).json({ message: 'Password changed successfully' });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const user = await auth_service_1.default.getUserById(userId);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json({
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const resetToken = await auth_service_1.default.generatePasswordResetToken(email);
            res.status(200).json({
                message: 'If your email is registered, you will receive a password reset link',
                resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async resetPassword(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({ errors: errors.array() });
                return;
            }
            const resetData = req.body;
            if (resetData.newPassword !== resetData.confirmNewPassword) {
                res.status(400).json({ message: 'Passwords do not match' });
                return;
            }
            await auth_service_1.default.resetPassword(resetData);
            res.status(200).json({ message: 'Password has been reset successfully' });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({ message: 'Refresh token is required' });
                return;
            }
            const result = await auth_service_1.default.refreshToken(refreshToken);
            if (!result) {
                res.status(401).json({ message: 'Invalid or expired refresh token' });
                return;
            }
            res.status(200).json({
                token: result.token,
                user: {
                    id: result.user._id,
                    username: result.user.username,
                    email: result.user.email,
                    roles: result.user.roles
                }
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async logout(_req, res) {
        try {
            res.status(200).json({ message: 'Logged out successfully' });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map