// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import Configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// import { MentorsModule } from './mentors/mentors.module';
// import { NotificationsModule } from './notifications/notifications.module';
// import { HelpRequestsModule } from './help-requests/help-requests.module';
import { BookingsModule } from './bookings/bookings.module';
import { RoomsModule } from './rooms/rooms.module';
import { SessionsModule } from './sessions/sessions.module';
import { CalendarModule } from './calendar/calendar.module';
import { VoiceModule } from './voice/voice.module';
import { StudyGroupsModule } from './study-groups/study-groups.module';
import { ChatModule } from './chat/chat.module';
import { WebRTCModule } from './webrtc/webrtc.module';

@Module({
  imports: [
    //
    ConfigModule.forRoot({
      isGlobal: true,
      load: [Configuration],
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: process.env.DATABASE_URI ,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),

    //function module
    AuthModule,
    UsersModule,
    // // MentorsModule,
    // NotificationsModule,
    // HelpRequestsModule,
    BookingsModule,
    RoomsModule,
    SessionsModule,
    CalendarModule,
    VoiceModule,
    StudyGroupsModule,
    ChatModule,
    WebRTCModule,
  ],
})
export class AppModule {}