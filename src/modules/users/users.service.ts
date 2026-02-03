import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateLocation(
    userId: string,
    lng: number,
    lat: number,
  ) {
    return this.userModel.findByIdAndUpdate(
      userId,
      {
        lastLocation: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      },
      { new: true },
    );
  }
}
