import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VoiceRoom, VoiceRoomSchema } from './schemas/room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VoiceRoom.name, schema: VoiceRoomSchema }])
  ],
  controllers: [VoiceController],
  providers: [VoiceService],
})
export class VoiceModule {}