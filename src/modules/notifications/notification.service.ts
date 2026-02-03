import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AppNotification,
  AppNotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(AppNotification.name)
    private readonly notificationModel: Model<AppNotificationDocument>,
  ) {}

  async create(data: {
    targetType: 'user' | 'driver';
    targetId: string | Types.ObjectId;
    type: string;
    payload?: Record<string, any>;
  }) {
    return this.notificationModel.create({
      targetType: data.targetType,
      targetId: new Types.ObjectId(data.targetId),
      type: data.type,
      payload: data.payload ?? {},
      delivered: false,
    });
  }

  async getForTarget(
    targetType: 'user' | 'driver',
    targetId: string,
  ) {
    return this.notificationModel
      .find({
        targetType,
        targetId,
        delivered: false,
      })
      .sort({ createdAt: -1 });
  }

  async markDelivered(id: string) {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { delivered: true },
      { new: true },
    );
  }
}
