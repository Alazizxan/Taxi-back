import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppNotificationDocument = AppNotification & Document;

@Schema({ timestamps: true })
export class AppNotification {
  @Prop({
    required: true,
    enum: ['user', 'driver'],
  })
  targetType: 'user' | 'driver';

  @Prop({
    type: Types.ObjectId,
    required: true,
  })
  targetId: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object, default: {} })
  payload: Record<string, any>;

  @Prop({ default: false })
  delivered: boolean;
}

export const AppNotificationSchema =
  SchemaFactory.createForClass(AppNotification);
