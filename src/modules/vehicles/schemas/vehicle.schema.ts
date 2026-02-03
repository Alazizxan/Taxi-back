import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true, unique: true })
  driverId: Types.ObjectId;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true, unique: true })
  plateNumber: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
