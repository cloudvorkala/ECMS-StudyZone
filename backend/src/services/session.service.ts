import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from '../models/session.model';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  createSession(data: Partial<Session>) {
    return this.sessionModel.create(data);
  }

  getSessionsByMentor(mentorId: string) {
    return this.sessionModel.find({ mentorId });
  }
}
