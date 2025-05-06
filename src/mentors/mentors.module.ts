// src/mentors/mentors.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MentorsController } from './mentors.controller';
import { MentorsService } from './mentors.service';
import { Mentor, MentorSchema } from './schemas/mentor.schema';
import {
  Availability,
  AvailabilitySchema,
} from './schemas/availability.schema';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Mentor.name, schema: MentorSchema },
      { name: Availability.name, schema: AvailabilitySchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
  controllers: [MentorsController],
  providers: [MentorsService],
  exports: [MentorsService],
})
export class MentorsModule {}
