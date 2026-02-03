import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Driver, DriverSchema } from '../drivers/schemas/driver.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Driver.name, schema: DriverSchema },
    ]),
  ],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
