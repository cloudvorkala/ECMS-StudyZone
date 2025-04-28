import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Availability } from '../models/availability.model';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Availability.name) private availabilityModel: Model<Availability>,
  ) {}

  createAvailability(data: Partial<Availability>) {
    return this.availabilityModel.create(data);
  }

  getAvailabilityByMentor(mentorId: string) {
    return this.availabilityModel.findOne({ mentorId });
  }
}
