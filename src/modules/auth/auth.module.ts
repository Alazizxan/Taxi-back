import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.starategy';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Driver, DriverSchema } from '../drivers/schemas/driver.schema';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Driver.name, schema: DriverSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES') as any,
        },
      }),
    }),

  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule { }
