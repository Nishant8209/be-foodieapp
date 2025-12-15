import mongoose, { ObjectId, Schema } from 'mongoose';



export interface Restaurant {
  _id: ObjectId;
  name: string;
  description: string;
  cuisineTypes: string[];
  images: {
    logo: string;
    cover: string;
    gallery: string[];
  };
  licenseNumber?: string;
   restaurantType: 'veg' | 'non-veg' | 'mixed';
    acceptingOrders:boolean;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    location: {   // Rename from 'coordinates' to 'location' (recommended)
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number],   // [longitude, latitude]
      required: true
    }
  }
  };
 
  operatingHours: OperatingHours[];
  contactInfo: {
    name:string;
    phone: string;
    email: string;
    website?: string;
  };
  serviceModes: ('dine-in' | 'takeaway' | 'delivery')[];
  averageRating: number;
  totalRatings: number;
  isVerified: boolean;
  featuredItems: ObjectId[]; // References to MenuItem
  isActive: boolean;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  open: string; // HH:MM format
  close: string; // HH:MM format
  isClosed: boolean;
}

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
    location: {   // Rename from 'coordinates' to 'location' (recommended)
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number],   // [longitude, latitude]
        required: true
      }
    }
  },
 
  contactInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String }
  },
  isVerified: { type: Boolean, default: false },
  serviceModes: [{ type: String, enum: ['dine-in', 'takeaway', 'delivery'] }],
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  acceptingOrders: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  featuredItems: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


restaurantSchema.index({ "address.location": "2dsphere" });
export const RestaurantModel = mongoose.model<Restaurant>('Restaurant', restaurantSchema);

