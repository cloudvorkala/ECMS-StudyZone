import { Request, Response } from 'express';
export declare class MentorController {
    createProfile(req: Request, res: Response): Promise<void>;
    getProfile(req: Request, res: Response): Promise<void>;
    getMyProfile(req: Request, res: Response): Promise<void>;
    updateProfile(req: Request, res: Response): Promise<void>;
    searchMentors(req: Request, res: Response): Promise<void>;
    getAvailability(req: Request, res: Response): Promise<void>;
    updateAvailability(req: Request, res: Response): Promise<void>;
    getTopRated(req: Request, res: Response): Promise<void>;
    getExpertiseOptions(_req: Request, res: Response): Promise<void>;
}
declare const _default: MentorController;
export default _default;
