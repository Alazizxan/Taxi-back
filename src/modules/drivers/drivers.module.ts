import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver, DriverSchema } from './schemas/driver.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { OrdersModule } from '../orders/orders.module';
import { PricingModule } from '../pricing/pricing.module';
import { WalletModule } from '../wallet/wallet.module';
import { CommissionModule } from '../commission/commision.module';
import { NotificationModule } from '../notifications/notification.module';

import { DriverCronService } from './driver-corn.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Driver.name, schema: DriverSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    PricingModule,
    WalletModule,
    CommissionModule,
    OrdersModule,
    NotificationModule,
  ],
  providers: [
    DriversService,
    DriverCronService,
  ],
  controllers: [DriversController],
})
export class DriversModule { }
