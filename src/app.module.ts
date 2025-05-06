// import { Module } from '@nestjs/common';
// import { BookingsModule } from './bookings/bookings.module';
// import { CalendarModule } from './calendar/calendar.module';
// import { RoomsModule } from './rooms/rooms.module';
// import { SessionsModule } from './sessions/sessions.module';

// @Module({
//   imports: [BookingsModule, CalendarModule, RoomsModule, SessionsModule],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { BookingsModule } from './bookings/bookings.module'; // 加上这一行
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    BookingsModule,
  ],
})
export class AppModule {}
