"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = __importDefault(require("../services/notification.service"));
const errorHandler_1 = require("../utils/errorHandler");
class NotificationController {
    async getUserNotifications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const { notifications, unreadCount } = await notification_service_1.default.getUserNotifications(userId);
            res.status(200).json({
                notifications,
                unreadCount
            });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async markAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const notificationId = req.params.id;
            const success = await notification_service_1.default.markAsRead(notificationId, userId);
            if (!success) {
                res.status(404).json({ message: 'Notification not found or does not belong to user' });
                return;
            }
            res.status(200).json({ message: 'Notification marked as read' });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async markAllAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const success = await notification_service_1.default.markAllAsRead(userId);
            if (!success) {
                res.status(500).json({ message: 'Failed to mark notifications as read' });
                return;
            }
            res.status(200).json({ message: 'All notifications marked as read' });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async deleteNotification(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const notificationId = req.params.id;
            const success = await notification_service_1.default.deleteNotification(notificationId, userId);
            if (!success) {
                res.status(404).json({ message: 'Notification not found or does not belong to user' });
                return;
            }
            res.status(200).json({ message: 'Notification deleted successfully' });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
    async getUnreadCount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }
            const count = await notification_service_1.default.getUnreadCount(userId);
            res.status(200).json({ count });
        }
        catch (error) {
            (0, errorHandler_1.errorHandler)(error, res);
        }
    }
}
exports.NotificationController = NotificationController;
exports.default = new NotificationController();
//# sourceMappingURL=notification.controller.js.map