import mongoose, { Schema } from 'mongoose';
import { Restaurant, OperatingHours } from './interfaces';

const operatingHoursSchema = new Schema<OperatingHours>({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  open: { type: String, required: function() { return !this.isClosed; } },
  close: { type: String, required: function() { return !this.isClosed; } },
  isClosed: { type: Boolean, default: false }
});

const restaurantSchema = new Schema<Restaurant>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  cuisineTypes: [{ type: String, required: true }],
  images: {
    logo: { type: String, default: '' },
    cover: { type: String, default: '' },
    gallery: [{ type: String }]
  },
  licenseNumber: String,
  restaurantType: {
    type: String,
    enum: ['veg', 'non-veg', 'mixed'],
    default: 'mixed',
    required: true,
  },
  address: {
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  operatingHours: [operatingHoursSchema],
  contactInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String }
  },
  isVerified: { type: Boolean, default: false },
  serviceModes: [{ type: String, enum: ['dine-in', 'takeaway', 'delivery'] }],
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  featuredItems: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const RestaurantModel = mongoose.model<Restaurant>('Restaurant', restaurantSchema);

