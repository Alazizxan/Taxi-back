import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../users/schemas/user.schema';
import { Driver } from '../drivers/schemas/driver.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Driver.name) private driverModel: Model<Driver>,
    private jwtService: JwtService,
  ) { }

  async registerUser(data: {
    name: string;
    phone: string;
    telegramId: number;
  }) {
    const exists = await this.userModel.findOne({
      $or: [
        { phone: data.phone },
        { telegramId: data.telegramId },
      ],
    });

    if (exists) {
      throw new BadRequestException('User exists');
    }

    const user = await this.userModel.create({
      name: data.name,
      phone: data.phone,
      telegramId: data.telegramId,

      // ❌ password YO‘Q

      lastLocation: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });

    return {
      token: this.jwtService.sign({
        id: user._id,
        role: 'user',
      }),
    };
  }


  async loginUser(phone: string, password: string) {
    const user = await this.userModel.findOne({ phone });
    if (!user) throw new BadRequestException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new BadRequestException('Invalid credentials');

    return { token: this.jwtService.sign({ id: user._id, role: 'user' }) };
  }

  async registerDriver(data: { name: string; phone: string; password: string }) {
    const exists = await this.driverModel.findOne({ phone: data.phone });
    if (exists) throw new BadRequestException('Driver exists');

    const hash = await bcrypt.hash(data.password, 10);

    const driver = await this.driverModel.create({
      ...data,
      password: hash,
      location: {
        type: 'Point',
        coordinates: [0, 0],
      },
    });

    return { token: this.jwtService.sign({ id: driver._id, role: 'driver' }) };
  }

  async loginDriver(phone: string, password: string) {
    const driver = await this.driverModel.findOne({ phone });
    if (!driver) throw new BadRequestException('Invalid credentials');

    const ok = await bcrypt.compare(password, driver.password);
    if (!ok) throw new BadRequestException('Invalid credentials');

    return { token: this.jwtService.sign({ id: driver._id, role: 'driver' }) };
  }

  async telegramAuth(data: {
    telegramId: number;
    name: string;
    phone?: string;
  }) {
    let user = await this.userModel.findOne({
      telegramId: data.telegramId,
    });

    if (!user) {
      user = await this.userModel.create({
        name: data.name,
        phone: data.phone ?? `tg_${data.telegramId}`,
        telegramId: data.telegramId,
        lastLocation: {
          type: 'Point',
          coordinates: [0, 0],
        },
      });
    }

    return {
      token: this.jwtService.sign({
        id: user._id,
        role: 'user',
      }),
    };
  }



}
