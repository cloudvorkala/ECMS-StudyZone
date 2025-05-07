import { Injectable } from '@nestjs/common';

@Injectable()
export class CalendarService {
  getAvailabilityForMentor(mentorId: string) {
    // TODO: 查询 availability 模型，返回 mentor 的时间段
    return { mentorId, availableSlots: [] };
  }
}
