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
exports.HelpRequestRefModel = exports.HelpRequestPriority = exports.HelpRequestCategory = exports.HelpRequestStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var HelpRequestStatus;
(function (HelpRequestStatus) {
    HelpRequestStatus["OPEN"] = "open";
    HelpRequestStatus["IN_PROGRESS"] = "in_progress";
    HelpRequestStatus["RESOLVED"] = "resolved";
    HelpRequestStatus["CLOSED"] = "closed";
})(HelpRequestStatus || (exports.HelpRequestStatus = HelpRequestStatus = {}));
var HelpRequestCategory;
(function (HelpRequestCategory) {
    HelpRequestCategory["ACCOUNT"] = "account";
    HelpRequestCategory["BOOKING"] = "booking";
    HelpRequestCategory["PAYMENT"] = "payment";
    HelpRequestCategory["TECHNICAL"] = "technical";
    HelpRequestCategory["OTHER"] = "other";
})(HelpRequestCategory || (exports.HelpRequestCategory = HelpRequestCategory = {}));
var HelpRequestPriority;
(function (HelpRequestPriority) {
    HelpRequestPriority["LOW"] = "low";
    HelpRequestPriority["MEDIUM"] = "medium";
    HelpRequestPriority["HIGH"] = "high";
    HelpRequestPriority["URGENT"] = "urgent";
})(HelpRequestPriority || (exports.HelpRequestPriority = HelpRequestPriority = {}));
var HelpRequestRefModel;
(function (HelpRequestRefModel) {
    HelpRequestRefModel["BOOKING"] = "Booking";
    HelpRequestRefModel["USER"] = "User";
})(HelpRequestRefModel || (exports.HelpRequestRefModel = HelpRequestRefModel = {}));
const helpResponseSchema = new mongoose_1.Schema({
    responder: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    attachments: {
        type: [String],
        default: []
    }
}, { timestamps: true });
const helpRequestSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    issue: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: Object.values(HelpRequestCategory),
        default: HelpRequestCategory.OTHER
    },
    priority: {
        type: String,
        enum: Object.values(HelpRequestPriority),
        default: HelpRequestPriority.MEDIUM
    },
    status: {
        type: String,
        enum: Object.values(HelpRequestStatus),
        default: HelpRequestStatus.OPEN
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    responses: [helpResponseSchema],
    relatedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'onModel',
        default: null
    },
    onModel: {
        type: String,
        enum: [...Object.values(HelpRequestRefModel), null],
        default: null
    }
}, { timestamps: true });
helpRequestSchema.index({ user: 1, createdAt: -1 });
helpRequestSchema.index({ status: 1, priority: -1 });
helpRequestSchema.index({ assignedTo: 1, status: 1 });
const HelpRequest = mongoose_1.default.model('HelpRequest', helpRequestSchema);
exports.default = HelpRequest;
//# sourceMappingURL=help.model.js.map