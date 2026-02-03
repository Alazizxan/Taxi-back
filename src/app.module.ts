import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { DriversModule } from './modules/drivers/drivers.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { WalletModule } from './modules/wallet/wallet.module';

import { ScheduleModule } from '@nestjs/schedule';









@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),



    // 🔥 MongoDB ALWAYS FIRST
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    // 🔥 Feature modules AFTER DB
    AuthModule,
    UsersModule,
    OrdersModule,
    DriversModule,
    VehiclesModule,
    WalletModule,

  ],
  


  
})





export class AppModule { }
