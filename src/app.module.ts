// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MentorsModule } from './mentors/mentors.module';
//import { NotificationsModule } from './notifications/notifications.module';
//import { HelpRequestsModule } from './help-requests/help-requests.module';

@Module({
  imports: [
    // ConfigModule
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),

    // Function module
    AuthModule,
    UsersModule,
    MentorsModule,
    //NotificationsModule,
    //HelpRequestsModule,
  ],
})
export class AppModule {}
