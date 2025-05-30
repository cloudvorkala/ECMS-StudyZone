import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyGroupsService } from './study-groups.service';
import { StudyGroupsController } from './study-groups.controller';
import { StudyGroup, StudyGroupSchema } from './schemas/study-group.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StudyGroup.name, schema: StudyGroupSchema }]),
    UsersModule,
  ],
  controllers: [StudyGroupsController],
  providers: [StudyGroupsService],
  exports: [StudyGroupsService],
})
export class StudyGroupsModule {}