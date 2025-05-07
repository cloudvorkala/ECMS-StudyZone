import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { Model } from 'mongoose';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  constructor(@InjectModel(Room.name) private model: Model<RoomDocument>) {}

  create(dto: CreateRoomDto) {
    return new this.model(dto).save();
  }

  findAll() {
    return this.model.find().exec();
  }
}
