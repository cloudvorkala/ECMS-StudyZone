import { Request, Response } from 'express';
export declare class NotificationController {
    getUserNotifications(req: Request, res: Response): Promise<void>;
    markAsRead(req: Request, res: Response): Promise<void>;
    markAllAsRead(req: Request, res: Response): Promise<void>;
    deleteNotification(req: Request, res: Response): Promise<void>;
    getUnreadCount(req: Request, res: Response): Promise<void>;
}
declare const _default: NotificationController;
export default _default;
