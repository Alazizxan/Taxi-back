import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver } from './schemas/driver.schema';

@Injectable()
export class DriverCronService {
  constructor(
    @InjectModel(Driver.name)
    private driverModel: Model<Driver>,
  ) {}

  // 🔁 har 1 daqiqada
  @Cron('*/1 * * * *')
  async autoOfflineDrivers() {
    const threshold = new Date(Date.now() - 60 * 1000); // 1 min

    await this.driverModel.updateMany(
      {
        online: true,
        lastSeenAt: { $lt: threshold },
      },
      {
        $set: { online: false },
      },
    );
  }
}
