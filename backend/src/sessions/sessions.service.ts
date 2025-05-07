import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session, SessionDocument } from './schemas/session.schema';
import { Model } from 'mongoose';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(@InjectModel(Session.name) private model: Model<SessionDocument>) {}

  create(dto: CreateSessionDto, userId: string) {
    const sessionData = { ...dto, createdBy: userId }; // Assuming the session schema has a field 'createdBy' to store the user ID
    return new this.model(sessionData).save();
  }
  
  findAllByUser(userId: string) {
    return this.model.find({ createdBy: userId }).exec(); // or use bookingId to match user indirectly
  }
  
  findOneIfOwnedByUser(id: string, userId: string) {
    return this.model.findOne({ _id: id, createdBy: userId }).exec();
  }
  
}
