import { Request, Response, NextFunction } from 'express';
import { TokenData } from '../dtos/auth.dto';
declare global {
    namespace Express {
        interface Request {
            user?: TokenData;
        }
    }
}
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const roleMiddleware: (roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
