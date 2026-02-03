import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Vehicle } from './schemas/vehicle.schema';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name)
    private readonly vehicleModel: Model<Vehicle>,
  ) {}

  async create(driverId: string, data: {
    model: string;
    color: string;
    plateNumber: string;
  }) {
    const exists = await this.vehicleModel.findOne({ driverId });
    if (exists) {
      throw new BadRequestException('Vehicle already exists');
    }

    return this.vehicleModel.create({
      driverId,
      ...data,
    });
  }

  async getByDriver(driverId: string) {
    const vehicle = await this.vehicleModel.findOne({ driverId });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }
    return vehicle;
  }
}
