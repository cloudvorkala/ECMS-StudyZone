"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const env_config_1 = __importDefault(require("../config/env.config"));
class AuthService {
    async register(userData) {
        const { email, username, password } = userData;
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const newUser = new user_model_1.default({
            email,
            username,
            password
        });
        await newUser.save();
        const token = this.generateToken(newUser);
        return { user: newUser, token };
    }
    async login(loginData) {
        const { email, password } = loginData;
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        user.lastLogin = new Date();
        await user.save();
        const token = this.generateToken(user);
        return { user, token };
    }
    async generatePasswordResetToken(email) {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            return null;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        await user_model_1.default.findByIdAndUpdate(user._id, {
            $set: {
                passwordResetToken: hashedToken,
                passwordResetExpires: new Date(Date.now() + 3600000)
            }
        });
        return resetToken;
    }
    async resetPassword(resetData) {
        const { token, newPassword } = resetData;
        const hashedToken = crypto_1.default
            .createHash('sha256')
            .update(token)
            .digest('hex');
        const user = await user_model_1.default.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: new Date() }
        });
        if (!user) {
            throw new Error('Invalid or expired token');
        }
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return true;
    }
    generateToken(user) {
        const payload = {
            id: user._id.toString(),
            email: user.email,
            roles: user.roles
        };
        return jsonwebtoken_1.default.sign(payload, env_config_1.default.JWT_SECRET, {
            expiresIn: env_config_1.default.JWT_EXPIRES_IN
        });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_config_1.default.JWT_SECRET);
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    async getUserById(id) {
        return user_model_1.default.findById(id);
    }
    async refreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_config_1.default.JWT_REFRESH_SECRET);
            const user = await this.getUserById(decoded.id);
            if (!user) {
                return null;
            }
            const newToken = this.generateToken(user);
            return { token: newToken, user };
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
//# sourceMappingURL=auth.service.js.map