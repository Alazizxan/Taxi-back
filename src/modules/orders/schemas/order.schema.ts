import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Driver' })
  driverId?: Types.ObjectId;

  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  })
  pickupLocation: {
    type: string;
    coordinates: number[];
  };

  @Prop({ required: true })
  destinationText: string;

  @Prop({ required: true })
  estimatedPrice: number;

  @Prop({ default: null })
  finalPrice?: number;


  @Prop({ required: true })
  estimatedTimeMin: number;

  @Prop({ default: [] })
  rejectedDrivers: string[];

  @Prop({
    type: Types.ObjectId,
    ref: 'Driver',
    default: null,
  })
  currentDriverId: Types.ObjectId | null;


  @Prop({ default: 0 })
  waitingMinutes: number;

  @Prop({
    type: Date,
    default: null,
  })
  waitingStartedAt: Date | null;




  @Prop({ type: Date, default: null })
  offerExpiresAt: Date | null;

  @Prop({ default: 0 })
  actualDistanceKm: number;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
    },
  })
  lastDriverLocation?: {
    type: 'Point';
    coordinates: number[];
  };






  @Prop({
    default: 'requested',
    enum: ['requested', 'accepted', 'arrived', 'started', 'finished', 'cancelled'],
  })
  status: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
