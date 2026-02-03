import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ unique: true, sparse: true })
  telegramId?: number;

  @Prop({ required: false })
  password?: string;


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
  lastLocation: {
    type: string;
    coordinates: number[];
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// ✅ GEO INDEX TO‘G‘RI USULDA
UserSchema.index({ lastLocation: '2dsphere' });
