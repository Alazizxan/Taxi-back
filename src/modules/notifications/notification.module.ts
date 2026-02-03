import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AppNotification,
  AppNotificationSchema,
} from './schemas/notification.schema';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AppNotification.name,
        schema: AppNotificationSchema,
      },
    ]),
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
