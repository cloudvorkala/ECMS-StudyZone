import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Availability, AvailabilitySchema } from './models/availability.model';
import { Booking, BookingSchema } from './models/booking.model';
import { Session, SessionSchema } from './models/session.model';
import { AvailabilityController } from './controllers/availability.controller';
import { BookingController } from './controllers/booking.controller';
import { SessionController } from './controllers/session.controller';
import { AvailabilityService } from './services/availability.service';
import { BookingService } from './services/booking.service';
import { SessionService } from './services/session.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.DB_URI as string),
    MongooseModule.forFeature([
      { name: Availability.name, schema: AvailabilitySchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
  ],
  controllers: [
    AppController,
    AvailabilityController,
    BookingController,
    SessionController,
  ],
  providers: [AppService, AvailabilityService, BookingService, SessionService],
})
export class AppModule {}
