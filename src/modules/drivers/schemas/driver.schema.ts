import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DriverDocument = Driver & Document;

@Schema({ timestamps: true })
export class Driver {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  online: boolean;

  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0],
    },
  })
  location: {
    type: string;
    coordinates: number[];
  };

  @Prop({ default: null })
  lastSeenAt: Date;


  @Prop({ default: 0 })
  walletBalance: number;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);

// ✅ GEO INDEX
DriverSchema.index({ location: '2dsphere' });
