import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryBoy extends Document {
  name: string;
  phone?: string;
  isAvailable: boolean;
  currentLocation: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  activeOrdersCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const DeliveryBoySchema = new Schema<IDeliveryBoy>(
  {
    name: { type: String, required: true },
    phone: { type: String },
    isAvailable: { type: Boolean, default: true, index: true },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    activeOrdersCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 2dsphere index for geo queries
DeliveryBoySchema.index({ currentLocation: '2dsphere' });

export default mongoose.model<IDeliveryBoy>('DeliveryBoy', DeliveryBoySchema);
