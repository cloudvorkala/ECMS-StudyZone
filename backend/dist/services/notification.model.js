"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRefModel = exports.NotificationType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var NotificationType;
(function (NotificationType) {
    NotificationType["SYSTEM"] = "system";
    NotificationType["BOOKING"] = "booking";
    NotificationType["REMINDER"] = "reminder";
    NotificationType["MESSAGE"] = "message";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var NotificationRefModel;
(function (NotificationRefModel) {
    NotificationRefModel["BOOKING"] = "Booking";
    NotificationRefModel["USER"] = "User";
    NotificationRefModel["HELP_REQUEST"] = "HelpRequest";
})(NotificationRefModel || (exports.NotificationRefModel = NotificationRefModel = {}));
const notificationSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: 'Notification'
    },
    type: {
        type: String,
        enum: Object.values(NotificationType),
        default: NotificationType.SYSTEM
    },
    isRead: {
        type: Boolean,
        default: false
    },
    relatedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'onModel',
        default: null
    },
    onModel: {
        type: String,
        enum: [...Object.values(NotificationRefModel), null],
        default: null
    },
    action: {
        type: String,
        default: null
    },
    actionUrl: {
        type: String,
        default: null
    }
}, { timestamps: true });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
const Notification = mongoose_1.default.model('Notification', notificationSchema);
exports.default = Notification;
//# sourceMappingURL=notification.model.js.map