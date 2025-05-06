"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const availability_model_1 = require("./models/availability.model");
const booking_model_1 = require("./models/booking.model");
const session_model_1 = require("./models/session.model");
const availability_controller_1 = require("./controllers/availability.controller");
const booking_controller_1 = require("./controllers/booking.controller");
const session_controller_1 = require("./controllers/session.controller");
const availability_service_1 = require("./services/availability.service");
const booking_service_1 = require("./services/booking.service");
const session_service_1 = require("./services/session.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            mongoose_1.MongooseModule.forRoot(process.env.DB_URI),
            mongoose_1.MongooseModule.forFeature([
                { name: availability_model_1.Availability.name, schema: availability_model_1.AvailabilitySchema },
                { name: booking_model_1.Booking.name, schema: booking_model_1.BookingSchema },
                { name: session_model_1.Session.name, schema: session_model_1.SessionSchema },
            ]),
        ],
        controllers: [
            app_controller_1.AppController,
            availability_controller_1.AvailabilityController,
            booking_controller_1.BookingController,
            session_controller_1.SessionController,
        ],
        providers: [app_service_1.AppService, availability_service_1.AvailabilityService, booking_service_1.BookingService, session_service_1.SessionService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map