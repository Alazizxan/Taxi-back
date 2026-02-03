import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Driver, DriverSchema } from '../drivers/schemas/driver.schema';
import { PricingService } from '../pricing/pricing.service';
import { Vehicle, VehicleSchema } from '../vehicles/schemas/vehicle.schema';




@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: Vehicle.name, schema: VehicleSchema },
    ]),
  ],
  providers: [OrdersService, PricingService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule { }
