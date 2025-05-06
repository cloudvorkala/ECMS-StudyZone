import { Types } from 'mongoose';
import { IUserDocument } from '../models/user.model';
import { TokenData, RegisterUserDto, LoginUserDto, ResetPasswordDto } from '../dtos/auth.dto';
export declare class AuthService {
    register(userData: RegisterUserDto): Promise<{
        user: IUserDocument;
        token: string;
    }>;
    login(loginData: LoginUserDto): Promise<{
        user: IUserDocument;
        token: string;
    }>;
    generatePasswordResetToken(email: string): Promise<string | null>;
    resetPassword(resetData: ResetPasswordDto): Promise<boolean>;
    generateToken(user: IUserDocument): string;
    verifyToken(token: string): TokenData;
    getUserById(id: string | Types.ObjectId): Promise<IUserDocument | null>;
    refreshToken(token: string): Promise<{
        token: string;
        user: IUserDocument;
    } | null>;
}
declare const _default: AuthService;
export default _default;
