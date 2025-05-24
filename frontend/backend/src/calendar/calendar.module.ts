import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { TimeSlot, TimeSlotSchema } from './schemas/time-slot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TimeSlot.name, schema: TimeSlotSchema }])
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService]
})
export class CalendarModule {}
