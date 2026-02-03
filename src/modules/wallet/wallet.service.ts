import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Driver } from '../drivers/schemas/driver.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Driver.name)
    private readonly driverModel: Model<Driver>,
  ) {}

  /**
   * 💳 WALLET TOP-UP
   * balance > 0 → online = true
   */
  async topUp(driverId: string, amount: number) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.walletBalance = (driver.walletBalance || 0) + amount;

    if (driver.walletBalance > 0) {
      driver.online = true;
    }

    await driver.save();

    return {
      walletBalance: driver.walletBalance,
      online: driver.online,
    };
  }

  /**
   * 🔻 DEBIT (commission)
   * agar balance tugasa → offline
   */
  async debit(driverId: string, amount: number) {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    if (!driver.walletBalance || driver.walletBalance < amount) {
      driver.online = false;
      await driver.save();

      throw new BadRequestException(
        'Insufficient balance. Please top up your wallet',
      );
    }

    driver.walletBalance -= amount;

    if (driver.walletBalance <= 0) {
      driver.walletBalance = 0;
      driver.online = false;
    }

    await driver.save();

    return {
      walletBalance: driver.walletBalance,
      online: driver.online,
    };
  }

  /**
   * 👀 BALANCE CHECK
   */
  async getBalance(driverId: string) {
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return {
      walletBalance: driver.walletBalance || 0,
      online: driver.online,
    };
  }
}
